import json
from datetime import date, datetime
from app.agent.llm import get_llm
from app.agent.state import AgentState
from app.db.database import SessionLocal
from app.db.models import Interaction, FollowUp


def _llm_json(prompt: str) -> dict:
    llm = get_llm()
    response = llm.invoke(prompt)
    text = response.content.strip()
    # Extract JSON block if wrapped in markdown
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    try:
        return json.loads(text.strip())
    except Exception:
        return {}


def log_interaction(state: AgentState) -> AgentState:
    today = date.today().isoformat()
    now = datetime.now().strftime("%I:%M %p")

    prompt = f"""You are a CRM data extraction assistant. Extract interaction details from the user message below.
Return ONLY a valid JSON object with these exact keys (use null for missing values):
{{
  "hcp_name": string or null,
  "interaction_type": one of ["Meeting","Call","Email","Conference/Event"] or null,
  "date": "YYYY-MM-DD" or null (default to today: {today} if not mentioned),
  "time": "HH:MM AM/PM" or null (default to {now} if not mentioned),
  "attendees": string or null,
  "topics_discussed": string or null,
  "materials_shared": string or null,
  "samples_distributed": string or null,
  "sentiment": one of ["Positive","Neutral","Negative"] (infer from tone, default "Neutral"),
  "outcomes": string or null
}}

User message: "{state['message']}"

Return ONLY the JSON object, no explanation."""

    extracted = _llm_json(prompt)

    # Persist to DB
    db = SessionLocal()
    try:
        interaction = Interaction(
            hcp_name=extracted.get("hcp_name"),
            interaction_type=extracted.get("interaction_type"),
            date=extracted.get("date"),
            time=extracted.get("time"),
            attendees=extracted.get("attendees"),
            topics_discussed=extracted.get("topics_discussed"),
            materials_shared=extracted.get("materials_shared"),
            samples_distributed=extracted.get("samples_distributed"),
            sentiment=extracted.get("sentiment"),
            outcomes=extracted.get("outcomes"),
        )
        db.add(interaction)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

    filled = [k for k, v in extracted.items() if v is not None]
    fields_str = ", ".join(filled) if filled else "the provided details"

    reply = (
        f"✅ Interaction logged successfully! The details ({fields_str}) have been automatically "
        f"populated based on your summary. Would you like me to suggest a specific follow-up action, "
        f"such as scheduling a meeting?"
    )

    return {**state, "updated_fields": extracted, "chat_reply": reply, "tool_used": "log_interaction"}


def edit_interaction(state: AgentState) -> AgentState:
    current = json.dumps(state.get("form_state", {}), indent=2)

    prompt = f"""You are a CRM correction assistant. The user wants to correct an existing interaction.
Current interaction state:
{current}

User correction: "{state['message']}"

Return ONLY a valid JSON object containing ONLY the fields that should change (do not include unchanged fields).
Use the same field names: hcp_name, interaction_type, date, time, attendees, topics_discussed,
materials_shared, samples_distributed, sentiment, outcomes.

Return ONLY the JSON object, no explanation."""

    changes = _llm_json(prompt)

    # Update DB — find latest interaction
    db = SessionLocal()
    try:
        latest = db.query(Interaction).order_by(Interaction.id.desc()).first()
        if latest:
            for k, v in changes.items():
                if hasattr(latest, k) and v is not None:
                    setattr(latest, k, v)
            db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

    if changes:
        change_desc = ", ".join([f"{k} → {v}" for k, v in changes.items()])
        reply = f"✅ Interaction updated! Changed: {change_desc}. All other fields remain unchanged."
    else:
        reply = "I couldn't identify what to change. Could you clarify what needs to be corrected?"

    return {**state, "updated_fields": changes, "chat_reply": reply, "tool_used": "edit_interaction"}


def fetch_hcp_history(state: AgentState) -> AgentState:
    # Extract HCP name from message or form state
    hcp_from_form = state.get("form_state", {}).get("hcp_name", "")

    prompt = f"""Extract the HCP (doctor/healthcare professional) name from this message.
If no name is found, return {{"hcp_name": null}}.
Message: "{state['message']}"
Current form HCP: "{hcp_from_form}"
Return ONLY JSON: {{"hcp_name": "name or null"}}"""

    extracted = _llm_json(prompt)
    hcp_name = extracted.get("hcp_name") or hcp_from_form

    if not hcp_name:
        return {**state, "updated_fields": {}, "chat_reply": "Please specify which HCP's history you'd like to see.", "tool_used": "fetch_hcp_history"}

    db = SessionLocal()
    try:
        records = (
            db.query(Interaction)
            .filter(Interaction.hcp_name.ilike(f"%{hcp_name}%"))
            .order_by(Interaction.id.desc())
            .limit(5)
            .all()
        )
        history = [
            {
                "date": str(r.date) if r.date else "N/A",
                "interaction_type": r.interaction_type or "N/A",
                "topics_discussed": r.topics_discussed or "N/A",
                "sentiment": r.sentiment or "N/A",
                "outcomes": r.outcomes or "N/A",
            }
            for r in records
        ]
    finally:
        db.close()

    if not history:
        return {**state, "updated_fields": {}, "chat_reply": f"No previous interactions found for {hcp_name}.", "tool_used": "fetch_hcp_history"}

    history_str = json.dumps(history, indent=2)
    summary_prompt = f"""Summarize these past HCP interactions in 2-3 concise sentences for a field rep:
{history_str}
Be specific about dates, topics, and sentiment. Start with "Here's the history for {hcp_name}:"."""

    llm = get_llm()
    summary = llm.invoke(summary_prompt).content.strip()

    return {**state, "updated_fields": {}, "chat_reply": summary, "tool_used": "fetch_hcp_history"}


def schedule_followup(state: AgentState) -> AgentState:
    today = date.today().isoformat()

    prompt = f"""You are a CRM scheduling assistant. Extract follow-up details from the user message.
Today's date is {today}.
Return ONLY a valid JSON object:
{{
  "action_description": string,
  "due_date": "YYYY-MM-DD" (resolve relative dates like "next month", "in 2 weeks" from today {today}),
  "action_type": one of ["Meeting","Email","Sample Drop","Send Info","Call","Schedule Next Visit"]
}}

User message: "{state['message']}"
Return ONLY the JSON object, no explanation."""

    extracted = _llm_json(prompt)

    db = SessionLocal()
    try:
        latest = db.query(Interaction).order_by(Interaction.id.desc()).first()
        interaction_id = latest.id if latest else None
        followup = FollowUp(
            interaction_id=interaction_id,
            action_description=extracted.get("action_description"),
            due_date=extracted.get("due_date"),
            action_type=extracted.get("action_type"),
        )
        db.add(followup)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

    due = extracted.get("due_date", "the specified date")
    action = extracted.get("action_description", "follow-up")
    atype = extracted.get("action_type", "")

    reply = f"✅ Follow-up scheduled! {atype}: \"{action}\" — due on {due}. This has been added to the Follow-up Actions section."

    followup_entry = {
        "description": extracted.get("action_description", ""),
        "due_date": extracted.get("due_date", ""),
        "type": extracted.get("action_type", ""),
    }

    return {**state, "updated_fields": {"followUps": [followup_entry]}, "chat_reply": reply, "tool_used": "schedule_followup"}


def compliance_check(state: AgentState) -> AgentState:
    form = state.get("form_state", {})
    form_str = json.dumps(form, indent=2)

    prompt = f"""You are a pharma CRM compliance checker. Review this interaction for compliance issues.
Rules to check:
1. Required fields: hcp_name, date, sentiment must not be empty/null.
2. Topics or outcomes must not contain off-label or unapproved drug claims.
3. Samples distributed should not mention quantities exceeding 5 units per visit.
4. No promotional language for unapproved indications.

Interaction data:
{form_str}

Return ONLY a valid JSON object:
{{
  "compliant": true or false,
  "issues": ["list of issue descriptions"] or [],
  "summary": "one sentence summary"
}}"""

    result = _llm_json(prompt)

    compliant = result.get("compliant", True)
    issues = result.get("issues", [])
    summary = result.get("summary", "Compliance check complete.")

    if compliant:
        reply = f"✅ No compliance issues found. {summary}"
    else:
        issues_str = "\n".join([f"⚠️ {i}" for i in issues])
        reply = f"⚠️ Compliance issues detected:\n{issues_str}\n\n{summary}"

    return {**state, "updated_fields": {}, "chat_reply": reply, "tool_used": "compliance_check"}

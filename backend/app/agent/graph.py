from langgraph.graph import StateGraph, END
from app.agent.state import AgentState
from app.agent.llm import get_llm
from app.agent.tools import (
    log_interaction,
    edit_interaction,
    fetch_hcp_history,
    schedule_followup,
    compliance_check,
)


def router_node(state: AgentState) -> AgentState:
    llm = get_llm()
    prompt = f"""Classify the user's intent into exactly one of these categories:
- "log"        — user is describing a new HCP interaction/visit to log
- "edit"       — user is correcting or updating an already-described interaction
- "history"    — user wants to see past interactions or history for an HCP
- "followup"   — user wants to schedule a follow-up action or reminder
- "compliance" — user wants a compliance check on the current interaction

User message: "{state['message']}"

Return ONLY one word from the list above. No explanation."""

    intent = llm.invoke(prompt).content.strip().lower().split()[0]
    valid = {"log", "edit", "history", "followup", "compliance"}
    if intent not in valid:
        intent = "log"

    return {**state, "intent": intent}


def route_by_intent(state: AgentState) -> str:
    return state.get("intent", "log")


def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("router", router_node)
    graph.add_node("log_interaction", log_interaction)
    graph.add_node("edit_interaction", edit_interaction)
    graph.add_node("fetch_hcp_history", fetch_hcp_history)
    graph.add_node("schedule_followup", schedule_followup)
    graph.add_node("compliance_check", compliance_check)

    graph.set_entry_point("router")

    graph.add_conditional_edges(
        "router",
        route_by_intent,
        {
            "log": "log_interaction",
            "edit": "edit_interaction",
            "history": "fetch_hcp_history",
            "followup": "schedule_followup",
            "compliance": "compliance_check",
        },
    )

    graph.add_edge("log_interaction", END)
    graph.add_edge("edit_interaction", END)
    graph.add_edge("fetch_hcp_history", END)
    graph.add_edge("schedule_followup", END)
    graph.add_edge("compliance_check", END)

    return graph.compile()


compiled_graph = build_graph()

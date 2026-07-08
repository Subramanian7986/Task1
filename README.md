# HCP CRM — AI-First Interaction Logger

An AI-first "Log Interaction Screen" for a pharma/life-sciences CRM. Field reps describe their HCP visits in plain English via a chat panel, and a LangGraph agent powered by Groq's `llama-3.3-70b-versatile` LLM automatically extracts, validates, and populates a structured form — no manual form-filling required.

---

## What It Does

- Field rep types a natural language message like *"Today I met with Dr. Smith and discussed Product X. Sentiment was positive."*
- A LangGraph agent classifies the intent and routes it to the correct tool
- The tool calls the Groq LLM to extract structured data
- The form on the left auto-populates instantly via Redux
- All interactions are persisted to PostgreSQL

---

## Architecture

```
User (chat input)
    ↓
React + Redux Frontend
    ↓  POST /api/chat  { message, form_state }
FastAPI Backend
    ↓
LangGraph StateGraph
    ├── Router Node        → Groq LLM classifies intent
    ├── Log Interaction    → extracts fields → PostgreSQL
    ├── Edit Interaction   → diffs + updates fields → PostgreSQL
    ├── Fetch HCP History  → queries DB → LLM summarizes
    ├── Schedule Follow-up → resolves dates → PostgreSQL
    └── Compliance Check   → LLM audits form state
    ↓
{ chat_reply, updated_fields, tool_used }
    ↓
Redux dispatch → form auto-populates
```

---

## The 5 LangGraph Tools

| Tool | Description |
|---|---|
| **Log Interaction** | Extracts all form fields from a natural-language description and saves a new interaction |
| **Edit Interaction** | Updates only the fields mentioned in a correction, leaves everything else untouched |
| **Fetch HCP History** | Queries past interactions for an HCP and returns an LLM-generated summary in chat |
| **Schedule Follow-up** | Resolves relative dates and adds a follow-up action to the form and database |
| **Compliance Check** | Audits the current interaction against pharma compliance rules and flags any issues |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Redux Toolkit + Vite |
| Backend | Python + FastAPI |
| Agent | LangGraph |
| LLM | Groq API — `llama-3.3-70b-versatile` |
| Database | PostgreSQL + SQLAlchemy |
| Font | Google Inter |

---

## Setup & Running

### Prerequisites
- Python 3.12+
- Node 18+
- PostgreSQL running locally
- Groq API key from https://console.groq.com/keys

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
copy .env.example .env
# Open .env and fill in your GROQ_API_KEY and DATABASE_URL

# Start the server (tables are auto-created on startup)
uvicorn app.main:app --reload
# Runs on http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/hcp_crm
MODEL_NAME=llama-3.3-70b-versatile
```

---

## Testing Each Tool

Open http://localhost:5173 and paste these prompts into the chat panel:

### 1. Log Interaction
```
Today I met with Dr. Sarah Johnson and discussed the efficacy of Product X for hypertension management. The sentiment was very positive. I shared the clinical brochures and distributed 3 sample packs. Outcomes were that she agreed to prescribe for 5 new patients.
```
→ All form fields auto-populate, green ✅ bubble appears

### 2. Edit Interaction
```
Actually it was Dr. Sarah Chen, not Dr. Sarah Johnson. Please correct the name.
```
→ Only HCP Name updates, all other fields stay unchanged

### 3. Fetch HCP History
```
Can you show me the interaction history for Dr. Sarah Chen?
```
→ Past interactions summarized in chat, form unchanged

### 4. Schedule Follow-up
```
Please schedule a follow-up meeting with Dr. Chen in 2 weeks to discuss the trial results.
```
→ Relative date resolved, follow-up card appears at bottom of form

### 5. Compliance Check
```
Run a compliance check on the current interaction.
```
→ Green ✅ clean pass or ⚠️ flagged warnings

---

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + CORS + startup
│   │   ├── config.py            # env vars
│   │   ├── agent/
│   │   │   ├── graph.py         # LangGraph StateGraph + router
│   │   │   ├── tools.py         # 5 tool functions (all LLM-driven)
│   │   │   ├── llm.py           # ChatGroq wrapper
│   │   │   └── state.py         # AgentState TypedDict
│   │   ├── db/
│   │   │   ├── database.py      # SQLAlchemy engine + session
│   │   │   ├── models.py        # Interaction + FollowUp tables
│   │   │   └── schemas.py       # Pydantic request/response models
│   │   └── routers/
│   │       └── chat.py          # POST /api/chat endpoint
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── components/
        │   ├── InteractionForm.jsx   # Left panel — read-only, Redux-driven
        │   ├── ChatPanel.jsx         # Right panel — chat input + messages
        │   └── ChatBubble.jsx        # Styled bubbles (assistant/user/success)
        ├── redux/
        │   ├── store.js
        │   ├── interactionSlice.js   # Form state + updateFields action
        │   └── chatSlice.js          # Chat history + loading state
        ├── api/
        │   └── chatApi.js            # POST /api/chat fetch wrapper
        └── App.jsx                   # Split-screen layout
```

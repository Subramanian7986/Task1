from typing import TypedDict, Optional, Any

class AgentState(TypedDict):
    message: str
    form_state: dict
    intent: str
    tool_result: dict
    chat_reply: str
    updated_fields: dict
    tool_used: str

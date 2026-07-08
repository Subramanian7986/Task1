from pydantic import BaseModel
from typing import Optional, Any

class ChatRequest(BaseModel):
    message: str
    form_state: Optional[dict] = {}

class ChatResponse(BaseModel):
    chat_reply: str
    updated_fields: dict
    tool_used: str

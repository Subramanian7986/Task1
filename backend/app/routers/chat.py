from fastapi import APIRouter
from app.db.schemas import ChatRequest, ChatResponse
from app.agent.graph import compiled_graph

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    initial_state = {
        "message": request.message,
        "form_state": request.form_state or {},
        "intent": "",
        "tool_result": {},
        "chat_reply": "",
        "updated_fields": {},
        "tool_used": "",
    }
    result = compiled_graph.invoke(initial_state)
    return ChatResponse(
        chat_reply=result.get("chat_reply", ""),
        updated_fields=result.get("updated_fields", {}),
        tool_used=result.get("tool_used", ""),
    )

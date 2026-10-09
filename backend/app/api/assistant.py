from typing import List, Dict, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.dependencies import get_current_user_optional
from app.models.user import User
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/assistant", tags=["CyberGuard AI Assistant"])


class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    scan_context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    reply: str
    model_used: str


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    payload: ChatRequest,
    user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Conversational AI Cybersecurity Assistant powered by Gemini with grounded rule fallback.
    Assists in understanding scan results, active breach response, and security hygiene.
    """
    if not payload.messages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chat history cannot be empty."
        )

    # Convert to dict format
    msg_dicts = [{"role": m.role, "content": m.content} for m in payload.messages]

    result = await gemini_service.chat_assistant(
        messages=msg_dicts,
        scan_context=payload.scan_context
    )

    return ChatResponse(
        reply=result.get("reply", "Security advisor response ready."),
        model_used=result.get("model_used", "CyberGuard Grounded Engine")
    )

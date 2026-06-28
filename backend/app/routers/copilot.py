from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Dict

from backend.app.database import get_db
from backend.app.schemas.copilot import (
    CopilotChatRequest,
    CopilotMessageResponse,
    CopilotSessionResponse,
    CopilotActionResponse,
    CopilotSuggestionsResponse
)
from backend.app.services.auth_service import get_current_user
from backend.app.services.copilot_service import CopilotService
from backend.app.models.user import User
from backend.app.models.copilot import CopilotSession, CopilotAction

router = APIRouter(prefix="/copilot", tags=["AI Copilot"])

@router.post("/chat", response_model=CopilotMessageResponse, status_code=status.HTTP_201_CREATED)
def chat_with_copilot(
    payload: CopilotChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a message to the AI Copilot. Creates a new session if session_id is omitted.
    """
    session_id = payload.session_id
    if session_id is None:
        session = CopilotService.create_session(db, user_id=current_user.id)
        session_id = session.id
    else:
        session = db.query(CopilotSession).filter(
            CopilotSession.id == session_id,
            CopilotSession.user_id == current_user.id
        ).first()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Copilot session not found or access denied."
            )
            
    # Process user query through orchestrator
    message = CopilotService.process_query(
        db=db,
        session_id=session_id,
        user_id=current_user.id,
        query=payload.query
    )
    return message

@router.get("/sessions", response_model=List[CopilotSessionResponse])
def get_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all Copilot chat sessions for the authenticated user.
    """
    return CopilotService.get_user_sessions(db, current_user.id)

@router.get("/history", response_model=List[CopilotMessageResponse])
def get_chat_history(
    session_id: int = Query(..., description="The ID of the session to fetch messages for"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the message timeline history for a specific session.
    """
    session = db.query(CopilotSession).filter(
        CopilotSession.id == session_id,
        CopilotSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or access denied."
        )
    return CopilotService.get_session_messages(db, session_id)

@router.get("/session/{session_id}/actions", response_model=List[CopilotActionResponse])
def get_session_actions(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the audit log of sub-agent actions executed within a specific session.
    """
    session = db.query(CopilotSession).filter(
        CopilotSession.id == session_id,
        CopilotSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or access denied."
        )
    return db.query(CopilotAction).filter(CopilotAction.session_id == session_id).order_by(CopilotAction.created_at.asc()).all()

@router.get("/suggestions", response_model=CopilotSuggestionsResponse)
def get_suggestions():
    """
    Provide interactive prompt ideas to guide the buyer.
    """
    return CopilotSuggestionsResponse(
        suggestions=[
            "Find football shoes under ₹3000",
            "Show trusted sellers near me",
            "Find gaming laptops below ₹50,000",
            "Show safest listings",
            "Explain if listing #1 is overpriced",
            "Check if listing #2 is safe to buy"
        ]
    )

@router.get("/memory", response_model=Dict[str, str])
def get_memory(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve current personalized attributes/preferences saved in the Copilot memory cache.
    """
    return CopilotService.get_user_memory(db, current_user.id)

@router.delete("/session/{session_id}", status_code=status.HTTP_200_OK)
def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific copilot chat session.
    """
    session = db.query(CopilotSession).filter(
        CopilotSession.id == session_id,
        CopilotSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or access denied."
        )
    CopilotService.delete_session(db, session_id)
    return {"detail": "Session deleted successfully."}

@router.delete("/memory", status_code=status.HTTP_200_OK)
def clear_memory(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Clear all saved personalized attributes/preferences in user profile memory.
    """
    CopilotService.clear_memory(db, current_user.id)
    return {"detail": "Memory cleared successfully."}

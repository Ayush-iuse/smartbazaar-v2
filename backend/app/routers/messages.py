from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.schemas.conversation import ConversationCreate, ConversationResponse
from backend.app.schemas.message import MessageCreate, MessageResponse
from backend.app.services.auth_service import get_current_user
from backend.app.services.conversation_service import ConversationService
from backend.app.models.user import User

router = APIRouter(prefix="", tags=["Conversations"])

@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_200_OK)
def get_or_create_conversation(
    conv_in: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Initiate or fetch an existing conversation for a listing.
    Only buyers (non-owners) are allowed to start a conversation.
    """
    conversation = ConversationService.get_or_create_conversation(
        db=db,
        listing_id=conv_in.listing_id,
        buyer_id=current_user.id
    )
    
    # Map to schema output
    user_convs = ConversationService.get_user_conversations(db, current_user.id)
    for c in user_convs:
        if c["id"] == conversation.id:
            return c
            
    # Fallback response
    return conversation

@router.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all active conversations for the logged-in user.
    """
    return ConversationService.get_user_conversations(db=db, user_id=current_user.id)

@router.get("/messages", response_model=List[MessageResponse])
def get_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch the message history of a conversation.
    Only conversation participants are authorized to access this API.
    """
    return ConversationService.get_conversation_messages(
        db=db,
        conversation_id=conversation_id,
        user_id=current_user.id
    )

@router.post("/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    msg_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a message in a conversation.
    Only conversation participants are authorized.
    """
    return ConversationService.send_message(
        db=db,
        conversation_id=msg_in.conversation_id,
        sender_id=current_user.id,
        content=msg_in.content
    )

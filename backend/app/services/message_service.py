import json
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.app.models.message import Message
from backend.app.services.conversation_service import ConversationService

class MessageService:
    @staticmethod
    def send_message(
        db: Session,
        conversation_id: int,
        sender_id: int,
        content: Optional[str] = None,
        message_type: str = "text",
        media_url: Optional[str] = None
    ) -> Message:
        return ConversationService.send_message(
            db=db,
            conversation_id=conversation_id,
            sender_id=sender_id,
            content=content,
            message_type=message_type,
            media_url=media_url
        )

    @staticmethod
    def add_reaction(db: Session, message_id: int, user_id: int, emoji: str) -> Message:
        message = db.query(Message).filter(Message.id == message_id).first()
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")

        # Parse current reactions list
        try:
            reactions_list = json.loads(message.reactions)
        except Exception:
            reactions_list = []

        # Remove existing reaction from this user if present
        reactions_list = [r for r in reactions_list if r.get("user_id") != user_id]

        # Add new reaction
        reactions_list.append({"user_id": user_id, "emoji": emoji})

        # Save and commit
        message.reactions = json.dumps(reactions_list)
        db.commit()
        db.refresh(message)
        return message

    @staticmethod
    def search_messages(db: Session, conversation_id: int, query: str) -> List[Message]:
        return db.query(Message).filter(
            Message.conversation_id == conversation_id,
            Message.content.ilike(f"%{query}%")
        ).order_by(Message.created_at.asc()).all()

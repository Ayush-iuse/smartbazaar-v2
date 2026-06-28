from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.models.conversation import Conversation
from backend.app.models.message import Message
from backend.app.models.listing import Listing
from backend.app.models.user import User
from backend.app.services.unread_service import UnreadService
from backend.app.core.redis import redis_client

class ConversationService:
    @staticmethod
    def get_or_create_conversation(db: Session, listing_id: int, buyer_id: int) -> Conversation:
        # Fetch listing
        listing = db.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        
        # Enforce self-chat guard (403 as requested)
        if listing.seller_id == buyer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot chat with own listing"
            )
        
        # Check if conversation already exists
        conversation = db.query(Conversation).filter(
            Conversation.listing_id == listing_id,
            Conversation.buyer_id == buyer_id,
            Conversation.seller_id == listing.seller_id
        ).first()
        
        if not conversation:
            conversation = Conversation(
                listing_id=listing_id,
                buyer_id=buyer_id,
                seller_id=listing.seller_id
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
        
        return conversation

    @staticmethod
    def get_user_conversations(db: Session, user_id: int, archived: Optional[bool] = None, pinned: Optional[bool] = None):
        # Fetch conversations where user is buyer or seller
        query = db.query(Conversation).filter(
            (Conversation.buyer_id == user_id) | (Conversation.seller_id == user_id)
        )
        conversations = query.all()
        
        results = []
        for conv in conversations:
            is_buyer = conv.buyer_id == user_id
            
            # Determine archive/pin state for the current user
            is_archived = conv.is_archived_buyer if is_buyer else conv.is_archived_seller
            is_pinned = conv.is_pinned_buyer if is_buyer else conv.is_pinned_seller
            
            if archived is not None and is_archived != archived:
                continue
            if pinned is not None and is_pinned != pinned:
                continue
                
            # Determine other party
            other_party_id = conv.seller_id if is_buyer else conv.buyer_id
            other_party = db.query(User).filter(User.id == other_party_id).first()
            other_party_name = other_party.full_name if other_party else "Unknown User"
            
            # Fetch last message
            last_msg = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.desc()).first()
            
            # Fetch other party's presence status
            presence_val = redis_client.get(f"presence:{other_party_id}")
            other_party_online = presence_val == "online"
            
            # Get unread count from UnreadService
            unread = UnreadService.get_unread_count(conv.id, user_id)
            
            results.append({
                "id": conv.id,
                "listing_id": conv.listing_id,
                "buyer_id": conv.buyer_id,
                "seller_id": conv.seller_id,
                "is_archived_buyer": conv.is_archived_buyer,
                "is_archived_seller": conv.is_archived_seller,
                "is_pinned_buyer": conv.is_pinned_buyer,
                "is_pinned_seller": conv.is_pinned_seller,
                "created_at": conv.created_at,
                "updated_at": conv.updated_at,
                "other_party_name": other_party_name,
                "listing_title": conv.listing.title if conv.listing else "Deleted Listing",
                "last_message": last_msg.content if (last_msg and last_msg.content is not None) else (f"[Media: {last_msg.message_type}]" if last_msg and last_msg.media_url else None),
                "last_message_time": last_msg.created_at if last_msg else None,
                "unread_count": unread,
                "other_party_online": other_party_online
            })
            
        # Sort primarily by pinned status (True first), then by last message/updated time descending
        results.sort(key=lambda x: (
            x["is_pinned_buyer"] if x["buyer_id"] == user_id else x["is_pinned_seller"],
            x["last_message_time"] or x["created_at"]
        ), reverse=True)
        return results

    @staticmethod
    def get_conversation_messages(db: Session, conversation_id: int, user_id: int):
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Enforce conversation access authorization guard
        if conversation.buyer_id != user_id and conversation.seller_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a participant in this conversation"
            )
            
        # Reset unread counts on viewing messages
        UnreadService.reset_unread(conversation_id, user_id)
        
        # Mark other party's unread messages in database as read
        db.query(Message).filter(
            Message.conversation_id == conversation_id,
            Message.sender_id != user_id,
            Message.is_read == False
        ).update({Message.is_read: True}, synchronize_session=False)
        db.commit()
            
        messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).all()
        return messages

    @staticmethod
    def send_message(db: Session, conversation_id: int, sender_id: int, content: Optional[str] = None, message_type: str = "text", media_url: Optional[str] = None) -> Message:
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
            
        # Enforce message authorization guard
        if conversation.buyer_id != sender_id and conversation.seller_id != sender_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a participant in this conversation"
            )
            
        message = Message(
            conversation_id=conversation_id,
            listing_id=conversation.listing_id,
            sender_id=sender_id,
            content=content,
            message_type=message_type,
            media_url=media_url,
            is_delivered=False,
            is_read=False
        )
        db.add(message)
        
        # Increment unread counter for recipient
        recipient_id = conversation.seller_id if conversation.buyer_id == sender_id else conversation.buyer_id
        UnreadService.increment_unread(conversation_id, recipient_id)
        
        # Touch conversation updated_at
        conversation.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(message)
        if conversation.buyer_id == sender_id:
            try:
                from backend.app.services.trust_score_service import TrustScoreService
                TrustScoreService.calculate_trust_score(db, sender_id)
            except Exception as e:
                print(f"Error recalculating trust score on message send: {e}")
        return message

    @staticmethod
    def archive_conversation(db: Session, conversation_id: int, user_id: int, archive: bool) -> Conversation:
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        if conversation.buyer_id != user_id and conversation.seller_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
            
        if conversation.buyer_id == user_id:
            conversation.is_archived_buyer = archive
        else:
            conversation.is_archived_seller = archive
            
        db.commit()
        db.refresh(conversation)
        return conversation

    @staticmethod
    def pin_conversation(db: Session, conversation_id: int, user_id: int, pin: bool) -> Conversation:
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        if conversation.buyer_id != user_id and conversation.seller_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
            
        if pin:
            # Enforce 5 pinned conversations limit per user
            pinned_conversations = db.query(Conversation).filter(
                (Conversation.buyer_id == user_id) | (Conversation.seller_id == user_id)
            ).all()
            pinned_count = 0
            for c in pinned_conversations:
                c_is_buyer = c.buyer_id == user_id
                c_pinned = c.is_pinned_buyer if c_is_buyer else c.is_pinned_seller
                if c_pinned:
                    pinned_count += 1
            if pinned_count >= 5:
                raise HTTPException(status_code=400, detail="Maximum 5 pinned conversations allowed")
                
        if conversation.buyer_id == user_id:
            conversation.is_pinned_buyer = pin
        else:
            conversation.is_pinned_seller = pin
            
        db.commit()
        db.refresh(conversation)
        return conversation

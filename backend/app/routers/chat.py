import os
import uuid
import json
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, WebSocket
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.schemas.chat import (
    ChatConversationCreate,
    ChatConversationResponse,
    ChatMessageCreate,
    ChatMessageResponse,
    ChatReactionCreate,
    ToggleArchiveRequest,
    TogglePinRequest
)
from backend.app.services.auth_service import get_current_user, get_user_by_email
from backend.app.services.conversation_service import ConversationService
from backend.app.services.message_service import MessageService
from backend.app.services.websocket_manager import manager
from backend.app.services.presence_manager import PresenceManager
from backend.app.services.unread_service import UnreadService
from backend.app.services.spam_detector import SpamDetector
from backend.app.utils.jwt import decode_access_token
from backend.app.models.user import User
from backend.app.models.conversation import Conversation
from backend.app.models.message import Message

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v2/chat", tags=["Chat V2"])

UPLOAD_DIR = "uploads/chat"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/conversations", response_model=ChatConversationResponse)
def get_or_create_conversation(
    payload: ChatConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = ConversationService.get_or_create_conversation(
        db=db,
        listing_id=payload.listing_id,
        buyer_id=current_user.id
    )
    # Fetch details to map back to response schema
    convs = ConversationService.get_user_conversations(db, current_user.id)
    for c in convs:
        if c["id"] == conv.id:
            return c
    return conv

@router.get("/conversations", response_model=List[ChatConversationResponse])
def get_conversations(
    archived: Optional[bool] = None,
    pinned: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ConversationService.get_user_conversations(
        db=db,
        user_id=current_user.id,
        archived=archived,
        pinned=pinned
    )

@router.get("/conversations/{conversation_id}/messages", response_model=List[ChatMessageResponse])
def get_messages(
    conversation_id: int,
    query: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if query:
        return MessageService.search_messages(
            db=db,
            conversation_id=conversation_id,
            query=query
        )
    return ConversationService.get_conversation_messages(
        db=db,
        conversation_id=conversation_id,
        user_id=current_user.id
    )

async def broadcast_new_message(db: Session, conversation_id: int, msg: Message):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        return
    
    recipient_id = conv.seller_id if conv.buyer_id == msg.sender_id else conv.buyer_id
    recipient_online = PresenceManager.is_user_online(recipient_id)
    
    if recipient_online:
        msg.is_delivered = True
        db.commit()
        
    msg_event = {
        "type": "new_message",
        "message_id": msg.id,
        "conversation_id": conversation_id,
        "sender_id": msg.sender_id,
        "content": msg.content,
        "message_type": msg.message_type,
        "media_url": msg.media_url,
        "created_at": msg.created_at.isoformat()
    }
    await manager.broadcast_to_participants([conv.buyer_id, conv.seller_id], msg_event)
    
    if recipient_online:
        delivery_event = {
            "type": "delivery_receipt",
            "conversation_id": conversation_id,
            "message_id": msg.id,
            "is_delivered": True,
            "timestamp": datetime.utcnow().isoformat()
        }
        await manager.send_personal_message(delivery_event, msg.sender_id)

@router.post("/conversations/{conversation_id}/messages", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    conversation_id: int,
    payload: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if SpamDetector.is_rate_limited(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded (Too many messages)"
        )
    if SpamDetector.contains_spam_keywords(payload.content):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message blocked: contains blacklisted keywords or links"
        )
    if SpamDetector.is_repeated_flood(current_user.id, payload.content):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Message blocked: repeated content flood detected"
        )

    msg = MessageService.send_message(
        db=db,
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=payload.content,
        message_type=payload.message_type,
        media_url=payload.media_url
    )
    await broadcast_new_message(db, conversation_id, msg)
    return msg


@router.post("/conversations/{conversation_id}/archive", response_model=ChatConversationResponse)
def toggle_archive(
    conversation_id: int,
    payload: ToggleArchiveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = ConversationService.archive_conversation(
        db=db,
        conversation_id=conversation_id,
        user_id=current_user.id,
        archive=payload.archive
    )
    convs = ConversationService.get_user_conversations(db, current_user.id)
    for c in convs:
        if c["id"] == conv.id:
            return c
    return conv

@router.post("/conversations/{conversation_id}/pin", response_model=ChatConversationResponse)
def toggle_pin(
    conversation_id: int,
    payload: TogglePinRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = ConversationService.pin_conversation(
        db=db,
        conversation_id=conversation_id,
        user_id=current_user.id,
        pin=payload.pin
    )
    convs = ConversationService.get_user_conversations(db, current_user.id)
    for c in convs:
        if c["id"] == conv.id:
            return c
    return conv

@router.post("/messages/{message_id}/react")
def react_to_message(
    message_id: int,
    payload: ChatReactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    valid_emojis = ["👍", "❤️", "🔥", "😂", "👀"]
    if payload.emoji not in valid_emojis:
        raise HTTPException(status_code=400, detail="Invalid reaction emoji")
    msg = MessageService.add_reaction(
        db=db,
        message_id=message_id,
        user_id=current_user.id,
        emoji=payload.emoji
    )
    return {"status": "success", "message_id": msg.id, "reactions": msg.reactions}

@router.post("/conversations/{conversation_id}/media", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def upload_chat_media(
    conversation_id: int,
    message_type: str = Form(..., description="'image' or 'voice'"),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    MAX_SIZE = 5 * 1024 * 1024
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds limit (5MB max)")
        
    allowed_types = ["image/jpeg", "image/png", "audio/mpeg", "audio/wav", "audio/ogg", "audio/x-wav", "audio/x-pn-wav", "audio/mp3"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="MIME type not allowed")

    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    
    # Attempt to upload to Cloudinary
    media_url = None
    try:
        from backend.app.utils.cloudinary import upload_to_cloudinary
        # Cloudinary expects resource_type="video" for audio files
        res_type = "image" if message_type == "image" else "video" if message_type == "voice" else "auto"
        media_url = upload_to_cloudinary(content, unique_filename, resource_type=res_type)
    except Exception as e:
        logger.error(f"Failed uploading to Cloudinary: {e}. Falling back to local storage.")
        media_url = None

    # Fallback to local storage if Cloudinary is not configured or fails
    if not media_url:
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        media_url = f"/uploads/chat/{unique_filename}"
    
    msg = MessageService.send_message(
        db=db,
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=None,
        message_type=message_type,
        media_url=media_url
    )
    await broadcast_new_message(db, conversation_id, msg)
    return msg


@router.websocket("/ws")
async def chat_websocket_endpoint(
    websocket: WebSocket,
    token: Optional[str] = None,
    db: Session = Depends(get_db)
):
    if not token:
        await websocket.accept()
        await websocket.close(code=4008)
        return
        
    try:
        payload = decode_access_token(token)
        if not payload:
            await websocket.accept()
            await websocket.close(code=4008)
            return
            
        email = payload.get("sub")
        if not email:
            await websocket.accept()
            await websocket.close(code=4008)
            return
            
        current_user = get_user_by_email(db, email)
        if not current_user or current_user.is_suspended:
            await websocket.accept()
            await websocket.close(code=4008)
            return
    except Exception:
        await websocket.accept()
        await websocket.close(code=4008)
        return

    # WebSocket connection accepted
    await manager.connect(current_user.id, websocket)
    
    # Set online status
    PresenceManager.set_online(db, current_user.id)
    
    # Broadcast presence update to partner connections
    conversations = ConversationService.get_user_conversations(db, current_user.id)
    active_partners = []
    for c in conversations:
        partner_id = c["seller_id"] if c["buyer_id"] == current_user.id else c["buyer_id"]
        active_partners.append(partner_id)
        
    presence_event = {
        "type": "presence_update",
        "user_id": current_user.id,
        "is_online": True,
        "last_active_at": datetime.utcnow().isoformat()
    }
    await manager.broadcast_to_participants(active_partners, presence_event)

    try:
        while True:
            raw_data = await websocket.receive_text()
            try:
                data = json.loads(raw_data)
            except Exception:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "code": 400,
                    "message": "Malformed JSON payload"
                }))
                continue
                
            event_type = data.get("type")
            
            if event_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
                continue
                
            elif event_type == "typing_status":
                conversation_id = data.get("conversation_id")
                is_typing = data.get("is_typing", False)
                if conversation_id:
                    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
                    if conv and (conv.buyer_id == current_user.id or conv.seller_id == current_user.id):
                        PresenceManager.set_typing(conversation_id, current_user.id, is_typing)
                        partner_id = conv.seller_id if conv.buyer_id == current_user.id else conv.buyer_id
                        typing_event = {
                            "type": "typing_indicator",
                            "conversation_id": conversation_id,
                            "user_id": current_user.id,
                            "is_typing": is_typing
                        }
                        await manager.send_personal_message(typing_event, partner_id)
                continue
                
            elif event_type == "send_message":
                conversation_id = data.get("conversation_id")
                content = data.get("content")
                if not conversation_id or not content:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "code": 400,
                        "message": "Missing conversation_id or content"
                    }))
                    continue
                    
                conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
                if not conv or (conv.buyer_id != current_user.id and conv.seller_id != current_user.id):
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "code": 403,
                        "message": "Not a participant in this conversation"
                    }))
                    continue
                    
                # Anti-Spam & Throttling
                if SpamDetector.is_rate_limited(current_user.id):
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "code": 429,
                        "message": "Rate limit exceeded (Too many messages)"
                    }))
                    continue
                    
                if SpamDetector.contains_spam_keywords(content):
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "code": 400,
                        "message": "Message blocked: contains blacklisted keywords or links"
                    }))
                    continue
                    
                if SpamDetector.is_repeated_flood(current_user.id, content):
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "code": 429,
                        "message": "Message blocked: repeated content flood detected"
                    }))
                    continue
                    
                # Save message in DB
                msg = MessageService.send_message(
                    db=db,
                    conversation_id=conversation_id,
                    sender_id=current_user.id,
                    content=content,
                    message_type="text"
                )
                
                recipient_id = conv.seller_id if conv.buyer_id == current_user.id else conv.buyer_id
                recipient_online = PresenceManager.is_user_online(recipient_id)
                
                if recipient_online:
                    msg.is_delivered = True
                    db.commit()
                    
                msg_event = {
                    "type": "new_message",
                    "message_id": msg.id,
                    "conversation_id": conversation_id,
                    "sender_id": current_user.id,
                    "content": content,
                    "message_type": "text",
                    "media_url": None,
                    "created_at": msg.created_at.isoformat()
                }
                await manager.broadcast_to_participants([conv.buyer_id, conv.seller_id], msg_event)
                
                if recipient_online:
                    delivery_event = {
                        "type": "delivery_receipt",
                        "conversation_id": conversation_id,
                        "message_id": msg.id,
                        "is_delivered": True,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    await manager.send_personal_message(delivery_event, current_user.id)
                continue
                
            elif event_type == "mark_read":
                conversation_id = data.get("conversation_id")
                if conversation_id:
                    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
                    if conv and (conv.buyer_id == current_user.id or conv.seller_id == current_user.id):
                        UnreadService.reset_unread(conversation_id, current_user.id)
                        
                        db.query(Message).filter(
                            Message.conversation_id == conversation_id,
                            Message.sender_id != current_user.id,
                            Message.is_read == False
                        ).update({Message.is_read: True}, synchronize_session=False)
                        db.commit()
                        
                        partner_id = conv.seller_id if conv.buyer_id == current_user.id else conv.buyer_id
                        last_partner_msg = db.query(Message).filter(
                            Message.conversation_id == conversation_id,
                            Message.sender_id == partner_id
                        ).order_by(Message.created_at.desc()).first()
                        
                        if last_partner_msg:
                            read_event = {
                                "type": "read_receipt",
                                "conversation_id": conversation_id,
                                "message_id": last_partner_msg.id,
                                "is_read": True,
                                "timestamp": datetime.utcnow().isoformat()
                            }
                            await manager.send_personal_message(read_event, partner_id)
                continue
                
    except Exception as e:
        logger.error(f"WebSocket execution exception: {e}")
    finally:
        manager.disconnect(current_user.id, websocket)
        PresenceManager.set_offline(db, current_user.id)
        
        presence_event = {
            "type": "presence_update",
            "user_id": current_user.id,
            "is_online": False,
            "last_active_at": datetime.utcnow().isoformat()
        }
        await manager.broadcast_to_participants(active_partners, presence_event)

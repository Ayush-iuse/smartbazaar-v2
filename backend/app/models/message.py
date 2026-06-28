from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime, Boolean, String
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=True)
    message_type = Column(String, default="text", nullable=False)  # text, image, voice, offer, system
    media_url = Column(String, nullable=True)
    is_delivered = Column(Boolean, default=False, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    reactions = Column(Text, default="[]", nullable=False)  # Stringified JSON list
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    listing = relationship("Listing", back_populates="messages")
    sender = relationship("User")
    conversation = relationship("Conversation", back_populates="messages")

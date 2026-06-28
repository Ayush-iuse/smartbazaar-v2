from sqlalchemy import Column, Integer, ForeignKey, DateTime, Boolean
from datetime import datetime
from backend.app.database import Base

class UserPresence(Base):
    __tablename__ = "online_status"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True, index=True)
    is_online = Column(Boolean, default=False, nullable=False)
    last_active_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    current_conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="SET NULL"), nullable=True)

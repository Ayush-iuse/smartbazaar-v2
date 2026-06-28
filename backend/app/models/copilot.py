from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, Text
from sqlalchemy.orm import relationship, backref
from datetime import datetime
from backend.app.database import Base

class CopilotSession(Base):
    __tablename__ = "copilot_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", backref=backref("copilot_sessions", cascade="all, delete-orphan"))
    messages = relationship("CopilotMessage", back_populates="session", cascade="all, delete-orphan")
    actions = relationship("CopilotAction", back_populates="session", cascade="all, delete-orphan")

class CopilotMessage(Base):
    __tablename__ = "copilot_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("copilot_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    sender = Column(String, nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    session = relationship("CopilotSession", back_populates="messages")

class CopilotMemory(Base):
    __tablename__ = "copilot_memory"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    key = Column(String, nullable=False, index=True)  # e.g. "budget", "location", "category"
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", backref=backref("copilot_memories", cascade="all, delete-orphan"))

class CopilotAction(Base):
    __tablename__ = "copilot_actions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("copilot_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String, nullable=False)  # "search", "compare", "fraud_analysis", "price_advisor"
    action_data = Column(Text, nullable=True)  # JSON-formatted details
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    session = relationship("CopilotSession", back_populates="actions")

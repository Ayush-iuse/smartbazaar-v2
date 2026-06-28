from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, Text
from sqlalchemy.orm import relationship, backref
from datetime import datetime
from backend.app.database import Base

class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    risk_score = Column(Integer, default=0, nullable=False)
    risk_level = Column(String, default="LOW", nullable=False) # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    reason = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", backref=backref("risk_score", cascade="all, delete-orphan", uselist=False))

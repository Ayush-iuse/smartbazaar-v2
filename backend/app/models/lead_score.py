from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship, backref
from datetime import datetime
from backend.app.database import Base

class LeadScore(Base):
    __tablename__ = "lead_scores"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Integer, default=0, nullable=False, index=True)
    category = Column(String, default="COLD", nullable=False) # "COLD", "WARM", "HOT", "PRIORITY"
    last_calculated = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    seller = relationship("User", foreign_keys=[seller_id], backref=backref("seller_leads_score", cascade="all, delete-orphan"))
    buyer = relationship("User", foreign_keys=[buyer_id], backref=backref("buyer_leads_score", cascade="all, delete-orphan"))

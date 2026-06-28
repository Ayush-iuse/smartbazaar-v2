from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship, backref
from datetime import datetime
from backend.app.database import Base

class LeadStatus(Base):
    __tablename__ = "lead_status"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String, default="NEW", nullable=False, index=True) # "NEW", "INTERESTED", "ENGAGED", "NEGOTIATING", "OFFER_SENT", "OFFER_ACCEPTED", "DEAL_COMPLETED", "LOST", "BLOCKED"
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    seller = relationship("User", foreign_keys=[seller_id], backref=backref("seller_leads_status", cascade="all, delete-orphan"))
    buyer = relationship("User", foreign_keys=[buyer_id], backref=backref("buyer_leads_status", cascade="all, delete-orphan"))

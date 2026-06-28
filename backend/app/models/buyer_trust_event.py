from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship, backref
from datetime import datetime
from backend.app.database import Base

class BuyerTrustEvent(Base):
    __tablename__ = "buyer_trust_events"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String, nullable=False) # e.g. "Deal Completed", "Offer Accepted", "Spam Report", "Account Reported"
    old_score = Column(Integer, nullable=False)
    new_score = Column(Integer, nullable=False)
    reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    buyer = relationship("User", backref=backref("trust_events", cascade="all, delete-orphan"))

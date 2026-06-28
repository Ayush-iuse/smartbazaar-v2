from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, Text
from sqlalchemy.orm import relationship, backref
from datetime import datetime
from backend.app.database import Base

class BuyerTimeline(Base):
    __tablename__ = "buyer_timeline"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String, nullable=False) # "Conversation Started", "Offer Sent", "Offer Accepted", "Offer Rejected", "Listing Saved", "Verification Earned", "Trust Score Changed"
    event_data = Column(Text, nullable=True) # JSON-formatted string
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    seller = relationship("User", foreign_keys=[seller_id], backref=backref("seller_timeline_events", cascade="all, delete-orphan"))
    buyer = relationship("User", foreign_keys=[buyer_id], backref=backref("buyer_timeline_events", cascade="all, delete-orphan"))

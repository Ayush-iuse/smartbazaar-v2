from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, Text
from sqlalchemy.orm import relationship, backref
from datetime import datetime
from backend.app.database import Base

class CRMActivity(Base):
    __tablename__ = "crm_activities"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_type = Column(String, nullable=False) # "Message Sent", "Offer Sent", "Offer Accepted", "Label Added", "Note Added", "Status Changed"
    activity_metadata = Column("metadata", Text, nullable=True) # JSON-formatted string
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    seller = relationship("User", foreign_keys=[seller_id], backref=backref("seller_activities", cascade="all, delete-orphan"))
    buyer = relationship("User", foreign_keys=[buyer_id], backref=backref("buyer_activities", cascade="all, delete-orphan"))

from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship, backref
from datetime import datetime
from backend.app.database import Base

class BuyerLabel(Base):
    __tablename__ = "buyer_labels"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    label = Column(String, nullable=False, index=True) # "VIP", "Repeat Buyer", "Negotiating", "High Intent", "Blocked"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    seller = relationship("User", foreign_keys=[seller_id], backref=backref("seller_labels", cascade="all, delete-orphan"))
    buyer = relationship("User", foreign_keys=[buyer_id], backref=backref("buyer_labels", cascade="all, delete-orphan"))

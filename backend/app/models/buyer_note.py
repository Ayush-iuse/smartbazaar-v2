from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship, backref
from datetime import datetime
from backend.app.database import Base

class BuyerNote(Base):
    __tablename__ = "buyer_notes"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    note = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    seller = relationship("User", foreign_keys=[seller_id], backref=backref("seller_notes", cascade="all, delete-orphan"))
    buyer = relationship("User", foreign_keys=[buyer_id], backref=backref("buyer_notes", cascade="all, delete-orphan"))

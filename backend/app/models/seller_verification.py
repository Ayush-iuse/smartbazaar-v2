from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, Text
from sqlalchemy.orm import relationship, backref
from datetime import datetime
from backend.app.database import Base

class SellerVerification(Base):
    __tablename__ = "seller_verifications"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    verification_type = Column(String, nullable=False) # "EMAIL", "PHONE", "GOVERNMENT_ID"
    status = Column(String, default="PENDING", nullable=False, index=True) # "PENDING", "APPROVED", "REJECTED"
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    approved_at = Column(DateTime, nullable=True)
    review_notes = Column(Text, nullable=True)

    # Relationships
    seller = relationship("User", backref=backref("verifications", cascade="all, delete-orphan"))

from sqlalchemy import Column, Integer, ForeignKey, Float, DateTime, String
from sqlalchemy.orm import relationship, backref
from datetime import datetime
from backend.app.database import Base

class BuyerTrustScore(Base):
    __tablename__ = "buyer_trust_scores"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    trust_score = Column(Integer, default=50, nullable=False, index=True)
    trust_level = Column(String, default="NEW BUYER", nullable=False)
    completed_deals = Column(Integer, default=0, nullable=False)
    cancelled_deals = Column(Integer, default=0, nullable=False)
    spam_reports = Column(Integer, default=0, nullable=False)
    response_rate = Column(Float, default=1.0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    buyer = relationship("User", backref=backref("trust_score", cascade="all, delete-orphan", uselist=False))

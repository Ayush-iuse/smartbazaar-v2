from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, String
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class SellerScore(Base):
    __tablename__ = "seller_scores"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    trust_score = Column(Integer, nullable=False, default=100)
    response_rate = Column(Float, nullable=False, default=1.0)
    quality_score = Column(Integer, nullable=False, default=100)
    fraud_score = Column(Integer, nullable=False, default=0)
    level = Column(String, nullable=False, default="New Seller")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    seller = relationship("User")

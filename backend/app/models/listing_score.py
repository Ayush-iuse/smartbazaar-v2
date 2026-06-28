from sqlalchemy import Column, Integer, ForeignKey, DateTime, Text, String
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class ListingScore(Base):
    __tablename__ = "listing_scores"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=True)
    listing_score = Column(Integer, nullable=False)
    sale_probability = Column(Integer, nullable=False)
    competition_score = Column(Integer, nullable=False)
    price_score = Column(Integer, nullable=False)
    description_score = Column(Integer, nullable=False)
    recommendations = Column(Text, nullable=True, default="[]")  # Stringified JSON list
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    listing = relationship("Listing")

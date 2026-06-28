from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    recommended_listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    rank = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    listing = relationship("Listing", foreign_keys=[listing_id])
    recommended_listing = relationship("Listing", foreign_keys=[recommended_listing_id])

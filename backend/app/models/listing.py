from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String, index=True, nullable=False)
    location = Column(String, index=True, nullable=False)
    image_urls = Column(Text, nullable=True, default="[]")  # Stringified JSON list
    seller_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    fraud_score = Column(Float, default=0.0)
    fraud_level = Column(String, default="Low")
    status = Column(String, default="Active", nullable=False)  # Active, Sold
    is_featured = Column(Boolean, default=False)
    allow_sale = Column(Boolean, default=True, nullable=False)
    allow_rental = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    seller = relationship("User", back_populates="listings")
    messages = relationship("Message", back_populates="listing", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="listing", cascade="all, delete-orphan")

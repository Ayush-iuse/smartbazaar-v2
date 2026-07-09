from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    is_suspended = Column(Boolean, default=False)
    preferred_language = Column(String, default="en", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


    # Relationships
    listings = relationship("Listing", back_populates="seller", cascade="all, delete-orphan")

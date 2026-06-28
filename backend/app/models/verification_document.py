from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship, backref
from datetime import datetime
from backend.app.database import Base

class VerificationDocument(Base):
    __tablename__ = "verification_documents"

    id = Column(Integer, primary_key=True, index=True)
    verification_id = Column(Integer, ForeignKey("seller_verifications.id", ondelete="CASCADE"), nullable=False, index=True)
    file_path = Column(String, nullable=False)
    document_type = Column(String, nullable=False) # "Passport", "Driving License", "National ID"
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    verification = relationship("SellerVerification", backref=backref("documents", cascade="all, delete-orphan"))

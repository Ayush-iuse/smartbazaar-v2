from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String, primary_key=True, index=True)
    value = Column(Text, nullable=False)
    description = Column(String, nullable=True)

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reported_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    reported_listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=True)
    reported_conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=True)
    reported_message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), nullable=True)
    reason = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    status = Column(String, default="pending", nullable=False)  # pending, reviewed, resolved, dismissed
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    reporter = relationship("User", foreign_keys=[reporter_id])
    reported_user = relationship("User", foreign_keys=[reported_user_id])
    reported_listing = relationship("Listing")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)  # message, offer_received, offer_accepted, verification_approved, trust_score_updated, price_drop, saved_search_match
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    is_archived = Column(Boolean, default=False, nullable=False)
    link = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")

class SavedSearch(Base):
    __tablename__ = "saved_searches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    query = Column(String, nullable=False)
    filters = Column(Text, nullable=True)  # JSON-serialized filters
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")

class PriceWatch(Base):
    __tablename__ = "price_watches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    last_notified_price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")
    listing = relationship("Listing")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)  # login, create_listing, update_listing, admin_action, etc.
    entity_type = Column(String, nullable=True)  # user, listing, offer, verification, admin
    entity_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)  # JSON-serialized payload details
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")

class BackgroundJob(Base):
    __tablename__ = "background_jobs"

    id = Column(Integer, primary_key=True, index=True)
    job_type = Column(String, nullable=False)  # email_send, analytics_refresh, recommendation_rebuild, trust_recalculation, cleanup_jobs, notification_delivery
    payload = Column(Text, nullable=False)  # JSON-serialized input details
    status = Column(String, default="pending", nullable=False)  # pending, running, completed, failed
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    scheduled_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class LoginHistory(Base):
    __tablename__ = "login_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ip_address = Column(String, nullable=False)
    user_agent = Column(String, nullable=False)
    device_info = Column(String, nullable=True)
    status = Column(String, nullable=False)  # success, failed
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")

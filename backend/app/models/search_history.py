from sqlalchemy import Column, Integer, ForeignKey, String, Text, DateTime
from datetime import datetime
from backend.app.database import Base

class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    query_string = Column(Text, nullable=False)
    intent = Column(String, nullable=True)
    resolved_filters = Column(Text, nullable=True, default="{}")  # Stringified JSON object
    created_at = Column(DateTime, default=datetime.utcnow)

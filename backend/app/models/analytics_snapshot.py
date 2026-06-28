from sqlalchemy import Column, Integer, Float, String, Date
from datetime import date
from backend.app.database import Base

class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True, nullable=False)
    avg_price = Column(Float, nullable=False, default=0.0)
    listing_count = Column(Integer, nullable=False, default=0)
    fraud_rate = Column(Float, nullable=False, default=0.0)
    snapshot_date = Column(Date, default=date.today, index=True)

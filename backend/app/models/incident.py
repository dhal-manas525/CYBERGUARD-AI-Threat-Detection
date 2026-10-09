from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime, timezone
from app.core.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    threat_level = Column(String(50), nullable=False)  # SAFE, SUSPICIOUS, HIGH RISK, CRITICAL
    scenario_type = Column(String(50), nullable=False)  # PHISHING, IMPERSONATION, AUTH_ANOMALY, MALICIOUS_URL, WEBSITE
    target = Column(Text, nullable=False)
    risk_score = Column(Float, nullable=False)
    status = Column(String(50), nullable=False, default="New")  # New, Investigating, Mitigated, Closed
    assigned_to = Column(String(100), default="analyst@cyberguard.ai")
    notes = Column(Text, nullable=True)
    details_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

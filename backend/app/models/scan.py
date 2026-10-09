from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from datetime import datetime, timezone
from app.core.database import Base


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    target = Column(Text, nullable=False)
    scan_type = Column(String(50), nullable=False, default="url")  # url, email, message, website
    risk_score = Column(Float, nullable=False)
    threat_level = Column(String(50), nullable=False)  # SAFE, SUSPICIOUS, HIGH RISK, CRITICAL
    threat_category = Column(String(100), nullable=False)
    claimed_identity = Column(String(100), default="None Detected")
    impersonation_detected = Column(Boolean, default=False)
    identity_match_status = Column(String(50), default="UNKNOWN")  # MATCH, MISMATCH, LOOKALIKE_DETECTED, UNKNOWN
    explanation_summary = Column(Text, nullable=True)
    details_json = Column(Text, nullable=False)  # Full JSON payload
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

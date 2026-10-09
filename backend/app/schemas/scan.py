from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from app.core.validators import validate_url_or_domain, validate_email_address, validate_message_content


class UrlScanRequest(BaseModel):
    url: str

    @field_validator("url")
    def validate_url_field(cls, v: str) -> str:
        clean = v.strip()
        is_valid, err_msg = validate_url_or_domain(clean)
        if not is_valid:
            raise ValueError(err_msg or "Invalid URL or domain format")
        return clean


class EmailScanRequest(BaseModel):
    sender: str
    subject: str
    body: str
    links: Optional[List[str]] = []

    @field_validator("sender")
    def validate_sender_field(cls, v: str) -> str:
        clean = v.strip()
        is_valid, err_msg = validate_email_address(clean)
        if not is_valid:
            raise ValueError(err_msg or "Invalid email sender address")
        return clean

    @field_validator("body")
    def validate_content_presence(cls, v: str, info) -> str:
        clean = v.strip()
        subject = info.data.get("subject", "").strip() if info.data else ""
        if len(clean) < 5 and len(subject) < 5:
            raise ValueError("Please provide meaningful email subject or body content (at least 5 characters).")
        return clean

    @field_validator("links")
    def validate_links_list(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if not v:
            return []
        cleaned = []
        for link in v:
            l_clean = link.strip()
            if l_clean:
                is_valid, err_msg = validate_url_or_domain(l_clean)
                if not is_valid:
                    raise ValueError(f"Embedded link '{l_clean}' is not a valid URL: {err_msg}")
                cleaned.append(l_clean)
        return cleaned


class MessageScanRequest(BaseModel):
    content: str
    platform: Optional[str] = "Generic / SMS"  # SMS, WhatsApp, Telegram, Social Media

    @field_validator("content")
    def validate_message_field(cls, v: str) -> str:
        clean = v.strip()
        is_valid, err_msg = validate_message_content(clean)
        if not is_valid:
            raise ValueError(err_msg or "Invalid message content")
        return clean


class WebsiteScanRequest(BaseModel):
    url: str

    @field_validator("url")
    def validate_website_field(cls, v: str) -> str:
        clean = v.strip()
        is_valid, err_msg = validate_url_or_domain(clean)
        if not is_valid:
            raise ValueError(err_msg or "Invalid website URL or domain format")
        return clean


class CyberTrustIntelligence(BaseModel):
    claimed_identity: str
    identity_match_status: str  # MATCH, MISMATCH, LOOKALIKE_DETECTED, UNKNOWN
    is_impersonation: bool
    impersonated_brand: Optional[str] = None
    official_domain: Optional[str] = None
    why_flagged: List[str]
    possible_attack_goal: str
    recommended_actions: List[str]
    trust_breakdown: Dict[str, Union[float, str]]


class ScanResponse(BaseModel):
    id: Optional[int] = None
    target: str
    scan_type: str  # url, email, message, website
    risk_score: float  # 0 to 100
    threat_level: str  # SAFE, SUSPICIOUS, HIGH RISK, CRITICAL
    threat_category: str
    ml_prediction: str  # SAFE, SUSPICIOUS, MALICIOUS
    ml_confidence: float  # 0.0 - 1.0
    cybertrust: CyberTrustIntelligence
    extracted_features: Dict[str, Any]
    created_at: datetime
    is_demo: bool = False


class ScanListItem(BaseModel):
    id: int
    target: str
    scan_type: str
    risk_score: float
    threat_level: str
    threat_category: str
    claimed_identity: str
    impersonation_detected: bool
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_scans: int
    threats_detected: int
    critical_threats: int
    average_risk_score: float
    threat_distribution: List[Dict[str, Any]]
    recent_scans: List[ScanListItem]
    category_breakdown: List[Dict[str, Any]]
    risk_trend: List[Dict[str, Any]]

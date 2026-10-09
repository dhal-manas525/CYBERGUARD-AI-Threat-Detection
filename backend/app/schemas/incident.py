from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, List, Dict, Any


class IncidentCreate(BaseModel):
    title: str
    threat_level: str
    scenario_type: str
    target: str
    risk_score: float
    status: Optional[str] = "New"
    assigned_to: Optional[str] = "analyst@cyberguard.ai"
    notes: Optional[str] = None
    details_json: Optional[str] = "{}"


class IncidentUpdate(BaseModel):
    status: Optional[str] = None  # New, Investigating, Mitigated, Closed
    assigned_to: Optional[str] = None
    notes: Optional[str] = None


class IncidentResponse(BaseModel):
    id: int
    incident_id: str
    title: str
    threat_level: str
    scenario_type: str
    target: str
    risk_score: float
    status: str
    assigned_to: Optional[str]
    notes: Optional[str]
    details: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class IncidentListItem(BaseModel):
    id: int
    incident_id: str
    title: str
    threat_level: str
    scenario_type: str
    target: str
    risk_score: float
    status: str
    assigned_to: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Schema for Scenario C (Auth Events)
class AuthEventItem(BaseModel):
    timestamp: str
    username: str
    ip_address: str
    location: Optional[str] = "Unknown"
    status: str  # SUCCESS, FAILURE
    user_agent: Optional[str] = "Standard Browser"


class AuthAnomalyRequest(BaseModel):
    events: List[AuthEventItem]
    auto_create_incident: Optional[bool] = True

    @field_validator("events")
    def validate_events_list(cls, v: List[AuthEventItem]) -> List[AuthEventItem]:
        if not v or len(v) == 0:
            raise ValueError("At least one authentication telemetry event is required for anomaly analysis.")
        return v


class AuthAnomalyResponse(BaseModel):
    total_events: int
    anomaly_score: float
    threat_level: str
    threat_category: str
    anomalies_detected: List[Dict[str, Any]]
    affected_accounts: List[str]
    offending_ips: List[str]
    attack_vectors: List[str]
    summary: str
    recommended_response: List[str]
    analyzed_at: str
    incident_id: Optional[str] = None


# Schema for Scenario B (Digital Impersonation)
class ImpersonationScanRequest(BaseModel):
    claimed_organization: str
    target: str
    auto_create_incident: Optional[bool] = False

    @field_validator("claimed_organization")
    def validate_org_name(cls, v: str) -> str:
        clean = v.strip()
        if len(clean) < 2:
            raise ValueError("Claimed organization name must be at least 2 characters.")
        return clean

    @field_validator("target")
    def validate_target_field(cls, v: str) -> str:
        clean = v.strip()
        if "@" in clean:
            from app.core.validators import validate_email_address
            is_valid, err = validate_email_address(clean)
            if not is_valid:
                raise ValueError(err or "Invalid email sender destination")
        else:
            from app.core.validators import validate_url_or_domain
            is_valid, err = validate_url_or_domain(clean)
            if not is_valid:
                raise ValueError(err or "Invalid destination URL or domain")
        return clean


class ImpersonationScanResponse(BaseModel):
    claimed_organization: str
    target_destination: str
    target_host: str
    official_domains: List[str]
    match_status: str  # EXACT_MATCH, LOOKALIKE_IMPERSONATION, MISMATCH_UNAUTHORIZED
    impersonation_detected: bool
    similarity_score: float
    risk_score: float
    threat_level: str
    threat_category: str
    homoglyphs_detected: List[Dict[str, str]]
    evidentiary_breakdown: List[str]
    threat_objective: str
    recommended_actions: List[str]
    confidence: float
    incident_id: Optional[str] = None

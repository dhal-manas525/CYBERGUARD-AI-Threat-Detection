from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json
import uuid

from app.core.database import get_db
from app.core.dependencies import get_current_user_optional
from app.models.user import User
from app.models.scan import Scan
from app.models.incident import Incident
from app.schemas.scan import (
    UrlScanRequest,
    EmailScanRequest,
    MessageScanRequest,
    WebsiteScanRequest,
    ScanResponse,
)
from app.schemas.incident import (
    ImpersonationScanRequest,
    ImpersonationScanResponse,
    AuthAnomalyRequest,
    AuthAnomalyResponse,
)
from app.services.brand_intelligence import analyze_brand_impersonation
from app.services.risk_scorer import calculate_risk_score
from app.services.cybertrust_engine import generate_cybertrust_intelligence
from app.services.email_analyzer import analyze_email_threat
from app.services.message_analyzer import analyze_message_threat
from app.services.website_analyzer import analyze_website
from app.services.impersonation_analyzer import analyze_digital_impersonation
from app.services.auth_anomaly_detector import analyze_auth_events, get_demo_auth_scenarios
from ml.features.extractor import extract_url_features
from ml.model_loader import get_model

router = APIRouter(prefix="/analyze", tags=["Threat Analysis"])


def persist_scan(db: Session, user: User, result_dict: dict) -> int:
    """Helper to save scan record to database."""
    scan = Scan(
        user_id=user.id if user else None,
        target=result_dict["target"],
        scan_type=result_dict["scan_type"],
        risk_score=result_dict["risk_score"],
        threat_level=result_dict["threat_level"],
        threat_category=result_dict["threat_category"],
        claimed_identity=result_dict["cybertrust"].claimed_identity,
        impersonation_detected=result_dict["cybertrust"].is_impersonation,
        identity_match_status=result_dict["cybertrust"].identity_match_status,
        explanation_summary=result_dict["cybertrust"].why_flagged[0] if result_dict["cybertrust"].why_flagged else "",
        details_json=json.dumps({
            "ml_prediction": result_dict["ml_prediction"],
            "ml_confidence": result_dict["ml_confidence"],
            "cybertrust": result_dict["cybertrust"].model_dump(),
            "extracted_features": result_dict["extracted_features"]
        }),
        created_at=datetime.now(timezone.utc)
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    return scan.id


@router.post("/url", response_model=ScanResponse)
def analyze_url_endpoint(
    payload: UrlScanRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """Analyze suspicious URL using ML, brand intelligence, and CyberTrust engine."""
    url = payload.url.strip()
    
    # 1. Feature extraction
    features = extract_url_features(url)
    
    # 2. Brand impersonation & claimed identity analysis
    brand_analysis = analyze_brand_impersonation(url)
    
    # 3. ML Model prediction
    model = get_model()
    ml_pred, ml_conf, _ = model.predict(features)
    
    # 4. Risk scoring
    risk_score, threat_level, threat_cat, trust_breakdown = calculate_risk_score(
        features=features,
        brand_analysis=brand_analysis,
        ml_prediction=ml_pred,
        ml_confidence=ml_conf
    )
    
    # 5. CyberTrust Intelligence explanation
    cybertrust = generate_cybertrust_intelligence(
        url=url,
        features=features,
        brand_analysis=brand_analysis,
        risk_score=risk_score,
        threat_level=threat_level,
        threat_category=threat_cat,
        trust_breakdown=trust_breakdown
    )

    result_dict = {
        "target": url,
        "scan_type": "url",
        "risk_score": risk_score,
        "threat_level": threat_level,
        "threat_category": threat_cat,
        "ml_prediction": ml_pred,
        "ml_confidence": ml_conf,
        "cybertrust": cybertrust,
        "extracted_features": features,
        "created_at": datetime.now(timezone.utc),
        "is_demo": False
    }

    scan_id = persist_scan(db, user, result_dict)
    result_dict["id"] = scan_id
    return ScanResponse(**result_dict)


@router.post("/email", response_model=ScanResponse)
def analyze_email_endpoint(
    payload: EmailScanRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """Analyze suspicious email content, headers, and links."""
    result_dict = analyze_email_threat(
        sender=payload.sender,
        subject=payload.subject,
        body=payload.body,
        links=payload.links or []
    )
    scan_id = persist_scan(db, user, result_dict)
    result_dict["id"] = scan_id
    return ScanResponse(**result_dict)


@router.post("/message", response_model=ScanResponse)
def analyze_message_endpoint(
    payload: MessageScanRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """Analyze SMS, WhatsApp, Telegram, or social media scam message."""
    result_dict = analyze_message_threat(
        content=payload.content,
        platform=payload.platform or "Generic / SMS"
    )
    scan_id = persist_scan(db, user, result_dict)
    result_dict["id"] = scan_id
    return ScanResponse(**result_dict)


@router.post("/website", response_model=ScanResponse)
def analyze_website_endpoint(
    payload: WebsiteScanRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """Analyze website domain and SSL security with strict SSRF guardrails."""
    result_dict = analyze_website(payload.url)
    if "error" in result_dict:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result_dict["error"])
    scan_id = persist_scan(db, user, result_dict)
    result_dict["id"] = scan_id
    return ScanResponse(**result_dict)


# =========================================================================
# SCENARIO B: Digital Impersonation & Identity Verification Endpoint
# =========================================================================
@router.post("/impersonation", response_model=ImpersonationScanResponse)
def analyze_impersonation_endpoint(
    payload: ImpersonationScanRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """
    Scenario B: Compares Claimed Organization against Target Domain/URL/Sender.
    Detects homoglyphs, typosquatting, subdomain deception, and domain mismatches.
    """
    res = analyze_digital_impersonation(
        claimed_organization=payload.claimed_organization,
        target=payload.target
    )

    incident_id_str = None
    if payload.auto_create_incident and res["risk_score"] >= 60:
        unique_inc_id = f"INC-{datetime.now(timezone.utc).year}-{uuid.uuid4().hex[:6].upper()}"
        new_inc = Incident(
            incident_id=unique_inc_id,
            title=f"Brand Impersonation Alert: {res['claimed_organization']} spoofed by {res['target_host']}",
            threat_level=res["threat_level"],
            scenario_type="IMPERSONATION",
            target=res["target_destination"],
            risk_score=res["risk_score"],
            status="New",
            assigned_to=user.email if user else "analyst@cyberguard.ai",
            notes=f"Auto-generated incident from Scenario B. Claimed: {res['claimed_organization']}. Host: {res['target_host']}.",
            details_json=json.dumps(res),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(new_inc)
        db.commit()
        incident_id_str = unique_inc_id

    res["incident_id"] = incident_id_str
    return ImpersonationScanResponse(**res)


# =========================================================================
# SCENARIO C: Authentication-Event Anomaly Detector Endpoint
# =========================================================================
@router.post("/auth-events", response_model=AuthAnomalyResponse)
def analyze_auth_events_endpoint(
    payload: AuthAnomalyRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """
    Scenario C: Analyzes batch authentication events for brute-force attacks,
    horizontal password spraying, impossible travel velocities, and automated attack tooling.
    """
    event_dicts = [e.model_dump() for e in payload.events]
    analysis = analyze_auth_events(event_dicts)

    incident_id_str = None
    if payload.auto_create_incident and analysis["anomaly_score"] >= 60:
        unique_inc_id = f"INC-{datetime.now(timezone.utc).year}-{uuid.uuid4().hex[:6].upper()}"
        new_inc = Incident(
            incident_id=unique_inc_id,
            title=f"Authentication Anomaly: {', '.join(analysis['attack_vectors'])}",
            threat_level=analysis["threat_level"],
            scenario_type="AUTH_ANOMALY",
            target=f"Accounts: {', '.join(analysis['affected_accounts'][:3])} | IPs: {', '.join(analysis['offending_ips'][:2])}",
            risk_score=analysis["anomaly_score"],
            status="New",
            assigned_to=user.email if user else "analyst@cyberguard.ai",
            notes=f"Auto-generated incident from Scenario C auth telemetry. Detected vectors: {', '.join(analysis['attack_vectors'])}.",
            details_json=json.dumps(analysis),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(new_inc)
        db.commit()
        incident_id_str = unique_inc_id

    analysis["incident_id"] = incident_id_str
    return AuthAnomalyResponse(**analysis)


@router.get("/auth-events/scenarios")
def get_auth_demo_scenarios():
    """Retrieve pre-configured synthetic auth attack telemetry for 1-click evaluation."""
    return get_demo_auth_scenarios()

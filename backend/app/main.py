from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import json
from datetime import datetime, timezone
import uuid

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.scan import Scan
from app.models.brand import Brand
from app.models.incident import Incident
from app.core.security import hash_password
from app.api import auth, analyze, scans, dashboard, reports, incidents, assistant
from app.services.brand_intelligence import KNOWN_BRANDS, analyze_brand_impersonation
from app.services.risk_scorer import calculate_risk_score
from app.services.cybertrust_engine import generate_cybertrust_intelligence
from ml.features.extractor import extract_url_features
from ml.model_loader import get_model


def seed_database_if_empty():
    """Seed initial demo analyst user, brand directory, baseline scans, and incidents."""
    db = SessionLocal()
    try:
        # 1. Create default demo analyst user
        demo_user = db.query(User).filter(User.email == "analyst@cyberguard.ai").first()
        if not demo_user:
            demo_user = User(
                name="Chief SOC Analyst",
                email="analyst@cyberguard.ai",
                hashed_password=hash_password("CyberGuard@2026!"),
                role="lead_incident_responder"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print("[Seed] Created default analyst user: analyst@cyberguard.ai")

        # 2. Seed Brands Directory
        if db.query(Brand).count() == 0:
            for b in KNOWN_BRANDS:
                brand_row = Brand(
                    name=b["name"],
                    official_domains=",".join(b["official_domains"]),
                    known_keywords=",".join(b["keywords"]),
                    category=b["category"],
                    is_high_target=b["high_value"]
                )
                db.add(brand_row)
            db.commit()
            print(f"[Seed] Populated {len(KNOWN_BRANDS)} high-value brand profiles.")

        # 3. Seed baseline scans for dashboard
        if db.query(Scan).count() == 0:
            sample_targets = [
                ("http://onlinesbi-kyc-verification-portal.com/login.php", "url"),
                ("http://paypal-account-security-alert-center.top/signin", "url"),
                ("https://www.microsoft.com/en-us/microsoft-365", "url"),
                ("http://185.220.101.5/bank/login.php", "url"),
                ("https://www.amazon.com/gp/help/customer/display.html", "url"),
                ("http://usps-package-address-update-fee.xyz/delivery-track", "url"),
            ]
            
            model = get_model()
            for target_url, s_type in sample_targets:
                features = extract_url_features(target_url)
                brand_analysis = analyze_brand_impersonation(target_url)
                ml_pred, ml_conf, _ = model.predict(features)
                risk_score, threat_level, threat_cat, trust_breakdown = calculate_risk_score(
                    features=features,
                    brand_analysis=brand_analysis,
                    ml_prediction=ml_pred,
                    ml_confidence=ml_conf
                )
                cybertrust = generate_cybertrust_intelligence(
                    url=target_url,
                    features=features,
                    brand_analysis=brand_analysis,
                    risk_score=risk_score,
                    threat_level=threat_level,
                    threat_category=threat_cat,
                    trust_breakdown=trust_breakdown
                )
                scan_row = Scan(
                    user_id=demo_user.id,
                    target=target_url,
                    scan_type=s_type,
                    risk_score=risk_score,
                    threat_level=threat_level,
                    threat_category=threat_cat,
                    claimed_identity=cybertrust.claimed_identity,
                    impersonation_detected=cybertrust.is_impersonation,
                    identity_match_status=cybertrust.identity_match_status,
                    explanation_summary=cybertrust.why_flagged[0] if cybertrust.why_flagged else "",
                    details_json=json.dumps({
                        "ml_prediction": ml_pred,
                        "ml_confidence": ml_conf,
                        "cybertrust": cybertrust.model_dump(),
                        "extracted_features": features
                    }),
                    created_at=datetime.now(timezone.utc)
                )
                db.add(scan_row)
            db.commit()
            print(f"[Seed] Added initial representative scans.")

        # 4. Seed initial incidents for incident management tracking
        if db.query(Incident).count() == 0:
            demo_incidents = [
                Incident(
                    incident_id="INC-2026-9041",
                    title="Active Phishing Campaign: Online SBI Credential Harvester",
                    threat_level="CRITICAL",
                    scenario_type="PHISHING",
                    target="http://onlinesbi-kyc-verification-portal.com/login.php",
                    risk_score=94.0,
                    status="Investigating",
                    assigned_to="analyst@cyberguard.ai",
                    notes="Phishing decoy targeting netbanking credentials and OTP tokens. Domain registrar contact initiated for abuse takedown.",
                    details_json=json.dumps({
                        "impersonated_brand": "State Bank of India (SBI)",
                        "attack_goal": "Internet banking credentials & transaction OTP",
                        "indicators": ["Lookalike domain", "Unsecured HTTP", "Credential keywords"]
                    }),
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                ),
                Incident(
                    incident_id="INC-2026-8812",
                    title="Brand Impersonation: PayPal Lookalike Gateway",
                    threat_level="CRITICAL",
                    scenario_type="IMPERSONATION",
                    target="http://paypal-account-security-alert-center.top/signin",
                    risk_score=91.0,
                    status="Mitigated",
                    assigned_to="analyst@cyberguard.ai",
                    notes="DNS blackholed at internal resolver. Upstream ISP notified. User awareness notice dispatched.",
                    details_json=json.dumps({
                        "impersonated_brand": "PayPal",
                        "attack_goal": "Credit card data & account takeover",
                        "indicators": ["Suspicious TLD .top", "Deceptive brand keyword in subdomain"]
                    }),
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                ),
                Incident(
                    incident_id="INC-2026-7334",
                    title="Authentication Anomaly: Distributed Password Spraying from IP 45.142.214.10",
                    threat_level="CRITICAL",
                    scenario_type="AUTH_ANOMALY",
                    target="Accounts: cfo@enterprise.org, hr_director@enterprise.org, devops_lead@enterprise.org | IP: 45.142.214.10",
                    risk_score=85.0,
                    status="New",
                    assigned_to="analyst@cyberguard.ai",
                    notes="Horizontal password spraying observed via python-requests client against executive accounts.",
                    details_json=json.dumps({
                        "attack_vectors": ["Horizontal Password Spraying", "Automated Attack Tooling"],
                        "offending_ips": ["45.142.214.10"],
                        "affected_accounts": ["cfo@enterprise.org", "hr_director@enterprise.org", "lead_engineer@enterprise.org", "it_support@enterprise.org", "devops_lead@enterprise.org"]
                    }),
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                )
            ]
            for inc in demo_incidents:
                db.add(inc)
            db.commit()
            print(f"[Seed] Added baseline demonstration incidents.")
    finally:
        db.close()


# Ensure database schema is initialized
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_database_if_empty()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Cyber Threat, Phishing & Digital Impersonation Detection API with CyberTrust Intelligence™",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local Vite frontend & client access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(analyze.router, prefix=settings.API_V1_STR)
app.include_router(scans.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(incidents.router, prefix=settings.API_V1_STR)
app.include_router(assistant.router, prefix=settings.API_V1_STR)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/")
def root():
    return {
        "service": "CYBERGUARD API",
        "tagline": "Don't just detect the threat. Understand who is behind it.",
        "documentation": "/docs",
        "health": "/api/health"
    }

"""
CYBERGUARD Comprehensive Automated Test Suite
Covers:
- Scenario A: Phishing & Malicious URL / Email / Message detection
- Scenario B: Digital Impersonation & Identity Verification
- Scenario C: Authentication Event Anomaly Detection (Brute Force, Password Spray, Geo-Anomalies)
- Incident Management Lifecycle (New -> Investigating -> Mitigated -> Closed)
- Deterministic Gemini Fallback & Grounding
- Website SSRF Security Controls
"""

import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from app.main import app
from app.services.brand_intelligence import analyze_brand_impersonation
from app.services.impersonation_analyzer import analyze_digital_impersonation
from app.services.auth_anomaly_detector import analyze_auth_events, get_demo_auth_scenarios
from app.services.website_analyzer import is_ssrf_safe_host
from app.services.gemini_service import gemini_service
from ml.features.extractor import extract_url_features
from ml.model_loader import get_model


client = TestClient(app)


# =========================================================================
# 1. SCENARIO A: PHISHING & SOCIAL ENGINEERING TESTS
# =========================================================================

def test_benign_url_classification():
    """Verify official domain is classified as SAFE with low risk score."""
    url = "https://www.microsoft.com/en-us/microsoft-365"
    features = extract_url_features(url)
    brand_analysis = analyze_brand_impersonation(url)
    model = get_model()
    pred, conf, _ = model.predict(features)

    assert brand_analysis["identity_match_status"] == "MATCH"
    assert brand_analysis["is_impersonation"] is False

    response = client.post("/api/analyze/url", json={"url": url})
    assert response.status_code == 200
    data = response.json()
    assert data["threat_level"] == "SAFE"
    assert data["risk_score"] <= 30.0


def test_phishing_url_lookalike():
    """Verify deceptive banking lookalike triggers CRITICAL threat."""
    url = "http://onlinesbi-kyc-verification-portal.com/login.php"
    response = client.post("/api/analyze/url", json={"url": url})
    assert response.status_code == 200
    data = response.json()
    assert data["threat_level"] in ("HIGH RISK", "CRITICAL")
    assert data["risk_score"] >= 70.0
    assert data["cybertrust"]["is_impersonation"] is True
    assert "State Bank of India (SBI)" in data["cybertrust"]["claimed_identity"]


def test_email_threat_analysis():
    """Verify urgent credential demand in email is detected."""
    payload = {
        "sender": "security-alert@onlinesbi-kyc-portal.com",
        "subject": "URGENT: Your NetBanking access is suspended immediately",
        "body": "Dear customer, your SBI account is locked. Click here immediately to submit your OTP and password.",
        "links": ["http://onlinesbi-kyc-portal.com/verify"]
    }
    response = client.post("/api/analyze/email", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["threat_level"] in ("HIGH RISK", "CRITICAL")
    assert data["cybertrust"]["is_impersonation"] is True


def test_sms_message_threat_analysis():
    """Verify fake electricity power disconnection scam is detected."""
    payload = {
        "content": "Dear consumer, electricity power will be disconnected tonight 9:30 PM. Call officer immediately at 9876543210 or pay bill at http://power-bill-update.xyz",
        "platform": "SMS"
    }
    response = client.post("/api/analyze/message", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] >= 60.0
    assert len(data["cybertrust"]["why_flagged"]) > 0


# =========================================================================
# 2. SCENARIO B: DIGITAL IMPERSONATION TESTS
# =========================================================================

def test_impersonation_exact_match():
    """Scenario B: Official PayPal website correctly verifies as EXACT_MATCH."""
    result = analyze_digital_impersonation(
        claimed_organization="PayPal",
        target="https://www.paypal.com/signin"
    )
    assert result["match_status"] == "EXACT_MATCH"
    assert result["impersonation_detected"] is False
    assert result["threat_level"] == "SAFE"
    assert result["risk_score"] <= 15.0


def test_impersonation_homoglyph_deception():
    """Scenario B: Homoglyph 'micr0s0ft' correctly identified as LOOKALIKE."""
    result = analyze_digital_impersonation(
        claimed_organization="Microsoft",
        target="http://micr0s0ft-security-auth.net/login"
    )
    assert result["match_status"] == "LOOKALIKE_IMPERSONATION"
    assert result["impersonation_detected"] is True
    assert result["threat_level"] == "CRITICAL"
    assert len(result["homoglyphs_detected"]) > 0
    assert result["homoglyphs_detected"][0]["character"] == "0"


def test_impersonation_api_endpoint():
    """Scenario B: Test HTTP endpoint with auto-incident creation."""
    payload = {
        "claimed_organization": "State Bank of India (SBI)",
        "target": "http://onlinesbi-kyc-alert.com/login.php",
        "auto_create_incident": True
    }
    response = client.post("/api/analyze/impersonation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["match_status"] == "LOOKALIKE_IMPERSONATION"
    assert data["impersonation_detected"] is True
    assert data["incident_id"] is not None


# =========================================================================
# 3. SCENARIO C: AUTHENTICATION-EVENT ANOMALY DETECTOR TESTS
# =========================================================================

def test_auth_brute_force_detection():
    """Scenario C: High concentration of failed logins on one account."""
    scenarios = get_demo_auth_scenarios()
    brute_force_events = scenarios["brute_force"]

    result = analyze_auth_events(brute_force_events)
    assert result["threat_level"] in ("HIGH RISK", "CRITICAL")
    assert result["anomaly_score"] >= 70.0
    assert "Brute Force Attack" in result["attack_vectors"]
    assert "admin@cyberguard.ai" in result["affected_accounts"]
    assert "185.220.101.5" in result["offending_ips"]


def test_auth_password_spraying_detection():
    """Scenario C: Single IP attempting logins across distinct accounts."""
    scenarios = get_demo_auth_scenarios()
    spray_events = scenarios["password_spraying"]

    result = analyze_auth_events(spray_events)
    assert result["threat_level"] in ("HIGH RISK", "CRITICAL")
    assert "Horizontal Password Spraying" in result["attack_vectors"]
    assert len(result["affected_accounts"]) >= 3
    assert "45.142.214.10" in result["offending_ips"]


def test_auth_impossible_travel_detection():
    """Scenario C: Successive logins from NY and Moscow within minutes (>900 km/h)."""
    scenarios = get_demo_auth_scenarios()
    travel_events = scenarios["impossible_travel"]

    result = analyze_auth_events(travel_events)
    assert "Impossible Travel Velocity" in result["attack_vectors"]
    assert "sarah.connor@cyberguard.ai" in result["affected_accounts"]


def test_auth_anomaly_endpoint():
    """Scenario C: Test HTTP endpoint with auto-incident creation."""
    scenarios = get_demo_auth_scenarios()
    spray_events = scenarios["password_spraying"]

    response = client.post("/api/analyze/auth-events", json={
        "events": spray_events,
        "auto_create_incident": True
    })
    assert response.status_code == 200
    data = response.json()
    assert data["anomaly_score"] >= 70.0
    assert data["incident_id"] is not None


# =========================================================================
# 4. INCIDENT LIFECYCLE MANAGEMENT TESTS
# =========================================================================

def test_incident_lifecycle_workflow():
    """Test full incident workflow: Create -> Read -> Mutate Status -> Verify."""
    # 1. Create Incident
    payload = {
        "title": "Test Incident: Suspicious Token Infiltration",
        "threat_level": "HIGH RISK",
        "scenario_type": "AUTH_ANOMALY",
        "target": "user: secops_lead@cyberguard.ai",
        "risk_score": 75.0,
        "status": "New",
        "assigned_to": "analyst@cyberguard.ai",
        "notes": "Initial alert detected from edge proxy."
    }
    res_create = client.post("/api/incidents", json=payload)
    assert res_create.status_code == 201
    created_data = res_create.json()
    inc_id = created_data["incident_id"]
    assert created_data["status"] == "New"

    # 2. Patch to 'Investigating'
    res_patch1 = client.patch(f"/api/incidents/{inc_id}", json={
        "status": "Investigating",
        "notes": "Analyst inspecting firewall session tokens."
    })
    assert res_patch1.status_code == 200
    assert res_patch1.json()["status"] == "Investigating"

    # 3. Patch to 'Mitigated'
    res_patch2 = client.patch(f"/api/incidents/{inc_id}", json={
        "status": "Mitigated",
        "notes": "Offending IP blocked on border gateway."
    })
    assert res_patch2.status_code == 200
    assert res_patch2.json()["status"] == "Mitigated"

    # 4. Patch to 'Closed'
    res_patch3 = client.patch(f"/api/incidents/{inc_id}", json={
        "status": "Closed",
        "notes": "Incident fully contained. Post-mortem archived."
    })
    assert res_patch3.status_code == 200
    assert res_patch3.json()["status"] == "Closed"


# =========================================================================
# 5. SECURITY CONTROLS & GEMINI FALLBACK
# =========================================================================

def test_ssrf_protection():
    """Verify local loopback and RFC 1918 private IPs are rejected."""
    assert is_ssrf_safe_host("127.0.0.1") is False
    assert is_ssrf_safe_host("10.0.0.1") is False
    assert is_ssrf_safe_host("192.168.1.1") is False
    assert is_ssrf_safe_host("169.254.169.254") is False
    assert is_ssrf_safe_host("8.8.8.8") is True


def test_gemini_assistant_deterministic_fallback():
    """Verify conversational assistant responds gracefully with deterministic fallback."""
    response = client.post("/api/assistant/chat", json={
        "messages": [
            {"role": "user", "content": "I accidentally clicked a phishing link and entered my password. What do I do?"}
        ]
    })
    assert response.status_code == 200
    data = response.json()
    assert "Incident Response Protocol" in data["reply"] or "password" in data["reply"].lower()
    assert len(data["reply"]) > 50


# =========================================================================
# 6. INPUT VALIDATION TESTS (GIBBERISH REJECTION)
# =========================================================================

def test_invalid_gibberish_url_rejected():
    """Verify random unbroken string without domain extension is rejected."""
    response = client.post("/api/analyze/url", json={"url": "jbhiuoihgiepghi"})
    assert response.status_code == 422

    response2 = client.post("/api/analyze/website", json={"url": "justrandomtextwithoutdot"})
    assert response2.status_code == 422


def test_invalid_email_sender_rejected():
    """Verify malformed email sender without @ or domain is rejected."""
    response = client.post("/api/analyze/email", json={
        "sender": "jbhiuoihgiepghi",
        "subject": "Urgent update",
        "body": "Please click the link"
    })
    assert response.status_code == 422


def test_invalid_short_message_rejected():
    """Verify trivial/empty message content is rejected."""
    response = client.post("/api/analyze/message", json={"content": "hi"})
    assert response.status_code == 422


def test_invalid_impersonation_target_rejected():
    """Verify gibberish target destination without TLD is rejected."""
    response = client.post("/api/analyze/impersonation", json={
        "claimed_organization": "PayPal",
        "target": "jbhiuoihgiepghi"
    })
    assert response.status_code == 422


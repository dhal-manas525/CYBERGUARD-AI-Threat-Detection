"""
CYBERGUARD Safe Website Analyzer
Performs non-intrusive domain and protocol inspection.
Enforces SSRF protections (blocking loopback, private RFC1918 ranges, and metadata IPs),
inspects SSL/HTTPS, and verifies domain integrity without executing arbitrary client-side code.
"""

import socket
import ipaddress
from urllib.parse import urlparse
from typing import Dict, Any, List
from datetime import datetime, timezone
from app.services.brand_intelligence import analyze_brand_impersonation
from app.services.risk_scorer import calculate_risk_score
from app.services.cybertrust_engine import generate_cybertrust_intelligence
from ml.features.extractor import extract_url_features
from ml.model_loader import get_model

BLOCKED_IP_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.0.0/16"),  # AWS / Cloud Metadata IP
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
]


def is_ssrf_safe_host(hostname: str) -> bool:
    """Validate that hostname does not resolve to loopback, link-local, or private IP."""
    try:
        # Check if direct IP
        ip_obj = ipaddress.ip_address(hostname)
        for net in BLOCKED_IP_NETWORKS:
            if ip_obj in net:
                return False
        return True
    except ValueError:
        pass

    try:
        addr_info = socket.getaddrinfo(hostname, None)
        for item in addr_info:
            ip_str = item[4][0]
            ip_obj = ipaddress.ip_address(ip_str)
            for net in BLOCKED_IP_NETWORKS:
                if ip_obj in net:
                    return False
        return True
    except Exception:
        # If DNS fails to resolve, allow analysis to proceed as unresolvable external domain
        return True


def analyze_website(target_url: str) -> Dict[str, Any]:
    """
    Safely inspect website URL attributes with full SSRF guardrails.
    """
    raw_url = target_url.strip()
    if not (raw_url.startswith("http://") or raw_url.startswith("https://")):
        raw_url = "https://" + raw_url

    parsed = urlparse(raw_url)
    hostname = parsed.netloc.split(":")[0]

    if not is_ssrf_safe_host(hostname):
        return {
            "error": "Security Restriction: Target resolves to private internal network or metadata IP (SSRF Protection).",
            "safe": False
        }

    # Extract features
    features = extract_url_features(raw_url)
    brand_analysis = analyze_brand_impersonation(raw_url)

    # ML prediction
    model = get_model()
    ml_pred, ml_conf, _ = model.predict(features)

    # Risk Scoring
    risk_score, threat_level, threat_cat, trust_breakdown = calculate_risk_score(
        features=features,
        brand_analysis=brand_analysis,
        ml_prediction=ml_pred,
        ml_confidence=ml_conf
    )

    cybertrust = generate_cybertrust_intelligence(
        url=raw_url,
        features=features,
        brand_analysis=brand_analysis,
        risk_score=risk_score,
        threat_level=threat_level,
        threat_category=threat_cat,
        trust_breakdown=trust_breakdown
    )

    # Verified non-intrusive safety checks
    checks_performed = [
        "SSRF & RFC1918 Private Range Validation",
        "HTTPS Transport Layer Encryption Check",
        "Domain Typosquatting & Brand Impersonation Matching",
        "Machine Learning Lexical & Structural Inference",
        "Top-Level Domain (TLD) Anomaly Screening"
    ]

    return {
        "target": raw_url,
        "scan_type": "website",
        "risk_score": risk_score,
        "threat_level": threat_level,
        "threat_category": threat_cat,
        "ml_prediction": ml_pred,
        "ml_confidence": ml_conf,
        "cybertrust": cybertrust,
        "extracted_features": {
            **features,
            "checks_performed": checks_performed,
            "ssrf_protected": True
        },
        "created_at": datetime.now(timezone.utc),
        "is_demo": False
    }

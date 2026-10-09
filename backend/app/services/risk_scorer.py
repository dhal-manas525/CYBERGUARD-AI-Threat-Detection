"""
CYBERGUARD Transparent Risk Scoring Engine
Calculates balanced risk scores (0-100) based on mathematical signal aggregation:
- URL Structural indicators (length, entropy, subdomains, special chars)
- Identity & Impersonation risk
- Keyword and social engineering signals
- Machine learning confidence
Clearly separates model confidence from threat score and explicitly flags offline intelligence.
"""

from typing import Dict, Any, Tuple


def calculate_risk_score(
    features: Dict[str, Any],
    brand_analysis: Dict[str, Any],
    ml_prediction: str,
    ml_confidence: float
) -> Tuple[float, str, str, Dict[str, Any]]:
    """
    Computes:
    - risk_score: float (0.0 to 100.0)
    - threat_level: 'SAFE' | 'SUSPICIOUS' | 'HIGH RISK' | 'CRITICAL'
    - threat_category: descriptive category
    - trust_breakdown: detailed percentage indicators for UI
    """
    # 1. URL Structure Score (0 to 100)
    url_score = 0.0
    if features.get("is_ip_address"):
        url_score += 40.0
    if features.get("num_dots", 0) > 3:
        url_score += 15.0
    if features.get("num_subdomains", 0) > 2:
        url_score += 15.0
    if features.get("has_hyphen"):
        url_score += 10.0
    if features.get("has_at_symbol"):
        url_score += 25.0
    if features.get("unusual_tld"):
        url_score += 20.0
    if features.get("encoded_chars_count", 0) > 2:
        url_score += 10.0
    if features.get("entropy", 0.0) > 3.8:
        url_score += 15.0
    if features.get("url_length", 0) > 75:
        url_score += 10.0
    if not features.get("has_https"):
        url_score += 15.0
    url_score = min(100.0, max(5.0 if not features.get("has_https") else 0.0, url_score))

    # 2. Content & Intent Signals Score (0 to 100)
    content_score = 0.0
    login_kws = features.get("login_keywords_count", 0)
    verify_kws = features.get("verification_keywords_count", 0)
    pay_kws = features.get("payment_keywords_count", 0)
    acc_kws = features.get("account_keywords_count", 0)
    gen_kws = features.get("suspicious_keywords_count", 0)

    total_kws = login_kws + verify_kws + pay_kws + acc_kws + gen_kws
    if total_kws > 0:
        content_score += min(50.0, total_kws * 18.0)
    if verify_kws > 0 and (login_kws > 0 or pay_kws > 0):
        content_score += 30.0  # High urgency combination (KYC + login)
    if features.get("typosquatting_indicator"):
        content_score += 25.0
    content_score = min(100.0, content_score)

    # 3. Identity Trust Score (0 to 100, where 100 = verified official, 0 = severe mismatch/impersonation)
    # For threat risk calculation, we convert identity penalty:
    is_impersonation = brand_analysis.get("is_impersonation", False)
    match_status = brand_analysis.get("identity_match_status")

    if match_status == "MATCH":
        identity_trust_pct = 98.0
        identity_risk_penalty = 0.0
    elif is_impersonation:
        identity_trust_pct = 8.0  # Severe trust deficit
        identity_risk_penalty = 85.0
    elif match_status == "UNKNOWN":
        identity_trust_pct = 50.0  # Neutral
        identity_risk_penalty = 15.0 if url_score > 30 else 5.0
    else:
        identity_trust_pct = 30.0
        identity_risk_penalty = 40.0

    # 4. ML Model Contribution
    if ml_prediction == "MALICIOUS":
        ml_risk_weight = 75.0 + (ml_confidence * 25.0)
    elif ml_prediction == "SUSPICIOUS":
        ml_risk_weight = 40.0 + (ml_confidence * 20.0)
    else:
        ml_risk_weight = 10.0 * (1.0 - ml_confidence)

    # Composite Risk Calculation (Weighted multi-criteria decision)
    if match_status == "MATCH":
        # Verified official site: drastically reduce risk unless severe payload detected
        final_risk = min(22.0, (url_score * 0.1) + (content_score * 0.1))
    elif is_impersonation:
        # Detected impersonation: baseline risk is minimum 78
        final_risk = max(78.0, (identity_risk_penalty * 0.45) + (url_score * 0.2) + (content_score * 0.2) + (ml_risk_weight * 0.15))
    else:
        # Standard weighted composite
        final_risk = (url_score * 0.30) + (content_score * 0.30) + (identity_risk_penalty * 0.15) + (ml_risk_weight * 0.25)

    final_risk = round(min(100.0, max(0.0, final_risk)), 1)

    # Assign Threat Level
    if final_risk <= 30.0:
        threat_level = "SAFE"
    elif final_risk <= 60.0:
        threat_level = "SUSPICIOUS"
    elif final_risk <= 80.0:
        threat_level = "HIGH RISK"
    else:
        threat_level = "CRITICAL"

    # Determine Threat Category
    if match_status == "MATCH":
        threat_category = "Verified Legitimate Domain"
    elif is_impersonation:
        brand_name = brand_analysis.get("impersonated_brand", "Brand")
        if any(k in str(features) for k in ["kyc", "bank", "pay", "card", "wallet"]):
            threat_category = f"Financial Impersonation & Phishing ({brand_name})"
        elif "Microsoft" in brand_name or "Google" in brand_name:
            threat_category = f"Enterprise SSO Credential Harvester ({brand_name})"
        else:
            threat_category = f"Brand Impersonation & Phishing ({brand_name})"
    elif features.get("is_ip_address"):
        threat_category = "Direct IP Host / Rogue Server"
    elif content_score >= 60.0 and url_score >= 50.0:
        threat_category = "Credential Phishing & Social Engineering"
    elif features.get("unusual_tld") and total_kws > 0:
        threat_category = "Suspicious Domain / Spam Portal"
    elif final_risk > 30.0:
        threat_category = "Anomalous Web Resource"
    else:
        threat_category = "Standard Web Resource"

    trust_breakdown = {
        "url_structure_risk": round(url_score, 1),
        "identity_trust_score": round(identity_trust_pct, 1),
        "content_signals_risk": round(content_score, 1),
        "ml_model_confidence": round(ml_confidence * 100.0, 1),
        "external_threat_intel": "N/A — Operating in Autonomous Edge Heuristic Mode (No Live Third-Party Feed)"
    }

    return final_risk, threat_level, threat_category, trust_breakdown

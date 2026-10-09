"""
CYBERGUARD CyberTrust Intelligence™ Core Engine
Transforms raw mathematical scores into explainable, actionable security intelligence.
Answers the foundational question: "Why should I trust this?"
"""

from typing import Dict, Any, List
from app.schemas.scan import CyberTrustIntelligence


def generate_cybertrust_intelligence(
    url: str,
    features: Dict[str, Any],
    brand_analysis: Dict[str, Any],
    risk_score: float,
    threat_level: str,
    threat_category: str,
    trust_breakdown: Dict[str, Any]
) -> CyberTrustIntelligence:
    """
    Constructs explainable CyberTrust Intelligence with verified reasons,
    specific attack motives, and user mitigations.
    """
    is_impersonation = brand_analysis.get("is_impersonation", False)
    match_status = brand_analysis.get("identity_match_status", "UNKNOWN")
    claimed_id = brand_analysis.get("claimed_identity", "Independent / Unknown Entity")
    official_domain = brand_analysis.get("official_domain")
    brand_goals = brand_analysis.get("typical_attack_goals")

    why_flagged: List[str] = []
    
    # 1. Structural evidence
    if features.get("is_ip_address"):
        why_flagged.append("Hosted directly on an IP address instead of a legitimate domain name.")
    if features.get("typosquatting_indicator"):
        why_flagged.append("Domain uses deceptive hyphenation or compound naming patterns commonly seen in spoofing.")
    if features.get("has_at_symbol"):
        why_flagged.append("URL contains '@' symbol, often used to obscure true destination hostname.")
    if features.get("unusual_tld"):
        why_flagged.append("Registered under a high-risk or disposable top-level domain (.xyz, .top, .icu, etc.).")
    if not features.get("has_https"):
        why_flagged.append("Unencrypted connection: transmitted data is not protected by HTTPS.")
    if features.get("num_subdomains", 0) >= 3:
        why_flagged.append(f"Excessive subdomains ({features.get('num_subdomains')} levels) typical of phishing infrastructure.")
    if features.get("encoded_chars_count", 0) >= 3:
        why_flagged.append("Heavy percent-encoding detected in URL path, suggesting obfuscation techniques.")

    # 2. Content & Keyword evidence
    if features.get("login_keywords_count", 0) > 0:
        why_flagged.append("URL contains login/authentication keywords targeting user credentials.")
    if features.get("verification_keywords_count", 0) > 0:
        why_flagged.append("URL contains urgent verification/KYC keywords indicative of social engineering.")
    if features.get("payment_keywords_count", 0) > 0:
        why_flagged.append("Payment or billing related keywords detected in unverified domain path.")

    # 3. Identity and brand mismatch evidence
    if is_impersonation:
        for ind in brand_analysis.get("indicators", []):
            why_flagged.append(ind)
        why_flagged.append(f"Domain fails identity verification: official domain is '{official_domain}', not the analyzed host.")
    elif match_status == "MATCH":
        why_flagged.append(f"Domain matches known official security records for {claimed_id} ({official_domain}).")
    else:
        if threat_level in ("HIGH RISK", "CRITICAL"):
            why_flagged.append("Domain possesses high entropy and matches structural anomalies found in credential harvesters.")
        elif threat_level == "SUSPICIOUS":
            why_flagged.append("Target shows mild anomalies or marketing redirects; exercise standard caution.")
        else:
            why_flagged.append("No brand impersonation patterns or phishing signatures detected in domain structure.")

    # Determine Possible Attack Goal
    if is_impersonation and brand_goals:
        attack_goal = f"Targeted theft of {brand_goals}."
    elif features.get("is_ip_address"):
        attack_goal = "Direct communication with command-and-control server or unauthenticated staging portal."
    elif features.get("login_keywords_count", 0) > 0 or features.get("account_keywords_count", 0) > 0:
        attack_goal = "Account takeover, password harvesting, or session token interception."
    elif features.get("verification_keywords_count", 0) > 0:
        attack_goal = "Social engineering to steal one-time passwords (OTPs) or identity documents."
    elif features.get("payment_keywords_count", 0) > 0:
        attack_goal = "Financial fraud, credit card exfiltration, or fraudulent payment gateway redirect."
    elif threat_level in ("HIGH RISK", "CRITICAL"):
        attack_goal = "Malicious file distribution or drive-by credential harvesting."
    elif threat_level == "SUSPICIOUS":
        attack_goal = "Spam redirection, lead generation, or low-grade affiliate trap."
    else:
        attack_goal = "Legitimate web interaction / Informational access."

    # Determine Actionable Recommendations
    recommended_actions: List[str] = []
    if threat_level == "CRITICAL":
        recommended_actions.append("DO NOT enter any passwords, OTPs, ATM PINs, or financial details.")
        recommended_actions.append("Close this browser tab immediately and avoid downloading any files.")
        if official_domain:
            recommended_actions.append(f"If you need to access {claimed_id}, navigate manually to the official site: https://{official_domain}")
        recommended_actions.append("Report this link to your IT security team or national cybercrime portal.")
    elif threat_level == "HIGH RISK":
        recommended_actions.append("Exercise extreme caution: do not authenticate or share sensitive personal data.")
        recommended_actions.append("Verify the sender's origin through a secondary, independent communication channel.")
        if official_domain:
            recommended_actions.append(f"Ensure you only interact with official channels at https://{official_domain}")
        recommended_actions.append("Check if your browser or endpoint security flagged this domain.")
    elif threat_level == "SUSPICIOUS":
        recommended_actions.append("Inspect the URL carefully before proceeding.")
        recommended_actions.append("Avoid providing administrative permissions or installing browser extensions.")
        recommended_actions.append("Verify whether this link was unsolicited before clicking any embedded buttons.")
    else:
        recommended_actions.append("This URL exhibits healthy structural and cryptographic indicators.")
        recommended_actions.append("Ensure regular cybersecurity hygiene: use a password manager and enable multi-factor authentication (MFA).")

    return CyberTrustIntelligence(
        claimed_identity=claimed_id,
        identity_match_status=match_status,
        is_impersonation=is_impersonation,
        impersonated_brand=brand_analysis.get("impersonated_brand"),
        official_domain=official_domain,
        why_flagged=why_flagged,
        possible_attack_goal=attack_goal,
        recommended_actions=recommended_actions,
        trust_breakdown=trust_breakdown
    )

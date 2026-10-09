"""
CYBERGUARD Messaging & Scam Analyzer
Detects SMS, WhatsApp, Telegram, and Social Media deceptive messages:
- Fake part-time jobs / YouTube like scams
- Crypto investment schemes
- Electricity / Utility disconnection SMS scams
- OTP & SIM swap social engineering
- Lottery & Gift voucher hoaxes
"""

import re
from typing import Dict, Any, List
from datetime import datetime, timezone
from app.schemas.scan import CyberTrustIntelligence

SCAM_PATTERNS = [
    {
        "category": "Fake Job / Work-From-Home Scam",
        "regex": r"(?:part-?time\s+job|work\s+from\s+home|earn\s+\$?\d+[\d,]*\s*(?:daily|per\s+day|monthly)|like\s+youtube\s+videos?|telegram\s+task|simple\s+tasks?\s+earn)",
        "goal": "Advance-fee task fraud / Task deposit extortion",
        "severity": 82.0
    },
    {
        "category": "Utility / Electricity Bill Disconnection Scam",
        "regex": r"(?:electricity|power|bill)\s+(?:will\s+be\s+disconnected|update\s+immediately|tonight\s+at\s+\d+|call\s+officer)",
        "goal": "Immediate coercive payment to fraudulent UPI / mule bank account",
        "severity": 88.0
    },
    {
        "category": "High-Yield Investment / Crypto Ponzi Scam",
        "regex": r"(?:guaranteed\s+(?:returns?|profit)|crypto\s+mining|bitcoin\s+multiplier|double\s+your\s+money|vip\s+trading\s+signals?|airdrop\s+bonus)",
        "goal": "Theft of cryptocurrency deposits / Private wallet key extraction",
        "severity": 85.0
    },
    {
        "category": "OTP / Banking Verification Social Engineering",
        "regex": r"(?:share\s+(?:the\s+)?(?:otp|code|pin)|verify\s+sim|kyc\s+expired|pan\s+card\s+link|block\s+your\s+card|debit\s+card\s+blocked)",
        "goal": "Immediate financial account compromise and transaction authorization",
        "severity": 92.0
    },
    {
        "category": "Lottery / Prize / Gift Voucher Scam",
        "regex": r"(?:congratulations|you\s+have\s+won|lottery\s+winner|claim\s+your\s+(?:prize|gift\s+card|iphone|bmw)|lucky\s+draw|kbc\s+winner)",
        "goal": "Advance registration fee theft and identity document harvesting",
        "severity": 78.0
    },
    {
        "category": "Impersonated Customer Support",
        "regex": r"(?:customer\s+support\s+desk|official\s+helpdesk|contact\s+manager\s+via\s+telegram|whatsapp\s+care)",
        "goal": "Installing remote desktop tool (AnyDesk/TeamViewer) to drain accounts",
        "severity": 80.0
    }
]


def analyze_message_threat(content: str, platform: str = "Generic / SMS") -> Dict[str, Any]:
    """Analyzes message text and categorizes scam vectors."""
    clean_text = content.strip()
    lower_text = clean_text.lower()

    detected_scams = []
    max_severity = 10.0
    primary_category = "Clean Communication"
    attack_goal = "Standard interpersonal communication."

    for pattern in SCAM_PATTERNS:
        match = re.search(pattern["regex"], lower_text)
        if match:
            detected_scams.append({
                "category": pattern["category"],
                "goal": pattern["goal"],
                "severity": pattern["severity"],
                "snippet": match.group(0)
            })
            if pattern["severity"] > max_severity:
                max_severity = pattern["severity"]
                primary_category = pattern["category"]
                attack_goal = pattern["goal"]

    # Extract any links inside message
    extracted_urls = re.findall(r"https?://[^\s]+|bit\.ly/[^\s]+|t\.me/[^\s]+|wa\.me/[^\s]+", clean_text)
    
    why_flagged = []
    if detected_scams:
        for ds in detected_scams:
            why_flagged.append(f"Detected {ds['category']} pattern: match on '{ds['snippet']}'.")
    if extracted_urls:
        why_flagged.append(f"Message prompts recipient to open external link(s): {', '.join(extracted_urls[:2])}.")
        max_severity = min(100.0, max_severity + 10.0)

    # Risk Score calculation
    risk = round(min(100.0, max(5.0, max_severity)), 1)

    if risk <= 30.0:
        threat_level = "SAFE"
        recommendations = [
            "Message contains standard conversational or operational content.",
            "Never share personal authentication codes, even with trusted contacts."
        ]
        why_flagged.append("No coercive urgency or financial extraction triggers discovered.")
    elif risk <= 60.0:
        threat_level = "SUSPICIOUS"
        recommendations = [
            "Do not click shortened links (e.g. bit.ly, wa.me) from unknown numbers.",
            "Verify sender identity before replying."
        ]
    elif risk <= 80.0:
        threat_level = "HIGH RISK"
        recommendations = [
            "Do not call any phone numbers listed in this message.",
            "Do not pay any advance fees or 'taxes' to claim winnings.",
            "Block the sender number and report as spam."
        ]
    else:
        threat_level = "CRITICAL"
        recommendations = [
            "DO NOT SHARE YOUR OTP OR CLICK ANY ATTACHED LINKS.",
            "Banks and government agencies will never ask for your OTP over SMS or WhatsApp.",
            "Block sender immediately and report to cybercrime authorities."
        ]

    cybertrust = CyberTrustIntelligence(
        claimed_identity=primary_category.split("/")[0].strip() if detected_scams else "Personal / Direct Sender",
        identity_match_status="MISMATCH" if detected_scams else "UNKNOWN",
        is_impersonation=bool(detected_scams),
        impersonated_brand=None,
        official_domain=None,
        why_flagged=why_flagged,
        possible_attack_goal=attack_goal,
        recommended_actions=recommendations,
        trust_breakdown={
            "social_engineering_score": risk,
            "financial_pressure_intensity": 90.0 if any("Bill" in ds["category"] or "Investment" in ds["category"] for ds in detected_scams) else 20.0,
            "credential_solicitation_risk": 95.0 if any("OTP" in ds["category"] for ds in detected_scams) else 10.0,
            "nlp_pattern_confidence": 93.0,
            "external_threat_intel": "N/A — Autonomous Regex/NLP Rule Engine"
        }
    )

    return {
        "target": f"[{platform}] {clean_text[:60]}...",
        "scan_type": "message",
        "risk_score": risk,
        "threat_level": threat_level,
        "threat_category": primary_category,
        "ml_prediction": "MALICIOUS" if risk >= 70 else ("SUSPICIOUS" if risk >= 35 else "SAFE"),
        "ml_confidence": 0.91,
        "cybertrust": cybertrust,
        "extracted_features": {
            "platform": platform,
            "message_length": len(clean_text),
            "detected_scam_count": len(detected_scams),
            "extracted_urls_count": len(extracted_urls),
            "contains_urgency": risk > 60
        },
        "created_at": datetime.now(timezone.utc),
        "is_demo": False
    }

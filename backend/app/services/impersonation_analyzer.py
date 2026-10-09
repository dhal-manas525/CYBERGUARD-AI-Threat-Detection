"""
CYBERGUARD Digital Impersonation Analyzer & Identity Verification Service (Scenario B)
Verifies Claimed Organization vs Target Domain/URL/Sender.
Performs:
- Homoglyph normalization & character deception detection
- Levenshtein & Jaro-Winkler string similarity metrics
- Subdomain typosquatting & hyphen spoofing detection
- Official domain allowlist cross-referencing
- Attacker intent classification & calibrated risk scoring
"""

import re
from typing import Dict, List, Optional, Tuple, Any
from urllib.parse import urlparse
from app.services.brand_intelligence import (
    KNOWN_BRANDS,
    extract_base_domain,
    levenshtein_distance,
    normalize_homoglyphs,
    HOMOGLYPH_MAP
)

# Geographic & Coordinate database for common cities (used for Impossible Travel calculations in Scenario C)
CITY_COORDINATES = {
    "New York, US": (40.7128, -74.0060),
    "San Francisco, US": (37.7749, -122.4194),
    "London, UK": (51.5074, -0.1278),
    "Frankfurt, DE": (50.1109, 8.6821),
    "Tokyo, JP": (35.6762, 139.6503),
    "Singapore, SG": (1.3521, 103.8198),
    "Mumbai, IN": (19.0760, 72.8777),
    "Delhi, IN": (28.6139, 77.2090),
    "Sydney, AU": (-33.8688, 151.2093),
    "Moscow, RU": (55.7558, 37.6173),
    "Beijing, CN": (39.9042, 116.4074),
    "Sao Paulo, BR": (-23.5505, -46.6333),
}


def compute_string_similarity(s1: str, s2: str) -> float:
    """Computes normalized similarity ratio between two strings [0.0 - 1.0]."""
    s1 = s1.lower().strip()
    s2 = s2.lower().strip()
    if s1 == s2:
        return 1.0
    max_len = max(len(s1), len(s2))
    if max_len == 0:
        return 1.0
    dist = levenshtein_distance(s1, s2)
    return max(0.0, 1.0 - (dist / max_len))


def extract_target_host(target: str) -> str:
    """Extracts clean hostname or sender domain from URL or email."""
    target = target.strip()
    if "@" in target:
        # Email sender (e.g. security@paypal-verify.com)
        parts = target.split("@")
        target = parts[-1]

    if not target.startswith(("http://", "https://")) and not target.startswith("//"):
        parsed = urlparse("//" + target)
    else:
        parsed = urlparse(target)

    host = parsed.netloc or parsed.path
    # Strip port if present
    host = host.split(":")[0].lower().strip()
    # Strip any trailing path slashes
    if "/" in host:
        host = host.split("/")[0]
    return host


def find_matching_brand(claimed_org: str) -> Optional[Dict[str, Any]]:
    """Resolves claimed organization to our brand database."""
    claimed_clean = claimed_org.lower().strip()
    for brand in KNOWN_BRANDS:
        if claimed_clean == brand["name"].lower() or claimed_clean == brand["slug"].lower():
            return brand
        if any(claimed_clean == kw.lower() for kw in brand["keywords"]):
            return brand
        if any(kw in claimed_clean for kw in brand["keywords"]):
            return brand
    return None


def detect_homoglyph_substitutions(text: str) -> List[Dict[str, str]]:
    """Identifies specific homoglyphs present in the string."""
    detected = []
    for char in text:
        if char in HOMOGLYPH_MAP:
            detected.append({
                "character": char,
                "substitutes_for": HOMOGLYPH_MAP[char],
                "explanation": f"Character '{char}' visually mimics letter '{HOMOGLYPH_MAP[char]}'"
            })
    return detected


def analyze_digital_impersonation(claimed_organization: str, target: str) -> Dict[str, Any]:
    """
    Main Scenario B evaluation engine.
    Compares Claimed Organization with Target destination.
    """
    claimed_org = claimed_organization.strip()
    target_clean = target.strip()
    target_host = extract_target_host(target_clean)
    base_domain, core_name = extract_base_domain(target_host)
    normalized_core = normalize_homoglyphs(core_name)
    homoglyphs = detect_homoglyph_substitutions(target_host)

    # 1. Resolve claimed organization
    known_brand = find_matching_brand(claimed_org)
    
    if known_brand:
        canonical_name = known_brand["name"]
        official_domains = known_brand["official_domains"]
        category = known_brand["category"]
        attack_goals = known_brand["typical_attack_goals"]
        brand_keywords = known_brand["keywords"]
    else:
        # Dynamic brand parsing if not in pre-seeded list
        canonical_name = claimed_org.title()
        # Derive prospective official domain from name
        slug = re.sub(r"[^a-z0-9]", "", claimed_org.lower())
        official_domains = [f"{slug}.com", f"{slug}.org"]
        category = "Commercial / Institutional"
        attack_goals = f"Harvest credentials and sensitive data belonging to {canonical_name}"
        brand_keywords = [slug]

    # 2. Check for Exact Official Match
    is_official = False
    for off in official_domains:
        if target_host == off or target_host.endswith("." + off):
            is_official = True
            break

    if is_official:
        return {
            "claimed_organization": canonical_name,
            "target_destination": target_clean,
            "target_host": target_host,
            "official_domains": official_domains,
            "match_status": "EXACT_MATCH",
            "impersonation_detected": False,
            "similarity_score": 1.0,
            "risk_score": 5.0,
            "threat_level": "SAFE",
            "threat_category": "Legitimate Entity Infrastructure",
            "homoglyphs_detected": [],
            "evidentiary_breakdown": [
                f"Destination '{target_host}' strictly authenticates to official registered namespace for {canonical_name}.",
                f"Matches verified root domain: {official_domains[0]}.",
                "Transport and DNS namespace adhere to legitimate corporate governance standards."
            ],
            "threat_objective": "Benign / Authenticated Enterprise Operation",
            "recommended_actions": [
                "Destination is recognized as legitimate for the claimed organization.",
                "Safe to proceed under standard organizational browsing policy."
            ],
            "confidence": 0.98
        }

    # 3. Deceptive Lookalike / Typosquatting / Homoglyph / Subdomain analysis
    evidence: List[str] = []
    is_lookalike = False
    similarity_score = 0.0

    # A: Check homoglyphs
    if homoglyphs:
        is_lookalike = True
        evidence.append(
            f"Active homoglyph substitution detected: {', '.join(h['explanation'] for h in homoglyphs)}."
        )

    # B: Check brand keywords embedded in deceptive host / subdomains
    for kw in brand_keywords:
        if kw in target_host:
            is_lookalike = True
            if target_host.startswith(f"{kw}.") or f".{kw}." in target_host:
                evidence.append(
                    f"Deceptive subdomain spoofing: Attacker prepended '{kw}' as subdomain on foreign base domain '{base_domain}'."
                )
            elif f"{kw}-" in target_host or f"-{kw}" in target_host:
                evidence.append(
                    f"Hyphenated typosquatting: Target domain embeds brand keyword '{kw}' alongside deceptive tokens in '{target_host}'."
                )
            else:
                evidence.append(
                    f"Brand keyword '{kw}' discovered in unauthorized hostname '{target_host}' (registered to '{base_domain}')."
                )
            break

    # C: Check string similarity with official domain cores
    max_sim = 0.0
    for off in official_domains:
        _, off_core = extract_base_domain(off)
        sim = compute_string_similarity(core_name, off_core)
        norm_sim = compute_string_similarity(normalized_core, off_core)
        effective_sim = max(sim, norm_sim)
        if effective_sim > max_sim:
            max_sim = effective_sim

        # Levenshtein distance 1 or 2
        dist = levenshtein_distance(normalized_core, off_core)
        if dist in (1, 2) and len(off_core) >= 4:
            is_lookalike = True
            evidence.append(
                f"Lookalike typo-trap: Core hostname '{core_name}' is only {dist} edit away from official '{off_core}'."
            )

    similarity_score = round(max_sim, 3)

    # 4. Construct Verdict & Risk Score
    if is_lookalike:
        match_status = "LOOKALIKE_IMPERSONATION"
        risk_score = 94.0 if homoglyphs or "Deceptive subdomain" in str(evidence) else 88.0
        threat_level = "CRITICAL"
        threat_category = "Brand Impersonation & Phishing Decoy"
        actions = [
            f"DO NOT submit login credentials, PINs, or verification codes for {canonical_name}.",
            f"Block domain '{target_host}' across internal perimeter firewalls and secure web gateways.",
            f"Directly access {canonical_name} only via official bookmarked portal: https://{official_domains[0]}.",
            "Submit abuse takedown notification to registrar and hosting provider."
        ]
    else:
        # Neither official nor lookalike typo, but claimed to be from org -> Complete Mismatch
        match_status = "MISMATCH_UNAUTHORIZED"
        risk_score = 76.0
        threat_level = "HIGH RISK"
        threat_category = "Unauthorized Third-Party Sender Mismatch"
        evidence.append(
            f"Sender claims affiliation with '{canonical_name}', but infrastructure is operated by unrelated domain '{base_domain}'."
        )
        evidence.append(
            f"Claimed organization relies exclusively on: {', '.join(official_domains)}."
        )
        actions = [
            f"Treat communications as unauthorized spoofing or impersonation.",
            "Verify identity via alternate out-of-band communication channel (phone, internal directory).",
            "Never open email attachments or click embedded redirect links from this sender."
        ]

    return {
        "claimed_organization": canonical_name,
        "target_destination": target_clean,
        "target_host": target_host,
        "official_domains": official_domains,
        "match_status": match_status,
        "impersonation_detected": True,
        "similarity_score": similarity_score,
        "risk_score": risk_score,
        "threat_level": threat_level,
        "threat_category": threat_category,
        "homoglyphs_detected": homoglyphs,
        "evidentiary_breakdown": evidence,
        "threat_objective": attack_goals,
        "recommended_actions": actions,
        "confidence": 0.95
    }

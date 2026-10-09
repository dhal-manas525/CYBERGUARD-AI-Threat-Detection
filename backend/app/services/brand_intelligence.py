"""
CYBERGUARD Brand Impersonation & Identity Intelligence Engine
Detects claimed identities, typosquatting, homoglyph deception, look-alike domains,
and brand spoofing across financial institutions, tech leaders, government, and couriers.
"""

import re
from typing import Dict, List, Optional, Tuple, Any
from urllib.parse import urlparse

# Pre-defined known brand database (extensible via database/config)
KNOWN_BRANDS = [
    {
        "name": "State Bank of India (SBI)",
        "slug": "sbi",
        "official_domains": ["onlinesbi.sbi", "sbi.co.in", "onlinesbi.com", "bank.sbi"],
        "keywords": ["sbi", "onlinesbi", "statebankofindia", "sbicard", "yono"],
        "category": "Banking & Finance",
        "high_value": True,
        "typical_attack_goals": "Internet banking credentials, transaction OTP, debit card numbers"
    },
    {
        "name": "HDFC Bank",
        "slug": "hdfc",
        "official_domains": ["hdfcbank.com", "hdfc.com", "netbanking.hdfcbank.com"],
        "keywords": ["hdfc", "hdfcbank", "netbanking-hdfc"],
        "category": "Banking & Finance",
        "high_value": True,
        "typical_attack_goals": "NetBanking Customer ID, IPIN, OTP harvesting"
    },
    {
        "name": "ICICI Bank",
        "slug": "icici",
        "official_domains": ["icicibank.com", "infinity.icicibank.com"],
        "keywords": ["icici", "icicibank", "imobile"],
        "category": "Banking & Finance",
        "high_value": True,
        "typical_attack_goals": "User ID, password, Grid card values, OTP"
    },
    {
        "name": "PayPal",
        "slug": "paypal",
        "official_domains": ["paypal.com", "paypal.me"],
        "keywords": ["paypal", "paypal-security", "pay-pal"],
        "category": "Payment Services",
        "high_value": True,
        "typical_attack_goals": "PayPal login, connected credit card numbers, billing addresses"
    },
    {
        "name": "Microsoft",
        "slug": "microsoft",
        "official_domains": ["microsoft.com", "live.com", "office.com", "outlook.com", "microsoftonline.com", "azure.com"],
        "keywords": ["microsoft", "office365", "o365", "outlook", "msft", "onedrive", "azure"],
        "category": "Technology & Cloud",
        "high_value": True,
        "typical_attack_goals": "Enterprise M365 session cookies, corporate credentials, Outlook email access"
    },
    {
        "name": "Google",
        "slug": "google",
        "official_domains": ["google.com", "accounts.google.com", "gmail.com", "youtube.com"],
        "keywords": ["google", "gmail", "gsuite", "workspace", "googledrive"],
        "category": "Technology & Cloud",
        "high_value": True,
        "typical_attack_goals": "Google account credentials, OAuth consent tokens, 2FA prompt intercepts"
    },
    {
        "name": "Apple",
        "slug": "apple",
        "official_domains": ["apple.com", "icloud.com", "appleid.apple.com"],
        "keywords": ["apple", "appleid", "icloud", "itunes", "findmy"],
        "category": "Consumer Technology",
        "high_value": True,
        "typical_attack_goals": "Apple ID, iCloud device lock bypass, credit card information"
    },
    {
        "name": "Amazon",
        "slug": "amazon",
        "official_domains": ["amazon.com", "amazon.in", "amazon.co.uk", "aws.amazon.com"],
        "keywords": ["amazon", "aws", "primevideo", "amazonpay"],
        "category": "E-Commerce & Cloud",
        "high_value": True,
        "typical_attack_goals": "Amazon account access, stored payment cards, gift card theft"
    },
    {
        "name": "Netflix",
        "slug": "netflix",
        "official_domains": ["netflix.com"],
        "keywords": ["netflix", "netflix-billing", "netflix-members"],
        "category": "Entertainment & Streaming",
        "high_value": False,
        "typical_attack_goals": "Streaming account takeover, updated credit card CVV"
    },
    {
        "name": "Chase Bank (JPMorgan Chase)",
        "slug": "chase",
        "official_domains": ["chase.com", "jpmorgan.com"],
        "keywords": ["chase", "chasebank", "jpmorgan"],
        "category": "Banking & Finance",
        "high_value": True,
        "typical_attack_goals": "Online banking login, account takeover, wire fraud"
    },
    {
        "name": "Bank of America",
        "slug": "bofa",
        "official_domains": ["bankofamerica.com", "bofa.com"],
        "keywords": ["bankofamerica", "bofa", "bofabank"],
        "category": "Banking & Finance",
        "high_value": True,
        "typical_attack_goals": "Bank account access, routing details, authentication answers"
    },
    {
        "name": "Internal Revenue Service (IRS)",
        "slug": "irs",
        "official_domains": ["irs.gov"],
        "keywords": ["irs", "irs-tax", "taxrefund", "irs-gov"],
        "category": "Government & Tax",
        "high_value": True,
        "typical_attack_goals": "Social Security Numbers (SSN), tax refund diversion, identity theft"
    },
    {
        "name": "USPS / Postal Service",
        "slug": "usps",
        "official_domains": ["usps.com", "postcalc.usps.com"],
        "keywords": ["usps", "usps-post", "usps-tracking", "postal-service"],
        "category": "Logistics & Delivery",
        "high_value": True,
        "typical_attack_goals": "Redelivery fee payment scams, credit card details"
    },
    {
        "name": "DHL Express",
        "slug": "dhl",
        "official_domains": ["dhl.com", "dhl.de"],
        "keywords": ["dhl", "dhl-express", "dhl-parcel", "dhl-tracking"],
        "category": "Logistics & Delivery",
        "high_value": True,
        "typical_attack_goals": "Customs clearance fees, malicious attachment delivery"
    },
    {
        "name": "FedEx",
        "slug": "fedex",
        "official_domains": ["fedex.com"],
        "keywords": ["fedex", "fedex-express", "fedex-delivery"],
        "category": "Logistics & Delivery",
        "high_value": True,
        "typical_attack_goals": "Package release fees, phishing credential harvesting"
    },
    {
        "name": "Meta / Facebook / Instagram",
        "slug": "meta",
        "official_domains": ["meta.com", "facebook.com", "instagram.com", "whatsapp.com"],
        "keywords": ["facebook", "instagram", "whatsapp", "meta-business", "copyright-appeal"],
        "category": "Social Media",
        "high_value": True,
        "typical_attack_goals": "Social media session hijack, business ads manager takeover"
    },
    {
        "name": "Telegram",
        "slug": "telegram",
        "official_domains": ["telegram.org", "t.me", "web.telegram.org"],
        "keywords": ["telegram", "tele-gram"],
        "category": "Messaging",
        "high_value": True,
        "typical_attack_goals": "SMS login code intercept, crypto private key theft"
    },
    {
        "name": "Binance / Crypto Exchange",
        "slug": "binance",
        "official_domains": ["binance.com"],
        "keywords": ["binance", "binance-us", "bnb"],
        "category": "Cryptocurrency",
        "high_value": True,
        "typical_attack_goals": "Crypto wallet drain, 2FA recovery backup codes"
    }
]

# Lookalike homoglyph mapping (common character replacements in phishing)
HOMOGLYPH_MAP = {
    '0': 'o',
    '1': 'l',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '8': 'b',
    '@': 'a',
    '$': 's',
    'v': 'u',
    'w': 'vv'
}


def normalize_homoglyphs(text: str) -> str:
    """Normalize common typosquatting substitutions (e.g. micr0s0ft -> microsoft)."""
    res = text.lower()
    for char, replacement in HOMOGLYPH_MAP.items():
        res = res.replace(char, replacement)
    return res


def levenshtein_distance(s1: str, s2: str) -> int:
    """Compute classic Levenshtein edit distance."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]


def extract_base_domain(hostname: str) -> Tuple[str, str]:
    """
    Extract base domain and second-level domain name (e.g., 'portal.sbi.co.in' -> 'sbi.co.in', 'sbi').
    """
    host = hostname.lower().strip()
    parts = host.split(".")
    if len(parts) <= 1:
        return host, host
    
    # Check for known two-part ccTLDs like .co.in, .gov.in, .co.uk, .com.au
    two_part_tlds = {"co.in", "gov.in", "ac.in", "co.uk", "org.uk", "com.au", "net.au"}
    joined_last_two = ".".join(parts[-2:])
    
    if joined_last_two in two_part_tlds and len(parts) >= 3:
        base_domain = ".".join(parts[-3:])
        core_name = parts[-3]
    else:
        base_domain = ".".join(parts[-2:])
        core_name = parts[-2]

    return base_domain, core_name


def analyze_brand_impersonation(target_url: str) -> Dict[str, Any]:
    """
    Evaluates whether target_url is an official entity, look-alike domain,
    or brand impersonation attempt.
    """
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", target_url):
        target_url = "http://" + target_url

    parsed = urlparse(target_url)
    hostname = parsed.netloc.lower().split(":")[0]
    path = parsed.path.lower()
    full_url = target_url.lower()

    base_domain, core_name = extract_base_domain(hostname)
    norm_core_name = normalize_homoglyphs(core_name)

    # 1. Check if exactly an official domain
    for brand in KNOWN_BRANDS:
        for official in brand["official_domains"]:
            if hostname == official or hostname.endswith("." + official):
                return {
                    "claimed_identity": brand["name"],
                    "brand_slug": brand["slug"],
                    "identity_match_status": "MATCH",
                    "is_impersonation": False,
                    "impersonated_brand": None,
                    "official_domain": official,
                    "category": brand["category"],
                    "confidence": 0.98,
                    "indicators": ["Target hostname matches verified official domain"],
                    "typical_attack_goals": None
                }

    # 2. Check for Impersonation / Typosquatting / Look-alike
    detected_impersonation = None
    strongest_evidence = []
    
    for brand in KNOWN_BRANDS:
        brand_name = brand["name"]
        primary_official = brand["official_domains"][0]

        # A: Brand keyword appears in subdomain or hyphenated domain but base domain is NOT official
        # e.g., onlinesbi-kyc-verification.com or paypal-security-update.top or sbi.update-banking.xyz
        for kw in brand["keywords"]:
            # Check hyphenated or compound in hostname
            if kw in hostname and not any(hostname.endswith(off) for off in brand["official_domains"]):
                # Confirm it's not a generic false positive
                is_sub = hostname.startswith(f"{kw}.")
                is_hyphen = f"{kw}-" in hostname or f"-{kw}" in hostname
                is_direct_substring = kw in core_name
                
                if is_sub or is_hyphen or is_direct_substring:
                    evidence = f"Domain '{hostname}' contains '{kw}' referencing '{brand_name}' but registers to an unauthorized base domain '{base_domain}'."
                    detected_impersonation = brand
                    strongest_evidence.append(evidence)
                    break

        if detected_impersonation:
            break

        # B: Check Levenshtein distance & Homoglyphs on core name
        for official in brand["official_domains"]:
            off_base, off_core = extract_base_domain(official)
            
            # Check normalized homoglyph equivalence (e.g. micr0s0ft -> microsoft)
            if norm_core_name == off_core and core_name != off_core:
                detected_impersonation = brand
                strongest_evidence.append(
                    f"Homoglyph/typosquatting detected: '{core_name}' mimics official brand core '{off_core}'."
                )
                break

            # Check edit distance (distance of 1 or 2 on words longer than 5 chars)
            if len(off_core) >= 5 and abs(len(core_name) - len(off_core)) <= 2:
                dist = levenshtein_distance(core_name, off_core)
                if dist in (1, 2):
                    detected_impersonation = brand
                    strongest_evidence.append(
                        f"Deceptive look-alike domain: '{core_name}' is {dist} character edit away from official '{off_core}'."
                    )
                    break

        if detected_impersonation:
            break

        # C: Check if brand keyword is in path alongside login/auth keywords
        # e.g. evil-phish.com/sbi/login.php or attacker.com/paypal/signin
        for kw in brand["keywords"]:
            if (f"/{kw}/" in path or f"/{kw}-" in path or f"={kw}" in full_url) and any(
                auth_word in full_url for auth_word in ["login", "signin", "verify", "kyc", "auth", "session"]
            ):
                detected_impersonation = brand
                strongest_evidence.append(
                    f"URL path specifically targets {brand_name} ('{kw}') credentials while hosted on untrusted host '{hostname}'."
                )
                break

        if detected_impersonation:
            break

    if detected_impersonation:
        return {
            "claimed_identity": detected_impersonation["name"],
            "brand_slug": detected_impersonation["slug"],
            "identity_match_status": "LOOKALIKE_DETECTED",
            "is_impersonation": True,
            "impersonated_brand": detected_impersonation["name"],
            "official_domain": detected_impersonation["official_domains"][0],
            "category": detected_impersonation["category"],
            "confidence": 0.94,
            "indicators": strongest_evidence,
            "typical_attack_goals": detected_impersonation["typical_attack_goals"]
        }

    # 3. No specific brand identified, generic domain
    return {
        "claimed_identity": "Independent / Unknown Entity",
        "brand_slug": None,
        "identity_match_status": "UNKNOWN",
        "is_impersonation": False,
        "impersonated_brand": None,
        "official_domain": None,
        "category": "General Web Resource",
        "confidence": 0.60,
        "indicators": [f"Domain '{hostname}' does not match high-risk brand watchlists."],
        "typical_attack_goals": None
    }

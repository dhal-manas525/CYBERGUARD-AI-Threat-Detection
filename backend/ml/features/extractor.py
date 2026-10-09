import re
import math
from urllib.parse import urlparse, unquote
from typing import Dict, Any, List

# Suspicious keywords sets
LOGIN_KEYWORDS = {
    "login", "signin", "logon", "sign-in", "portal", "session", "auth", "authenticate", "sso"
}
VERIFICATION_KEYWORDS = {
    "verify", "verification", "confirm", "validation", "kyc", "activate", "renew", "unlock", "security-check"
}
PAYMENT_KEYWORDS = {
    "payment", "pay", "checkout", "billing", "invoice", "card", "wallet", "transfer", "refund", "upi"
}
ACCOUNT_KEYWORDS = {
    "account", "user", "profile", "password", "security", "credential", "reset", "recover", "member"
}
SUSPICIOUS_GENERAL_KEYWORDS = {
    "free", "gift", "bonus", "reward", "prize", "winner", "urgent", "update-now", "alert", "notice",
    "secure-banking", "support-desk", "webscr", "cmd", "dispatch", "delivery-track"
}
UNUSUAL_TLDS = {
    ".xyz", ".top", ".work", ".icu", ".buzz", ".club", ".tk", ".ga", ".ml", ".cf", ".gq",
    ".fit", ".date", ".faith", ".zip", ".mov", ".country", ".kim", ".stream", ".rest"
}

IP_REGEX = re.compile(
    r"^(?:https?:\/\/)?(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:$|\/)"
)

def calculate_entropy(text: str) -> float:
    """Calculate Shannon entropy of a string."""
    if not text:
        return 0.0
    entropy = 0.0
    length = len(text)
    freq = {}
    for char in text:
        freq[char] = freq.get(char, 0) + 1
    for count in freq.values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 4)


def extract_url_features(url_string: str) -> Dict[str, Any]:
    """
    Modular, safe URL feature extractor.
    Extracts 21 numeric/boolean indicators for security and ML models.
    """
    raw_url = url_string.strip()
    
    # Prepend scheme if missing for safe standard parsing
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", raw_url):
        parseable_url = "http://" + raw_url
    else:
        parseable_url = raw_url

    parsed = urlparse(parseable_url)
    domain = parsed.netloc.lower().split(":")[0]  # strip port
    path = parsed.path
    query = parsed.query

    # IP address check
    is_ip = 1 if IP_REGEX.search(raw_url) or re.match(r"^(\d{1,3}\.){3}\d{1,3}$", domain) else 0

    # Subdomains
    domain_parts = domain.split(".")
    num_subdomains = max(0, len(domain_parts) - 2) if not is_ip else 0

    # Special characters in URL
    special_chars = set("!$&'()*+,;=@-_~%#?")
    num_special_chars = sum(1 for c in raw_url if c in special_chars)
    num_digits = sum(1 for c in raw_url if c.isdigit())
    num_dots = raw_url.count(".")

    # Scheme
    has_https = 1 if raw_url.lower().startswith("https://") else 0
    has_http = 1 if raw_url.lower().startswith("http://") else 0
    has_at_symbol = 1 if "@" in raw_url else 0
    has_hyphen = 1 if "-" in domain else 0

    # Unusual TLD
    unusual_tld = 0
    for tld in UNUSUAL_TLDS:
        if domain.endswith(tld):
            unusual_tld = 1
            break

    # Encoded characters
    encoded_chars_count = len(re.findall(r"%[0-9a-fA-F]{2}", raw_url))

    # Keyword frequencies (domain + path + query)
    full_lower = raw_url.lower()
    
    login_kw_count = sum(1 for kw in LOGIN_KEYWORDS if kw in full_lower)
    verify_kw_count = sum(1 for kw in VERIFICATION_KEYWORDS if kw in full_lower)
    pay_kw_count = sum(1 for kw in PAYMENT_KEYWORDS if kw in full_lower)
    account_kw_count = sum(1 for kw in ACCOUNT_KEYWORDS if kw in full_lower)
    suspicious_kw_count = sum(1 for kw in SUSPICIOUS_GENERAL_KEYWORDS if kw in full_lower)

    # Typosquatting / deceptive structure indicator
    # e.g., excessive hyphens in domain, brand names combined with login or numbers
    typosquatting = 0
    if domain.count("-") >= 2 or (domain.count("-") >= 1 and any(k in domain for k in ("secure", "login", "account", "support", "verify"))):
        typosquatting = 1

    entropy = calculate_entropy(domain)

    features = {
        "url_length": len(raw_url),
        "domain_length": len(domain),
        "path_length": len(path),
        "num_dots": num_dots,
        "num_subdomains": num_subdomains,
        "num_special_chars": num_special_chars,
        "num_digits": num_digits,
        "has_https": has_https,
        "has_http": has_http,
        "is_ip_address": is_ip,
        "has_at_symbol": has_at_symbol,
        "has_hyphen": has_hyphen,
        "suspicious_keywords_count": suspicious_kw_count,
        "login_keywords_count": login_kw_count,
        "verification_keywords_count": verify_kw_count,
        "payment_keywords_count": pay_kw_count,
        "account_keywords_count": account_kw_count,
        "unusual_tld": unusual_tld,
        "encoded_chars_count": encoded_chars_count,
        "entropy": entropy,
        "typosquatting_indicator": typosquatting,
    }

    return features


FEATURE_NAMES: List[str] = [
    "url_length",
    "domain_length",
    "path_length",
    "num_dots",
    "num_subdomains",
    "num_special_chars",
    "num_digits",
    "has_https",
    "has_http",
    "is_ip_address",
    "has_at_symbol",
    "has_hyphen",
    "suspicious_keywords_count",
    "login_keywords_count",
    "verification_keywords_count",
    "payment_keywords_count",
    "account_keywords_count",
    "unusual_tld",
    "encoded_chars_count",
    "entropy",
    "typosquatting_indicator",
]


def features_to_vector(features: Dict[str, Any]) -> List[float]:
    """Convert features dictionary to ordered numerical vector for ML model."""
    return [float(features.get(name, 0.0)) for name in FEATURE_NAMES]

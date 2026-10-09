"""
CYBERGUARD Input Validation Engine
Enforces strict lexical and structural validation across:
- URLs and Domain names (rejecting gibberish like 'jbhiuoihgiepghi')
- Email addresses and sender headers
- Scam message payloads
- Claimed identities and targets
"""

import re
import ipaddress
from urllib.parse import urlparse
from typing import Tuple, Optional

# Regex for valid domain label: letters, digits, hyphens (cannot start/end with hyphen)
DOMAIN_LABEL_REGEX = re.compile(r"^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$")

# Standard email format
EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


def is_valid_ipv4(ip_str: str) -> bool:
    """Check if string is valid IPv4."""
    try:
        ip = ipaddress.ip_address(ip_str)
        return ip.version == 4
    except ValueError:
        return False


def validate_url_or_domain(value: str) -> Tuple[bool, Optional[str]]:
    """
    Validates whether value is a structurally plausible URL or domain.
    Rejects unbroken gibberish like 'jbhiuoihgiepghi', missing TLDs, and illegal characters.
    Returns (is_valid, error_message).
    """
    if not value or not isinstance(value, str):
        return False, "Input cannot be empty."

    val = value.strip()
    if len(val) < 3:
        return False, "Destination input is too short to be a valid URL or domain."

    if len(val) > 2048:
        return False, "URL exceeds maximum permitted length (2048 characters)."

    # Reject whitespace inside URL/domain
    if " " in val or "\t" in val or "\n" in val:
        return False, "URLs and domains cannot contain spaces."

    # Parse protocol if present
    parsed = urlparse(val if "://" in val else "//" + val)
    netloc = parsed.netloc or parsed.path

    # Netloc might contain port or userinfo
    if "@" in netloc:
        netloc = netloc.split("@")[-1]
    if ":" in netloc:
        netloc = netloc.split(":")[0]

    # Hostname portion
    hostname = netloc.strip().lower()

    if not hostname:
        return False, "No valid hostname or domain found in the input."

    # Check if host is valid IP address (e.g. 185.220.101.5)
    if is_valid_ipv4(hostname):
        return True, None

    # Check for localhost / loopback
    if hostname == "localhost":
        return True, None

    # Hostname must contain at least one dot to have a TLD
    # Strings like 'jbhiuoihgiepghi' or 'mywebsite' have NO dot -> Invalid!
    if "." not in hostname:
        return False, (
            f"'{val}' is not a valid URL or domain. A valid domain must include a domain extension "
            f"(e.g., '.com', '.org', '.net', or '.in'). Example: 'example.com' or 'https://site.org'."
        )

    labels = hostname.split(".")

    # Minimum 2 labels (domain + TLD)
    if len(labels) < 2:
        return False, "Domain must contain a name and top-level domain extension (e.g. example.com)."

    # Validate each label
    for i, label in enumerate(labels):
        if not label:
            return False, "Domain cannot contain consecutive dots or empty labels."

        # Punycode / IDN support (xn--)
        if label.startswith("xn--"):
            continue

        if not DOMAIN_LABEL_REGEX.match(label):
            return False, (
                f"Domain label '{label}' contains invalid characters. "
                f"Domain names can only contain alphanumeric characters and hyphens."
            )

    # Validate Top-Level Domain (TLD) - last label
    tld = labels[-1]
    if len(tld) < 2:
        return False, f"Domain extension '.{tld}' is invalid. Top-level domains must be at least 2 characters."

    if not tld.isalpha():
        return False, f"Domain extension '.{tld}' is invalid. Top-level domains cannot contain digits or symbols."

    return True, None


def validate_email_address(email: str) -> Tuple[bool, Optional[str]]:
    """Validates email format (e.g. user@domain.com)."""
    if not email or not isinstance(email, str):
        return False, "Email sender cannot be empty."

    clean = email.strip()
    # Strip optional display name like 'Security Alert <alert@bank.com>'
    if "<" in clean and ">" in clean:
        match = re.search(r"<([^>]+)>", clean)
        if match:
            clean = match.group(1).strip()

    if not EMAIL_REGEX.match(clean):
        return False, (
            f"'{email}' is not a valid email address. "
            f"Expected standard format like 'security@company.com' or 'support@service.org'."
        )

    # Validate domain part of email
    domain_part = clean.split("@")[-1]
    is_valid_dom, err = validate_url_or_domain(domain_part)
    if not is_valid_dom:
        return False, f"Email sender domain is invalid: {err}"

    return True, None


def validate_message_content(content: str) -> Tuple[bool, Optional[str]]:
    """Validates message text for analysis."""
    if not content or not isinstance(content, str):
        return False, "Message content cannot be empty."

    clean = content.strip()
    if len(clean) < 8:
        return False, "Message content is too short for threat analysis (minimum 8 characters required)."

    # Check if content is just a single unbroken random word without spaces or punctuation
    if " " not in clean and len(clean) > 25 and not clean.startswith(("http://", "https://")):
        return False, "Message contains an unbroken string of characters without words. Please enter realistic message text."

    return True, None

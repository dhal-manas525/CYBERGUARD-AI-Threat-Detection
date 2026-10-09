"""
CYBERGUARD Authentication-Event Anomaly Detector (Scenario C)
Performs batch authentication event and login log inspection.
Detects:
1. Brute Force Attacks (repeated credential failures targeting specific accounts)
2. Password Spraying Attacks (single IP rotating passwords across multiple distinct user accounts)
3. Impossible Travel / Geo-Velocity Anomalies (successive events across disparate geographic locations within impossible travel windows)
4. Anomalous User Agents & Automated Attack Tools (Hydra, curl, python-requests, headless scrapers)
5. Volumetric Bursts & Rate Anomalies

Returns structured security findings, composite statistical anomaly scoring, affected entities,
and incident response playbooks.
"""

import math
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from collections import defaultdict

# Reference geo coordinates for impossible travel velocity calculation
GEO_LOCATIONS: Dict[str, Tuple[float, float]] = {
    "New York, US": (40.7128, -74.0060),
    "San Francisco, US": (37.7749, -122.4194),
    "Chicago, US": (41.8781, -87.6298),
    "London, UK": (51.5074, -0.1278),
    "Paris, FR": (48.8566, 2.3522),
    "Frankfurt, DE": (50.1109, 8.6821),
    "Tokyo, JP": (35.6762, 139.6503),
    "Singapore, SG": (1.3521, 103.8198),
    "Mumbai, IN": (19.0760, 72.8777),
    "Bengaluru, IN": (12.9716, 77.5946),
    "Sydney, AU": (-33.8688, 151.2093),
    "Moscow, RU": (55.7558, 37.6173),
    "Beijing, CN": (39.9042, 116.4074),
    "Toronto, CA": (43.6532, -79.3832),
    "Sao Paulo, BR": (-23.5505, -46.6333),
    "Dubai, AE": (25.2048, 55.2708),
    "Hong Kong, HK": (22.3193, 114.1694),
}

KNOWN_ATTACK_TOOLS = [
    "hydra", "medusa", "nmap", "sqlmap", "curl", "python-requests",
    "go-http-client", "postmanruntime", "masscan", "zgrab", "nikto"
]


def haversine_distance_km(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
    """Calculate the great-circle distance between two points on Earth in kilometers."""
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    R = 6371.0  # Earth radius in km

    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def parse_timestamp(ts_str: Any) -> datetime:
    """Safely parse ISO timestamp into timezone-aware datetime."""
    if isinstance(ts_str, datetime):
        return ts_str if ts_str.tzinfo else ts_str.replace(tzinfo=timezone.utc)
    try:
        # Strip trailing Z and parse
        clean_ts = str(ts_str).replace("Z", "+00:00")
        dt = datetime.fromisoformat(clean_ts)
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    except Exception:
        return datetime.now(timezone.utc)


def analyze_auth_events(events: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Core Scenario C detector. Evaluates batch authentication events.
    """
    if not events:
        return {
            "total_events": 0,
            "anomaly_score": 0.0,
            "threat_level": "SAFE",
            "threat_category": "No Activity Observed",
            "anomalies_detected": [],
            "affected_accounts": [],
            "offending_ips": [],
            "attack_vectors": [],
            "summary": "No authentication records submitted for analysis.",
            "recommended_response": ["Maintain routine log telemetry monitoring."]
        }

    # Normalize events and sort chronologically
    normalized_events = []
    for e in events:
        ne = dict(e)
        ne["parsed_time"] = parse_timestamp(ne.get("timestamp"))
        ne["username"] = str(ne.get("username", "anonymous")).strip()
        ne["ip_address"] = str(ne.get("ip_address", "0.0.0.0")).strip()
        ne["status"] = str(ne.get("status", "SUCCESS")).upper().strip()
        ne["location"] = str(ne.get("location", "Unknown Location")).strip()
        ne["user_agent"] = str(ne.get("user_agent", "Standard Browser")).strip()
        normalized_events.append(ne)

    normalized_events.sort(key=lambda x: x["parsed_time"])

    anomalies: List[Dict[str, Any]] = []
    offending_ips = set()
    affected_accounts = set()
    attack_vectors = set()
    anomaly_points = 0.0

    # -------------------------------------------------------------
    # 1. BRUTE FORCE DETECTION (Per-account failure bursts)
    # -------------------------------------------------------------
    user_failures = defaultdict(list)
    for evt in normalized_events:
        if evt["status"] == "FAILURE":
            user_failures[evt["username"]].append(evt)

    for username, failures in user_failures.items():
        if len(failures) >= 3:
            # Check time interval between first and last failure
            t_first = failures[0]["parsed_time"]
            t_last = failures[-1]["parsed_time"]
            delta_mins = max(1, (t_last - t_first).total_seconds() / 60.0)

            # High density of failures
            rate_per_min = len(failures) / delta_mins
            ips = list({f["ip_address"] for f in failures})
            for ip in ips:
                offending_ips.add(ip)
            affected_accounts.add(username)
            attack_vectors.add("Brute Force Attack")

            severity = "CRITICAL" if len(failures) >= 6 or rate_per_min > 2.0 else "HIGH"
            anomaly_points += 75.0 if severity == "CRITICAL" else 62.0

            anomalies.append({
                "type": "BRUTE_FORCE",
                "severity": severity,
                "title": f"Brute Force Password Guessing on Account '{username}'",
                "affected_account": username,
                "offending_ip": ips[0] if len(ips) == 1 else f"Multiple ({len(ips)} IPs)",
                "event_count": len(failures),
                "description": (
                    f"Observed {len(failures)} consecutive failed authentication attempts targeting "
                    f"user '{username}' across {round(delta_mins, 1)} minutes from IP(s): {', '.join(ips[:3])}."
                ),
                "timestamp": t_last.isoformat()
            })

    # -------------------------------------------------------------
    # 2. PASSWORD SPRAYING DETECTION (Single IP rotating accounts)
    # -------------------------------------------------------------
    ip_attempts = defaultdict(list)
    for evt in normalized_events:
        ip_attempts[evt["ip_address"]].append(evt)

    for ip, evts in ip_attempts.items():
        failed_evts = [e for e in evts if e["status"] == "FAILURE"]
        targeted_users = list({e["username"] for e in failed_evts})

        if len(targeted_users) >= 3:
            # Single IP attempting logins across 3 or more distinct usernames
            offending_ips.add(ip)
            for u in targeted_users:
                affected_accounts.add(u)
            attack_vectors.add("Horizontal Password Spraying")
            anomaly_points += 82.0

            anomalies.append({
                "type": "PASSWORD_SPRAY",
                "severity": "CRITICAL",
                "title": f"Horizontal Password Spraying Originating from IP {ip}",
                "affected_account": f"{len(targeted_users)} accounts ({', '.join(targeted_users[:3])}...)",
                "offending_ip": ip,
                "event_count": len(failed_evts),
                "description": (
                    f"Adversary at IP {ip} tested credentials against {len(targeted_users)} distinct user accounts "
                    f"({', '.join(targeted_users)}), a hallmark signature of evasive password spraying."
                ),
                "timestamp": evts[-1]["parsed_time"].isoformat()
            })

    # -------------------------------------------------------------
    # 3. IMPOSSIBLE TRAVEL / GEO-VELOCITY ANOMALIES
    # -------------------------------------------------------------
    user_timeline = defaultdict(list)
    for evt in normalized_events:
        user_timeline[evt["username"]].append(evt)

    for username, timeline in user_timeline.items():
        if len(timeline) < 2:
            continue

        for i in range(len(timeline) - 1):
            e1 = timeline[i]
            e2 = timeline[i + 1]

            loc1 = e1["location"]
            loc2 = e2["location"]

            if loc1 != loc2 and loc1 in GEO_LOCATIONS and loc2 in GEO_LOCATIONS:
                coord1 = GEO_LOCATIONS[loc1]
                coord2 = GEO_LOCATIONS[loc2]
                dist_km = haversine_distance_km(coord1, coord2)

                time_diff_hours = abs((e2["parsed_time"] - e1["parsed_time"]).total_seconds()) / 3600.0

                if time_diff_hours < 0.001:
                    time_diff_hours = 0.01  # Prevent div by zero

                velocity_kmh = dist_km / time_diff_hours

                # Max commercial flight speed ~ 900 km/h. If velocity > 900 km/h, physically impossible
                if dist_km > 500 and velocity_kmh > 900:
                    affected_accounts.add(username)
                    offending_ips.add(e2["ip_address"])
                    attack_vectors.add("Impossible Travel Velocity")
                    anomaly_points += 75.0

                    anomalies.append({
                        "type": "IMPOSSIBLE_TRAVEL",
                        "severity": "CRITICAL" if e2["status"] == "SUCCESS" else "HIGH",
                        "title": f"Impossible Travel Anomaly Detected for User '{username}'",
                        "affected_account": username,
                        "offending_ip": e2["ip_address"],
                        "event_count": 2,
                        "description": (
                            f"Authentication recorded from {loc1} and then {loc2} ({round(dist_km)} km away) "
                            f"within {round(time_diff_hours * 60, 1)} minutes, implying an impossible physical velocity "
                            f"of {round(velocity_kmh)} km/h. Indicates active session/credential compromise via foreign proxy."
                        ),
                        "timestamp": e2["parsed_time"].isoformat()
                    })

    # -------------------------------------------------------------
    # 4. ANOMALOUS USER-AGENTS & AUTOMATED ATTACK TOOLS
    # -------------------------------------------------------------
    for evt in normalized_events:
        ua_lower = evt["user_agent"].lower()
        for tool in KNOWN_ATTACK_TOOLS:
            if tool in ua_lower:
                offending_ips.add(evt["ip_address"])
                affected_accounts.add(evt["username"])
                attack_vectors.add("Automated Attack Tooling")
                anomaly_points += 20.0

                anomalies.append({
                    "type": "SUSPICIOUS_CLIENT",
                    "severity": "HIGH",
                    "title": f"Automated Security Tool User-Agent Detected ({tool.upper()})",
                    "affected_account": evt["username"],
                    "offending_ip": evt["ip_address"],
                    "event_count": 1,
                    "description": (
                        f"Authentication request from IP {evt['ip_address']} utilized known adversary/scraping "
                        f"tool identifier '{evt['user_agent']}'."
                    ),
                    "timestamp": evt["parsed_time"].isoformat()
                })
                break

    # -------------------------------------------------------------
    # 5. VOLUMETRIC SPIKE (Auth rate anomaly)
    # -------------------------------------------------------------
    total_events = len(normalized_events)
    if total_events >= 10:
        t_start = normalized_events[0]["parsed_time"]
        t_end = normalized_events[-1]["parsed_time"]
        total_span_mins = max(1.0, (t_end - t_start).total_seconds() / 60.0)
        overall_rate = total_events / total_span_mins

        if overall_rate > 5.0 and len(anomalies) > 0:
            anomaly_points += 15.0
            attack_vectors.add("Volumetric Authentication Surge")

    # -------------------------------------------------------------
    # COMPOSITE SCORING & SOC RESPONSE PLAYBOOK
    # -------------------------------------------------------------
    composite_score = min(100.0, max(0.0, round(anomaly_points, 1)))

    if composite_score >= 81:
        threat_level = "CRITICAL"
        threat_category = "Active Coordinated Credential Attack"
    elif composite_score >= 61:
        threat_level = "HIGH RISK"
        threat_category = "Targeted Authentication Abuse"
    elif composite_score >= 31:
        threat_level = "SUSPICIOUS"
        threat_category = "Abnormal Authentication Pattern"
    else:
        threat_level = "SAFE"
        threat_category = "Normal Enterprise Baseline"
        composite_score = max(5.0, composite_score)

    # Response Playbook recommendations
    playbook = []
    if "Brute Force Attack" in attack_vectors:
        playbook.append("Temporarily enforce progressive login delay and CAPTCHA challenge on targeted accounts.")
        playbook.append(f"Deploy IP-rate limiting rule across perimeter gateway for offending IP addresses.")

    if "Horizontal Password Spraying" in attack_vectors:
        playbook.append("Immediately block identified Spraying IP(s) on Edge WAF and Cloudflare/Perimeter Firewalls.")
        playbook.append("Trigger mandatory out-of-band password reset notification for all sprayed accounts.")

    if "Impossible Travel Velocity" in attack_vectors:
        playbook.append("Invalidate all active OAuth session tokens and refresh tokens for affected account.")
        playbook.append("Enforce step-up FIDO2 / Hardware MFA challenge on subsequent login attempts.")

    if "Automated Attack Tooling" in attack_vectors:
        playbook.append("Reject non-browser HTTP User-Agent strings at edge API Gateway.")

    if not playbook:
        playbook = [
            "Log telemetry within normal parameters. Continue standard continuous monitoring.",
            "Verify all corporate identities have multi-factor authentication (MFA) enabled."
        ]

    # Executive SOC Summary
    if threat_level in ("CRITICAL", "HIGH RISK"):
        summary = (
            f"SECURITY INCIDENT ALERT: Detected {len(anomalies)} anomalous patterns with a threat score of "
            f"{composite_score}/100 ({threat_level}). Identified vectors: {', '.join(attack_vectors)}. "
            f"Adversary activity directly impacts {len(affected_accounts)} account(s) across {len(offending_ips)} external IP(s)."
        )
    elif threat_level == "SUSPICIOUS":
        summary = (
            f"ANOMALY ADVISORY: Observed irregular authentication frequency with an anomaly score of "
            f"{composite_score}/100 ({threat_level}). Low-confidence intrusion or misconfigured script detected."
        )
    else:
        summary = (
            f"TELEMETRY BENCHMARK: Analyzed {total_events} authentication events. Patterns conform to authorized "
            f"user behavior with no automated brute-forcing or geo-hopping anomalies detected."
        )

    return {
        "total_events": total_events,
        "anomaly_score": composite_score,
        "threat_level": threat_level,
        "threat_category": threat_category,
        "anomalies_detected": anomalies,
        "affected_accounts": sorted(list(affected_accounts)),
        "offending_ips": sorted(list(offending_ips)),
        "attack_vectors": sorted(list(attack_vectors)),
        "summary": summary,
        "recommended_response": playbook,
        "analyzed_at": datetime.now(timezone.utc).isoformat()
    }


def get_demo_auth_scenarios() -> Dict[str, List[Dict[str, Any]]]:
    """Pre-configured synthetic scenarios for instant 1-click demonstration during reviews."""
    now = datetime.now(timezone.utc)
    from datetime import timedelta

    return {
        "brute_force": [
            {
                "timestamp": (now - timedelta(minutes=5)).isoformat(),
                "username": "admin@cyberguard.ai",
                "ip_address": "185.220.101.5",
                "location": "Moscow, RU",
                "status": "FAILURE",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0"
            },
            {
                "timestamp": (now - timedelta(minutes=4)).isoformat(),
                "username": "admin@cyberguard.ai",
                "ip_address": "185.220.101.5",
                "location": "Moscow, RU",
                "status": "FAILURE",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0"
            },
            {
                "timestamp": (now - timedelta(minutes=3)).isoformat(),
                "username": "admin@cyberguard.ai",
                "ip_address": "185.220.101.5",
                "location": "Moscow, RU",
                "status": "FAILURE",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0"
            },
            {
                "timestamp": (now - timedelta(minutes=2)).isoformat(),
                "username": "admin@cyberguard.ai",
                "ip_address": "185.220.101.5",
                "location": "Moscow, RU",
                "status": "FAILURE",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0"
            },
            {
                "timestamp": (now - timedelta(minutes=1)).isoformat(),
                "username": "admin@cyberguard.ai",
                "ip_address": "185.220.101.5",
                "location": "Moscow, RU",
                "status": "FAILURE",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0"
            },
            {
                "timestamp": now.isoformat(),
                "username": "admin@cyberguard.ai",
                "ip_address": "185.220.101.5",
                "location": "Moscow, RU",
                "status": "FAILURE",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0"
            }
        ],
        "password_spraying": [
            {
                "timestamp": (now - timedelta(minutes=8)).isoformat(),
                "username": "cfo@enterprise.org",
                "ip_address": "45.142.214.10",
                "location": "Frankfurt, DE",
                "status": "FAILURE",
                "user_agent": "python-requests/2.28.1"
            },
            {
                "timestamp": (now - timedelta(minutes=6)).isoformat(),
                "username": "hr_director@enterprise.org",
                "ip_address": "45.142.214.10",
                "location": "Frankfurt, DE",
                "status": "FAILURE",
                "user_agent": "python-requests/2.28.1"
            },
            {
                "timestamp": (now - timedelta(minutes=4)).isoformat(),
                "username": "lead_engineer@enterprise.org",
                "ip_address": "45.142.214.10",
                "location": "Frankfurt, DE",
                "status": "FAILURE",
                "user_agent": "python-requests/2.28.1"
            },
            {
                "timestamp": (now - timedelta(minutes=2)).isoformat(),
                "username": "it_support@enterprise.org",
                "ip_address": "45.142.214.10",
                "location": "Frankfurt, DE",
                "status": "FAILURE",
                "user_agent": "python-requests/2.28.1"
            },
            {
                "timestamp": now.isoformat(),
                "username": "devops_lead@enterprise.org",
                "ip_address": "45.142.214.10",
                "location": "Frankfurt, DE",
                "status": "FAILURE",
                "user_agent": "python-requests/2.28.1"
            }
        ],
        "impossible_travel": [
            {
                "timestamp": (now - timedelta(minutes=15)).isoformat(),
                "username": "sarah.connor@cyberguard.ai",
                "ip_address": "66.249.66.1",
                "location": "New York, US",
                "status": "SUCCESS",
                "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0"
            },
            {
                "timestamp": now.isoformat(),
                "username": "sarah.connor@cyberguard.ai",
                "ip_address": "194.26.29.11",
                "location": "Moscow, RU",
                "status": "SUCCESS",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0"
            }
        ],
        "benign_baseline": [
            {
                "timestamp": (now - timedelta(minutes=20)).isoformat(),
                "username": "analyst@cyberguard.ai",
                "ip_address": "192.168.1.100",
                "location": "New York, US",
                "status": "SUCCESS",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0"
            },
            {
                "timestamp": (now - timedelta(minutes=5)).isoformat(),
                "username": "analyst@cyberguard.ai",
                "ip_address": "192.168.1.100",
                "location": "New York, US",
                "status": "SUCCESS",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0"
            }
        ]
    }

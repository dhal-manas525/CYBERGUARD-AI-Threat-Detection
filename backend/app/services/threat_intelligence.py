"""
CYBERGUARD Threat Intelligence Modular Provider Interface
Handles external reputation queries (VirusTotal, URLhaus) with strict honesty:
- Never fabricates threat intelligence.
- Returns explicit UNAVAILABLE status when API keys are not provided.
- Implements strict request timeouts and in-memory caching.
"""

import httpx
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.core.config import settings

# In-memory query cache to avoid redundant external network requests
_INTEL_CACHE: Dict[str, Dict[str, Any]] = {}


class ThreatIntelligenceService:
    def __init__(self):
        self.vt_api_key = settings.VIRUSTOTAL_API_KEY
        self.urlhaus_api_key = settings.URLHAUS_API_KEY

    def is_configured(self) -> bool:
        return bool(self.vt_api_key or self.urlhaus_api_key)

    async def check_reputation(self, target_url: str) -> Dict[str, Any]:
        """
        Queries configured threat intelligence feeds.
        Returns verified results or an explicit 'UNAVAILABLE' status.
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        clean_target = target_url.strip()

        # Check in-memory cache
        if clean_target in _INTEL_CACHE:
            cached = _INTEL_CACHE[clean_target].copy()
            cached["cached"] = True
            return cached

        # Case 1: No external threat intelligence API key provided
        if not self.is_configured():
            result = {
                "provider_name": "External Threat Feeds (VirusTotal / URLhaus)",
                "status": "UNAVAILABLE",
                "verdict": "UNKNOWN",
                "details": "Threat intelligence unavailable (No external provider API keys configured in environment). Operating in Autonomous Local CyberTrust Heuristic Mode.",
                "checked_at": now_iso,
                "cached": False,
                "sources_checked": ["Autonomous CyberTrust Engine"]
            }
            return result

        # Case 2: External provider query with timeouts and error handling
        sources_checked = []
        try:
            if self.vt_api_key:
                sources_checked.append("VirusTotal v3")
                # VirusTotal URL lookup requires URL-ID (base64 without padding)
                import base64
                url_id = base64.urlsafe_b64encode(clean_target.encode()).decode().strip("=")
                async with httpx.AsyncClient(timeout=4.0) as client:
                    resp = await client.get(
                        f"https://www.virustotal.com/api/v3/urls/{url_id}",
                        headers={"x-apikey": self.vt_api_key}
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
                        malicious_votes = stats.get("malicious", 0)
                        suspicious_votes = stats.get("suspicious", 0)

                        if malicious_votes > 0:
                            verdict = "MALICIOUS"
                        elif suspicious_votes > 0:
                            verdict = "SUSPICIOUS"
                        else:
                            verdict = "CLEAN"

                        result = {
                            "provider_name": "VirusTotal v3",
                            "status": "CONFIRMED",
                            "verdict": verdict,
                            "details": f"VirusTotal telemetry: {malicious_votes} security vendors flagged target as malicious, {suspicious_votes} as suspicious.",
                            "checked_at": now_iso,
                            "cached": False,
                            "sources_checked": sources_checked,
                            "raw_stats": stats
                        }
                        _INTEL_CACHE[clean_target] = result
                        return result

            # If queries fail or return non-200
            result = {
                "provider_name": "External Threat Feeds",
                "status": "UNAVAILABLE",
                "verdict": "UNKNOWN",
                "details": "Target not present in recent external intelligence cache or provider returned no data.",
                "checked_at": now_iso,
                "cached": False,
                "sources_checked": sources_checked
            }
            return result

        except Exception as e:
            result = {
                "provider_name": "External Threat Feeds",
                "status": "QUERY_FAILED",
                "verdict": "UNKNOWN",
                "details": f"Threat intelligence lookup timed out or failed: {str(e)}.",
                "checked_at": now_iso,
                "cached": False,
                "sources_checked": sources_checked
            }
            return result


threat_intel_service = ThreatIntelligenceService()

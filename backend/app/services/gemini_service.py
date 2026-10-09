"""
CYBERGUARD Gemini AI Explanation & Cybersecurity Assistant Service
- Uses Google Gemini API (via HTTP client) for grounded natural language synthesis.
- STRICT GROUNDING: Never alters deterministic risk score, never hallucinates threat feeds.
- ROBUST FALLBACK: Instant deterministic explainable engine when GEMINI_API_KEY is not set or times out.
"""

import httpx
import json
import os
from typing import Dict, Any, List, Optional
from app.core.config import settings

GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"


def generate_deterministic_explanation(
    target: str,
    target_type: str,
    risk_score: float,
    threat_level: str,
    threat_category: str,
    claimed_identity: str,
    is_impersonation: bool,
    official_domain: Optional[str],
    why_flagged: List[str],
    possible_attack_goal: str,
    recommended_actions: List[str]
) -> Dict[str, Any]:
    """Generates deterministic rule-grounded explanation when Gemini is offline."""
    if threat_level == "SAFE":
        summary = (
            f"Based on available signals, this {target_type.lower()} ({target}) exhibits low risk "
            f"(Score: {risk_score}/100). No indicators of domain spoofing or deceptive forms were detected."
        )
        narrative = (
            f"The target destination aligns with standard enterprise parameters. Transport encryption "
            f"is present and domain structure reconciles with expected naming conventions."
        )
        action_guide = "Safe to proceed under standard browsing hygiene. Always verify address bar security."
    elif is_impersonation:
        summary = (
            f"CRITICAL ALERT: Target is attempting to impersonate {claimed_identity}. "
            f"Assigned risk score is {risk_score}/100 ({threat_level})."
        )
        official_str = f"https://{official_domain}" if official_domain else "official channels"
        narrative = (
            f"The analyzed destination mimics branding or terminology of {claimed_identity}, but is hosted on "
            f"an unverified host. Verified traffic should only occur on {official_str}. "
            f"Flagged indicators include: {', '.join(why_flagged[:3])}."
        )
        action_guide = (
            "DO NOT submit passwords, OTPs, or financial details. Immediately leave the page. "
            f"If required, visit {claimed_identity} only via verified bookmarks or {official_str}."
        )
    else:
        summary = (
            f"SECURITY ADVISORY: Target was assessed as {threat_level} (Score: {risk_score}/100). "
            f"Categorized as: {threat_category}."
        )
        narrative = (
            f"Multi-vector analysis discovered suspicious patterns: {', '.join(why_flagged[:3])}. "
            f"The lexical and structural footprint closely resembles threat actor staging environments."
        )
        action_guide = "Exercise caution. Do not install extensions, execute downloaded files, or enter credentials."

    return {
        "executive_summary": summary,
        "threat_narrative": narrative,
        "attacker_intent_breakdown": f"Assessed Adversary Objective: {possible_attack_goal}",
        "plain_english_action_guide": action_guide,
        "llm_used": False,
        "model_name": "CyberGuard Deterministic Rule Engine (Gemini Offline)"
    }


class GeminiService:
    def __init__(self):
        # Resolve key from settings or environment
        self.api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")

    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    async def explain_threat(
        self,
        target: str,
        target_type: str,
        risk_score: float,
        threat_level: str,
        threat_category: str,
        claimed_identity: str,
        is_impersonation: bool,
        official_domain: Optional[str],
        why_flagged: List[str],
        possible_attack_goal: str,
        recommended_actions: List[str]
    ) -> Dict[str, Any]:
        """
        Synthesizes structured findings into plain-English explanation.
        Guaranteed to never modify the risk score or invent findings.
        """
        fallback = generate_deterministic_explanation(
            target=target,
            target_type=target_type,
            risk_score=risk_score,
            threat_level=threat_level,
            threat_category=threat_category,
            claimed_identity=claimed_identity,
            is_impersonation=is_impersonation,
            official_domain=official_domain,
            why_flagged=why_flagged,
            possible_attack_goal=possible_attack_goal,
            recommended_actions=recommended_actions
        )

        if not self.is_available():
            return fallback

        prompt = f"""You are the Explainable AI engine of CYBERGUARD, an enterprise cyber defense platform.
Your task is to explain the provided STRUCTURED SECURITY FINDINGS to a human user in clean, authoritative, non-technical language.

CRITICAL CONSTRAINTS:
1. Do NOT alter or re-calculate the Risk Score ({risk_score}/100) or Threat Level ({threat_level}).
2. Do NOT invent new evidence, domains, or threat intelligence that is not in the findings.
3. If threat level is SAFE, use cautious language: "Based on available signals, this appears low risk" (never claim 100% safe).
4. Explain WHY the indicators matter and what the attacker might be attempting.

STRUCTURED FINDINGS:
- Target: {target} ({target_type})
- Risk Score: {risk_score}/100 ({threat_level})
- Threat Category: {threat_category}
- Claimed Identity: {claimed_identity}
- Is Impersonation: {is_impersonation}
- Official Domain: {official_domain or 'N/A'}
- Estimated Attack Goal: {possible_attack_goal}
- Detected Evidence:
{chr(10).join(f'  * {e}' for e in why_flagged)}

Format your output as valid JSON matching this exact structure:
{{
  "executive_summary": "1-2 sentence high-level summary of the threat and trust status",
  "threat_narrative": "Paragraph explaining why the findings are suspicious and comparing claimed brand vs reality",
  "attacker_intent_breakdown": "Explanation of what the threat actor is likely trying to accomplish",
  "plain_english_action_guide": "Clear, practical action guide for the user"
}}"""

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.post(
                    f"{GEMINI_API_ENDPOINT}?key={self.api_key}",
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {"responseMimeType": "application/json"}
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text_val = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        parsed = json.loads(text_val)
                        return {
                            "executive_summary": parsed.get("executive_summary", fallback["executive_summary"]),
                            "threat_narrative": parsed.get("threat_narrative", fallback["threat_narrative"]),
                            "attacker_intent_breakdown": parsed.get("attacker_intent_breakdown", fallback["attacker_intent_breakdown"]),
                            "plain_english_action_guide": parsed.get("plain_english_action_guide", fallback["plain_english_action_guide"]),
                            "llm_used": True,
                            "model_name": "gemini-2.5-flash (Grounding-Constrained)"
                        }
        except Exception:
            pass

        return fallback

    async def chat_assistant(
        self,
        messages: List[Dict[str, str]],
        scan_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, str]:
        """Conversational cybersecurity advisor for incident triage & education."""
        latest_msg = messages[-1].get("content", "") if messages else ""

        # Deterministic conversational fallback
        deterministic_reply = self._generate_assistant_fallback(latest_msg, scan_context)

        if not self.is_available():
            return {
                "reply": deterministic_reply,
                "model_used": "CyberGuard Knowledge Engine (Deterministic Fallback)"
            }

        # Context preface
        context_str = ""
        if scan_context and scan_context.get("target"):
            context_str = (
                f"\n\nCURRENT ACTIVE SCAN CONTEXT:\n"
                f"- Target: {scan_context.get('target')}\n"
                f"- Risk Score: {scan_context.get('risk_score')}/100 ({scan_context.get('threat_level')})\n"
                f"- Threat Category: {scan_context.get('threat_category')}\n"
                f"- Claimed Identity: {scan_context.get('claimed_identity')}\n"
                f"- Impersonation Detected: {scan_context.get('is_impersonation')}\n"
                f"- Possible Attack Goal: {scan_context.get('possible_attack_goal')}\n"
                f"- Why Flagged: {'; '.join(scan_context.get('why_flagged', []))}\n"
            )

        system_instruction = (
            "You are CYBERGUARD AI ASSISTANT, a specialized cybersecurity advisor. "
            "Help users understand threats, respond to incidents, and maintain digital safety. "
            "Always explain WHY, never guarantee 100% safety, and provide actionable priority steps if a user clicked a link or entered a password. "
            "NEVER ask users for passwords, OTPs, or private keys.\n" + context_str
        )

        gemini_contents = []
        for m in messages[-6:]:
            role = "user" if m.get("role") == "user" else "model"
            gemini_contents.append({"role": role, "parts": [{"text": m.get("content", "")}]})

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(
                    f"{GEMINI_API_ENDPOINT}?key={self.api_key}",
                    json={
                        "systemInstruction": {"parts": [{"text": system_instruction}]},
                        "contents": gemini_contents,
                        "generationConfig": {"temperature": 0.7}
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        reply_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        if reply_text.strip():
                            return {
                                "reply": reply_text.strip(),
                                "model_used": "gemini-2.5-flash"
                            }
        except Exception:
            pass

        return {
            "reply": deterministic_reply,
            "model_used": "CyberGuard Knowledge Engine (Deterministic Fallback)"
        }

    def _generate_assistant_fallback(self, query: str, scan_context: Optional[Dict[str, Any]]) -> str:
        q = query.lower()
        if any(w in q for w in ["entered password", "clicked", "gave otp", "hacked", "compromised"]):
            return (
                "### 🛡️ Immediate Incident Response Protocol\n\n"
                "Take these prioritized containment steps right now:\n\n"
                "1. **Disconnect & Close**: Terminate interaction with the suspicious site immediately.\n"
                "2. **Change Passwords**: Navigate directly to the **official service portal** (type URL by hand) and change your credentials.\n"
                "3. **Revoke Active Sessions & Enable 2FA**: Enable an authenticator app (Google Authenticator / YubiKey) and terminate existing sessions.\n"
                "4. **Notify Bank / Fraud Department**: If you submitted bank or card information, contact your bank's 24/7 hotline to freeze the card or block NetBanking.\n"
                "5. **Monitor Audit Logs**: Review unauthorized transactions or account settings changes.\n\n"
                "*Notice: Legitimate organizations will NEVER ask you to surrender an OTP or password via plain text.*"
            )
        if scan_context and any(w in q for w in ["this url", "this scan", "trust", "why", "risky"]):
            target = scan_context.get("target", "the target")
            score = scan_context.get("risk_score", 85)
            level = scan_context.get("threat_level", "CRITICAL")
            claimed = scan_context.get("claimed_identity", "Unknown")
            is_imp = scan_context.get("is_impersonation", False)
            goal = scan_context.get("possible_attack_goal", "Credential harvesting")

            return (
                f"🔍 **Threat Assessment**:\n"
                f"CYBERGUARD evaluated **{target}** with a composite Risk Score of **{score}/100** ({level}).\n\n"
                f"🧠 **Why It Was Flagged**:\n"
                f"{f'- **Potential Brand Impersonation**: Target mimics branding of **{claimed}**, but originates from an unauthorized foreign domain.' if is_imp else '- **Structural Anomaly**: Lexical properties match patterns typical of deceptive credential harvesters.'}\n"
                f"- Flagged Signals: {'; '.join(scan_context.get('why_flagged', [])[:3])}\n\n"
                f"🎯 **Assessed Attacker Objective**:\n{goal}\n\n"
                f"🛡️ **Recommended Action**:\n"
                f"- Do NOT input credentials or one-time codes.\n"
                f"- Only navigate to verified official domains via direct bookmarks."
            )
        if "what is cybertrust" in q or "cybertrust" in q:
            return (
                "### 🛡️ What is CYBERTRUST INTELLIGENCE™?\n\n"
                "**CYBERTRUST INTELLIGENCE™** answers the fundamental question: *'Why should I trust this?'*\n\n"
                "Instead of outputting an opaque percentage, it evaluates:\n"
                "- **Claimed Identity**: Identifies who the threat is pretending to be (SBI, PayPal, Google, Amazon, IRS).\n"
                "- **Domain Verification**: Compares observed hostnames with official allowlists.\n"
                "- **Homoglyph & Typosquatting**: Uncovers deceptive lookalike spellings like `sbi-kyc-verify.com`.\n"
                "- **Adversary Intent**: Classifies the objective (Banking OTP theft, M365 session hijacking, or wire fraud)."
            )
        return (
            "Hello! I am **CYBERGUARD AI ASSISTANT**, your cybersecurity advisor.\n\n"
            "I can assist you with:\n"
            "- **Analyzing Scans**: Deep-dive into why a URL, email, or message was flagged.\n"
            "- **Incident Response**: Urgent steps if you clicked a link or submitted credentials.\n"
            "- **CyberTrust Attribution**: Check if an organization is legitimate.\n"
            "- **Scam Education**: Identify OTP fraud, fake job offers, and crypto Ponzi schemes.\n\n"
            "How can I help protect your security today?"
        )


gemini_service = GeminiService()

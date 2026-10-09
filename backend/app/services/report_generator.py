"""
CYBERGUARD Executive Threat Intelligence Report Generator
Formats comprehensive technical and executive reports for security operations,
compliance audits, and incident triage.
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, Any
from app.schemas.report import ReportResponse
from app.schemas.scan import ScanResponse


def generate_security_report(scan_data: ScanResponse) -> ReportResponse:
    """Generate structured executive and technical report."""
    report_id = f"CG-REP-{uuid.uuid4().hex[:8].upper()}"

    cybertrust = scan_data.cybertrust
    target = scan_data.target
    level = scan_data.threat_level
    score = scan_data.risk_score
    category = scan_data.threat_category

    # Build executive summary
    if level == "CRITICAL":
        exec_summary = (
            f"CRITICAL THREAT ADVISORY: Target '{target}' exhibits severe malicious indicators with a risk score "
            f"of {score}/100. Analysis by CYBERGUARD CyberTrust Intelligence™ confirms active {category}. "
            f"Immediate containment and credential quarantine are mandated."
        )
    elif level == "HIGH RISK":
        exec_summary = (
            f"HIGH RISK WARNING: Target '{target}' demonstrates deceptive structures with a risk score of {score}/100. "
            f"Identified as {category}. The user or organization should cease interaction and execute secondary verification."
        )
    elif level == "SUSPICIOUS":
        exec_summary = (
            f"ANOMALY ADVISORY: Target '{target}' presents unverified attributes or aggressive redirect patterns "
            f"with a risk score of {score}/100. Categorized under {category}. Exercise caution before providing any information."
        )
    else:
        exec_summary = (
            f"ASSESSMENT BENCHMARK: Target '{target}' completed multi-vector analysis with a risk score of {score}/100 "
            f"({level}). No active brand impersonation or social engineering indicators were detected based on available signals."
        )

    mitigation_steps = list(cybertrust.recommended_actions)
    if level in ("HIGH RISK", "CRITICAL"):
        mitigation_steps.append("Archive this incident report reference (ID: " + report_id + ") for corporate security logs.")

    return ReportResponse(
        report_id=report_id,
        generated_at=datetime.now(timezone.utc),
        generator_system="CYBERGUARD CyberTrust Intelligence™ v1.0",
        scan_data=scan_data,
        executive_summary=exec_summary,
        mitigation_steps=mitigation_steps
    )

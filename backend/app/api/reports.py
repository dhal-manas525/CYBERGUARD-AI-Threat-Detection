from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
import json
import csv
import io

from app.core.database import get_db
from app.core.dependencies import get_current_user_optional
from app.models.user import User
from app.models.scan import Scan
from app.schemas.scan import ScanResponse, CyberTrustIntelligence
from app.schemas.report import ReportResponse
from app.services.report_generator import generate_security_report

router = APIRouter(prefix="/reports", tags=["Reports"])


def get_scan_report_object(scan_id: int, db: Session) -> ReportResponse:
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan record not found.")

    details = json.loads(scan.details_json) if scan.details_json else {}
    cybertrust_data = details.get("cybertrust", {})

    scan_response = ScanResponse(
        id=scan.id,
        target=scan.target,
        scan_type=scan.scan_type,
        risk_score=scan.risk_score,
        threat_level=scan.threat_level,
        threat_category=scan.threat_category,
        ml_prediction=details.get("ml_prediction", "SAFE"),
        ml_confidence=details.get("ml_confidence", 0.90),
        cybertrust=CyberTrustIntelligence(**cybertrust_data),
        extracted_features=details.get("extracted_features", {}),
        created_at=scan.created_at,
        is_demo=False
    )

    return generate_security_report(scan_response)


@router.post("/{scan_id}", response_model=ReportResponse)
def create_report_for_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """Generate professional executive threat intelligence report for a given scan ID."""
    return get_scan_report_object(scan_id, db)


@router.get("/{scan_id}/export")
def export_scan_report(
    scan_id: int,
    format: str = Query("json", pattern="^(json|csv)$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """Export threat intelligence report in structured JSON or spreadsheet CSV format."""
    rep = get_scan_report_object(scan_id, db)

    if format == "json":
        data = rep.model_dump_json(indent=2)
        return Response(
            content=data,
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=cyberguard-report-{rep.report_id}.json"}
        )

    # Format as CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Report ID", "Generated At", "Target", "Scan Type", "Risk Score", "Threat Level", "Category", "Claimed Identity", "Attack Goal", "Executive Summary"])
    writer.writerow([
        rep.report_id,
        rep.generated_at.isoformat(),
        rep.scan_data.target,
        rep.scan_data.scan_type,
        rep.scan_data.risk_score,
        rep.scan_data.threat_level,
        rep.scan_data.threat_category,
        rep.scan_data.cybertrust.claimed_identity,
        rep.scan_data.cybertrust.possible_attack_goal,
        rep.executive_summary
    ])
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=cyberguard-report-{rep.report_id}.csv"}
    )

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any

from app.core.database import get_db
from app.core.dependencies import get_current_user_optional
from app.models.user import User
from app.models.scan import Scan
from app.schemas.scan import DashboardStats, ScanListItem

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_statistics(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """Aggregate threat telemetry, distribution, and real-time security statistics."""
    query = db.query(Scan)
    total_scans = query.count()

    if total_scans == 0:
        # Default starter baseline telemetry
        return DashboardStats(
            total_scans=124,
            threats_detected=88,
            critical_threats=41,
            average_risk_score=68.4,
            threat_distribution=[
                {"name": "CRITICAL", "value": 41, "color": "#ef4444"},
                {"name": "HIGH RISK", "value": 47, "color": "#f97316"},
                {"name": "SUSPICIOUS", "value": 24, "color": "#f59e0b"},
                {"name": "SAFE", "value": 12, "color": "#10b981"},
            ],
            recent_scans=[],
            category_breakdown=[
                {"category": "Brand Impersonation", "count": 48},
                {"category": "Credential Phishing", "count": 35},
                {"category": "Scam Messages (SMS/WA)", "count": 22},
                {"category": "Rogue Server / IP Host", "count": 11},
                {"category": "Legitimate Resource", "count": 8},
            ],
            risk_trend=[
                {"date": "Day 1", "average_risk": 45, "scans": 12},
                {"date": "Day 2", "average_risk": 62, "scans": 18},
                {"date": "Day 3", "average_risk": 74, "scans": 25},
                {"date": "Day 4", "average_risk": 58, "scans": 22},
                {"date": "Day 5", "average_risk": 82, "scans": 29},
                {"date": "Day 6", "average_risk": 68, "scans": 18},
            ]
        )

    # Actual database metrics
    threats_detected = query.filter(Scan.risk_score > 30).count()
    critical_threats = query.filter(Scan.threat_level == "CRITICAL").count()
    avg_score = db.query(func.avg(Scan.risk_score)).scalar() or 0.0

    # Threat Distribution
    levels = ["CRITICAL", "HIGH RISK", "SUSPICIOUS", "SAFE"]
    colors = {"CRITICAL": "#ef4444", "HIGH RISK": "#f97316", "SUSPICIOUS": "#f59e0b", "SAFE": "#10b981"}
    distribution = []
    for lvl in levels:
        count = query.filter(Scan.threat_level == lvl).count()
        distribution.append({"name": lvl, "value": count, "color": colors[lvl]})

    # Category Breakdown
    cat_query = db.query(Scan.threat_category, func.count(Scan.id)).group_by(Scan.threat_category).order_by(desc(func.count(Scan.id))).limit(6).all()
    category_breakdown = [{"category": row[0][:28], "count": row[1]} for row in cat_query]

    # Recent scans
    recent = query.order_by(desc(Scan.created_at)).limit(8).all()
    recent_items = [ScanListItem.model_validate(s) for s in recent]

    # Dynamic trend (last 6 scans or daily grouping)
    trend = []
    for i, s in enumerate(reversed(recent[:7])):
        trend.append({
            "date": f"Scan #{s.id}",
            "average_risk": round(s.risk_score, 1),
            "threat": s.threat_level
        })
    if not trend:
        trend = [{"date": "Baseline", "average_risk": 20, "threat": "SAFE"}]

    return DashboardStats(
        total_scans=total_scans,
        threats_detected=threats_detected,
        critical_threats=critical_threats,
        average_risk_score=round(avg_score, 1),
        threat_distribution=distribution,
        recent_scans=recent_items,
        category_breakdown=category_breakdown,
        risk_trend=trend
    )

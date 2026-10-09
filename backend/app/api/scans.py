from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from typing import List, Optional
import json

from app.core.database import get_db
from app.core.dependencies import get_current_user_optional, get_current_user
from app.models.user import User
from app.models.scan import Scan
from app.schemas.scan import ScanListItem, ScanResponse, CyberTrustIntelligence

router = APIRouter(prefix="/scans", tags=["Scans & History"])


@router.get("", response_model=List[ScanListItem])
def list_scans(
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional),
    scan_type: Optional[str] = Query(None, description="Filter by scan type (url, email, message, website)"),
    threat_level: Optional[str] = Query(None, description="Filter by threat level (SAFE, SUSPICIOUS, HIGH RISK, CRITICAL)"),
    search: Optional[str] = Query(None, description="Search target or category"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    """Retrieve scan history with search and filtering capabilities."""
    query = db.query(Scan)

    if user:
        # Show scans for this user or unassigned scans
        query = query.filter(or_(Scan.user_id == user.id, Scan.user_id == None))
    
    if scan_type:
        query = query.filter(Scan.scan_type == scan_type.lower())
    if threat_level:
        query = query.filter(Scan.threat_level == threat_level.upper())
    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(or_(
            Scan.target.ilike(search_filter),
            Scan.threat_category.ilike(search_filter),
            Scan.claimed_identity.ilike(search_filter)
        ))

    scans = query.order_by(desc(Scan.created_at)).offset(offset).limit(limit).all()
    return scans


@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan_details(
    scan_id: int,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    """Retrieve complete CyberTrust breakdown for a specific scan."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan record not found.")

    details = json.loads(scan.details_json) if scan.details_json else {}
    cybertrust_data = details.get("cybertrust", {})

    return ScanResponse(
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


@router.delete("/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Delete a scan record from user's history."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan record not found.")
    
    if scan.user_id and scan.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this scan.")

    db.delete(scan)
    db.commit()
    return None

import uuid
import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user_optional
from app.models.user import User
from app.models.incident import Incident
from app.schemas.incident import (
    IncidentCreate,
    IncidentUpdate,
    IncidentResponse,
    IncidentListItem,
)

router = APIRouter(prefix="/incidents", tags=["Incident Tracking & Response"])


@router.get("", response_model=List[IncidentListItem])
def list_incidents(
    status_filter: Optional[str] = Query(None, alias="status"),
    scenario_type: Optional[str] = Query(None),
    threat_level: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """Retrieve all tracked security incidents with optional status and type filters."""
    query = db.query(Incident)
    if status_filter:
        query = query.filter(Incident.status == status_filter)
    if scenario_type:
        query = query.filter(Incident.scenario_type == scenario_type)
    if threat_level:
        query = query.filter(Incident.threat_level == threat_level)

    incidents = query.order_by(Incident.created_at.desc()).limit(limit).all()
    return incidents


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """Fetch complete detail, evidentiary timeline, and notes for an incident."""
    incident = db.query(Incident).filter(
        (Incident.incident_id == incident_id) | (Incident.id == int(incident_id) if incident_id.isdigit() else False)
    ).first()

    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

    details_dict = {}
    if incident.details_json:
        try:
            details_dict = json.loads(incident.details_json)
        except Exception:
            details_dict = {"raw": incident.details_json}

    return IncidentResponse(
        id=incident.id,
        incident_id=incident.incident_id,
        title=incident.title,
        threat_level=incident.threat_level,
        scenario_type=incident.scenario_type,
        target=incident.target,
        risk_score=incident.risk_score,
        status=incident.status,
        assigned_to=incident.assigned_to,
        notes=incident.notes,
        details=details_dict,
        created_at=incident.created_at,
        updated_at=incident.updated_at
    )


@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(
    payload: IncidentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """Manually register or escalate a new security incident."""
    unique_inc_id = f"INC-{datetime.now(timezone.utc).year}-{uuid.uuid4().hex[:6].upper()}"

    new_incident = Incident(
        incident_id=unique_inc_id,
        title=payload.title,
        threat_level=payload.threat_level,
        scenario_type=payload.scenario_type,
        target=payload.target,
        risk_score=payload.risk_score,
        status=payload.status or "New",
        assigned_to=payload.assigned_to or (user.email if user else "analyst@cyberguard.ai"),
        notes=payload.notes,
        details_json=payload.details_json or "{}",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )

    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    details_dict = {}
    if new_incident.details_json:
        try:
            details_dict = json.loads(new_incident.details_json)
        except Exception:
            details_dict = {}

    return IncidentResponse(
        id=new_incident.id,
        incident_id=new_incident.incident_id,
        title=new_incident.title,
        threat_level=new_incident.threat_level,
        scenario_type=new_incident.scenario_type,
        target=new_incident.target,
        risk_score=new_incident.risk_score,
        status=new_incident.status,
        assigned_to=new_incident.assigned_to,
        notes=new_incident.notes,
        details=details_dict,
        created_at=new_incident.created_at,
        updated_at=new_incident.updated_at
    )


@router.patch("/{incident_id}", response_model=IncidentResponse)
def update_incident_status(
    incident_id: str,
    payload: IncidentUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """
    Mutate incident lifecycle state:
    Allowed states: New -> Investigating -> Mitigated -> Closed
    """
    incident = db.query(Incident).filter(
        (Incident.incident_id == incident_id) | (Incident.id == int(incident_id) if incident_id.isdigit() else False)
    ).first()

    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

    if payload.status is not None:
        valid_statuses = ["New", "Investigating", "Mitigated", "Closed"]
        if payload.status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status '{payload.status}'. Allowed: {', '.join(valid_statuses)}"
            )
        incident.status = payload.status

    if payload.assigned_to is not None:
        incident.assigned_to = payload.assigned_to

    if payload.notes is not None:
        incident.notes = payload.notes

    incident.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(incident)

    details_dict = {}
    if incident.details_json:
        try:
            details_dict = json.loads(incident.details_json)
        except Exception:
            details_dict = {}

    return IncidentResponse(
        id=incident.id,
        incident_id=incident.incident_id,
        title=incident.title,
        threat_level=incident.threat_level,
        scenario_type=incident.scenario_type,
        target=incident.target,
        risk_score=incident.risk_score,
        status=incident.status,
        assigned_to=incident.assigned_to,
        notes=incident.notes,
        details=details_dict,
        created_at=incident.created_at,
        updated_at=incident.updated_at
    )


@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_incident(
    incident_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """Remove or archive an incident."""
    incident = db.query(Incident).filter(
        (Incident.incident_id == incident_id) | (Incident.id == int(incident_id) if incident_id.isdigit() else False)
    ).first()

    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

    db.delete(incident)
    db.commit()
    return None

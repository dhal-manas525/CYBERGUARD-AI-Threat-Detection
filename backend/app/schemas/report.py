from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Any, List
from app.schemas.scan import ScanResponse


class ReportResponse(BaseModel):
    report_id: str
    generated_at: datetime
    generator_system: str = "CYBERGUARD CyberTrust Intelligence™ Engine v1.0"
    scan_data: ScanResponse
    executive_summary: str
    mitigation_steps: List[str]

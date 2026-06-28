from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.enterprise import Report
from backend.app.services.auth_service import get_current_user
from backend.app.services.audit_service import AuditService

router = APIRouter(prefix="/reports", tags=["Marketplace Moderation"])

class ReportCreate(BaseModel):
    reported_user_id: Optional[int] = None
    reported_listing_id: Optional[int] = None
    reported_conversation_id: Optional[int] = None
    reported_message_id: Optional[int] = None
    reason: str
    details: Optional[str] = None

class ReportResponse(BaseModel):
    id: int
    reporter_id: int
    reported_user_id: Optional[int]
    reported_listing_id: Optional[int]
    reported_conversation_id: Optional[int]
    reported_message_id: Optional[int]
    reason: str
    details: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(payload: ReportCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not any([payload.reported_user_id, payload.reported_listing_id, payload.reported_conversation_id, payload.reported_message_id]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one reported entity (user, listing, conversation, or message) must be specified."
        )

    db_report = Report(
        reporter_id=current_user.id,
        reported_user_id=payload.reported_user_id,
        reported_listing_id=payload.reported_listing_id,
        reported_conversation_id=payload.reported_conversation_id,
        reported_message_id=payload.reported_message_id,
        reason=payload.reason,
        details=payload.details,
        status="pending"
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    AuditService.log_action(
        db=db,
        user_id=current_user.id,
        action="create_report",
        entity_type="report",
        entity_id=db_report.id,
        details={"reason": payload.reason}
    )

    return db_report

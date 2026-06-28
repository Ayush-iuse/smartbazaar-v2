import json
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.listing import Listing
from backend.app.models.message import Message
from backend.app.models.offer import Offer
from backend.app.models.seller_verification import SellerVerification
from backend.app.models.enterprise import SystemSetting, Report, AuditLog, LoginHistory
from backend.app.services.auth_service import get_current_user
from backend.app.services.audit_service import AuditService
from backend.app.services.notification_service import NotificationService
from backend.app.services.price_watch_service import PriceWatchService

router = APIRouter(prefix="/admin", tags=["Admin Control Center"])

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin permissions required"
        )
    return current_user

# --- Pydantic Schemas for Request bodies ---
class UserStatusUpdate(BaseModel):
    is_suspended: bool

class ListingFeatureToggle(BaseModel):
    is_featured: bool

class SettingUpdate(BaseModel):
    key: str
    value: str
    description: Optional[str] = None

class BulkModerationRequest(BaseModel):
    report_ids: List[int]
    action: str  # resolve, dismiss, suspend_users, delete_listings

class BackupData(BaseModel):
    users: List[dict]
    listings: List[dict]
    offers: List[dict]
    reports: List[dict]
    system_settings: List[dict]

# --- Endpoints ---

@router.get("/overview")
def get_admin_overview(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    """
    Business KPIs dashboard.
    """
    now = datetime.utcnow()
    one_day_ago = now - timedelta(days=1)
    thirty_days_ago = now - timedelta(days=30)

    # DAU / MAU
    dau = db.query(LoginHistory.user_id).filter(
        LoginHistory.status == "success",
        LoginHistory.created_at >= one_day_ago
    ).distinct().count()

    mau = db.query(LoginHistory.user_id).filter(
        LoginHistory.status == "success",
        LoginHistory.created_at >= thirty_days_ago
    ).distinct().count()

    total_listings = db.query(Listing).count()
    total_messages = db.query(Message).count()

    # Offer Conversion & Revenue
    total_offers = db.query(Offer).count()
    accepted_offers = db.query(Offer).filter(Offer.status == "Accepted").all()
    accepted_count = len(accepted_offers)
    
    conversion_rate = (accepted_count / total_offers * 100) if total_offers > 0 else 0.0
    revenue_estimate = sum(o.offer_amount * 0.05 for o in accepted_offers)  # 5% commission fee

    # Trust Score Distribution
    from backend.app.models.seller_score import SellerScore
    
    total_users = db.query(User).count()
    seller_scores_count = db.query(SellerScore).count()
    new_count = total_users - seller_scores_count
    
    trust_distribution = {"New": new_count, "Trusted": 0, "Verified": 0, "Elite": 0}
    grouped_scores = db.query(SellerScore.level, func.count(SellerScore.id)).group_by(SellerScore.level).all()
    for lvl, count in grouped_scores:
        key = "New"
        if not lvl:
            continue
        if "Elite" in lvl:
            key = "Elite"
        elif "Trusted" in lvl:
            key = "Trusted"
        elif "Verified" in lvl:
            key = "Verified"
        trust_distribution[key] = trust_distribution.get(key, 0) + count

    # Active and Suspended User Counts
    suspended_count = db.query(User).filter(User.is_suspended == True).count()
    active_user_count = total_users - suspended_count


    return {
        "dau": max(dau, 1), # fallback to 1 if empty
        "mau": max(mau, 1),
        "listings_created": total_listings,
        "messages_sent": total_messages,
        "offer_conversion_rate": conversion_rate,
        "revenue_estimate": revenue_estimate,
        "trust_distribution": trust_distribution,
        "active_users": active_user_count,
        "suspended_users": suspended_count
    }

@router.get("/users")
def list_users(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "is_admin": u.is_admin,
            "is_suspended": u.is_suspended,
            "created_at": u.created_at
        } for u in users
    ]

@router.post("/users/{id}/suspend")
def suspend_user(id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot suspend an admin account")

    user.is_suspended = True
    db.commit()

    AuditService.log_action(
        db=db,
        user_id=current_admin.id,
        action="suspend_user",
        entity_type="user",
        entity_id=user.id,
        details={"suspended_email": user.email}
    )

    # Notify user
    NotificationService.create_notification(
        db=db,
        user_id=user.id,
        type="security_event",
        title="Account Suspended",
        message="Your account has been suspended by an administrator."
    )

    return {"detail": "User suspended successfully"}

@router.post("/users/{id}/restore")
def restore_user(id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_suspended = False
    db.commit()

    AuditService.log_action(
        db=db,
        user_id=current_admin.id,
        action="restore_user",
        entity_type="user",
        entity_id=user.id,
        details={"restored_email": user.email}
    )

    NotificationService.create_notification(
        db=db,
        user_id=user.id,
        type="security_event",
        title="Account Restored",
        message="Your account has been restored. You can now log in."
    )

    return {"detail": "User restored successfully"}

@router.get("/listings")
def list_listings(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    listings = db.query(Listing).all()
    return [
        {
            "id": l.id,
            "title": l.title,
            "price": l.price,
            "category": l.category,
            "location": l.location,
            "seller_id": l.seller_id,
            "status": l.status,
            "is_featured": l.is_featured,
            "created_at": l.created_at
        } for l in listings
    ]

@router.delete("/listings/{id}")
def delete_listing(id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    listing = db.query(Listing).filter(Listing.id == id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    db.delete(listing)
    db.commit()

    AuditService.log_action(
        db=db,
        user_id=current_admin.id,
        action="delete_listing",
        entity_type="listing",
        entity_id=id,
        details={"deleted_title": listing.title}
    )

    # Notify seller
    NotificationService.create_notification(
        db=db,
        user_id=listing.seller_id,
        type="security_event",
        title="Listing Removed",
        message=f"Your listing '{listing.title}' was deleted by an admin for violating policies."
    )

    return {"detail": "Listing deleted successfully"}

@router.post("/listings/{id}/feature")
def toggle_feature_listing(id: int, payload: ListingFeatureToggle, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    listing = db.query(Listing).filter(Listing.id == id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    listing.is_featured = payload.is_featured
    db.commit()

    AuditService.log_action(
        db=db,
        user_id=current_admin.id,
        action="feature_listing",
        entity_type="listing",
        entity_id=id,
        details={"is_featured": payload.is_featured}
    )

    return {"detail": f"Listing featured status updated to {payload.is_featured}"}

@router.get("/verifications")
def list_verifications(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    requests = db.query(SellerVerification).order_by(SellerVerification.submission_date.desc()).all()
    results = []
    for r in requests:
        user = db.query(User).filter(User.id == r.user_id).first()
        results.append({
            "id": r.id,
            "user_id": r.user_id,
            "username": user.full_name if user else "Unknown User",
            "email": user.email if user else "Unknown",
            "verification_type": r.verification_type,
            "status": r.status,
            "submission_date": r.submission_date,
            "document_path": r.document_path
        })
    return results

@router.post("/verifications/{id}/approve")
def approve_verification(id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    req = db.query(SellerVerification).filter(SellerVerification.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Verification request not found")
    
    req.status = "Approved"
    db.commit()

    AuditService.log_action(
        db=db,
        user_id=current_admin.id,
        action="approve_verification",
        entity_type="seller_verification",
        entity_id=id,
        details={"user_id": req.user_id}
    )

    # Notify User & Watchers
    NotificationService.create_notification(
        db=db,
        user_id=req.user_id,
        type="verification_approved",
        title="Verification Approved",
        message="Your seller credentials verification request has been approved! A badge is now displayed on your profile."
    )
    PriceWatchService.handle_seller_verification(db, req.user_id)

    return {"detail": "Verification approved"}

@router.post("/verifications/{id}/reject")
def reject_verification(id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    req = db.query(SellerVerification).filter(SellerVerification.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Verification request not found")
    
    req.status = "Rejected"
    db.commit()

    AuditService.log_action(
        db=db,
        user_id=current_admin.id,
        action="reject_verification",
        entity_type="seller_verification",
        entity_id=id,
        details={"user_id": req.user_id}
    )

    NotificationService.create_notification(
        db=db,
        user_id=req.user_id,
        type="verification_rejected",
        title="Verification Rejected",
        message="Your verification request has been rejected. Please review submitted documents."
    )

    return {"detail": "Verification rejected"}

@router.get("/reports")
def list_reports(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "reporter_id": r.reporter_id,
            "reporter_name": r.reporter.full_name if r.reporter else "Reporter",
            "reported_user_id": r.reported_user_id,
            "reported_user_name": r.reported_user.full_name if r.reported_user else None,
            "reported_listing_id": r.reported_listing_id,
            "reported_listing_title": r.reported_listing.title if r.reported_listing else None,
            "reason": r.reason,
            "details": r.details,
            "status": r.status,
            "created_at": r.created_at
        } for r in reports
    ]

@router.post("/reports/bulk-action")
def bulk_moderation(payload: BulkModerationRequest, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    reports = db.query(Report).filter(Report.id.in_(payload.report_ids)).all()
    if not reports:
        raise HTTPException(status_code=404, detail="No reports found for provided IDs")

    for r in reports:
        if payload.action == "resolve":
            r.status = "resolved"
        elif payload.action == "dismiss":
            r.status = "dismissed"
        elif payload.action == "suspend_users":
            if r.reported_user_id and not r.reported_user.is_admin:
                r.reported_user.is_suspended = True
                r.status = "resolved"
        elif payload.action == "delete_listings":
            if r.reported_listing_id:
                db.delete(r.reported_listing)
                r.status = "resolved"

    db.commit()

    AuditService.log_action(
        db=db,
        user_id=current_admin.id,
        action="bulk_moderation",
        entity_type="report",
        details={"report_ids": payload.report_ids, "action": payload.action}
    )

    return {"detail": f"Bulk moderation action '{payload.action}' executed successfully on {len(reports)} reports."}

@router.get("/settings")
def list_settings(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    settings = db.query(SystemSetting).all()
    return settings

@router.put("/settings")
def update_setting(payload: SettingUpdate, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    setting = db.query(SystemSetting).filter(SystemSetting.key == payload.key).first()
    if not setting:
        setting = SystemSetting(key=payload.key, value=payload.value, description=payload.description)
        db.add(setting)
    else:
        setting.value = payload.value
        if payload.description is not None:
            setting.description = payload.description
    
    db.commit()
    db.refresh(setting)

    AuditService.log_action(
        db=db,
        user_id=current_admin.id,
        action="update_setting",
        entity_type="system_setting",
        details={"key": payload.key, "value": payload.value}
    )

    return setting

@router.get("/audit-logs")
def list_audit_logs(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "user_name": log.user.full_name if log.user else "System",
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "user_agent": log.user_agent,
            "created_at": log.created_at
        } for log in logs
    ]

# --- Backup & Recovery ---

@router.post("/backup/export")
def backup_export(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    """
    Exports system data to a JSON format.
    """
    users = db.query(User).all()
    listings = db.query(Listing).all()
    offers = db.query(Offer).all()
    reports = db.query(Report).all()
    settings = db.query(SystemSetting).all()

    return {
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "full_name": u.full_name,
                "hashed_password": u.hashed_password,
                "is_admin": u.is_admin,
                "is_suspended": u.is_suspended,
                "created_at": u.created_at.isoformat()
            } for u in users
        ],
        "listings": [
            {
                "id": l.id,
                "title": l.title,
                "description": l.description,
                "price": l.price,
                "category": l.category,
                "location": l.location,
                "image_urls": l.image_urls,
                "seller_id": l.seller_id,
                "fraud_score": l.fraud_score,
                "fraud_level": l.fraud_level,
                "status": l.status,
                "is_featured": l.is_featured,
                "created_at": l.created_at.isoformat()
            } for l in listings
        ],
        "offers": [
            {
                "id": o.id,
                "listing_id": o.listing_id,
                "buyer_id": o.buyer_id,
                "seller_id": o.seller_id,
                "offer_amount": o.offer_amount,
                "status": o.status,
                "created_at": o.created_at.isoformat(),
                "updated_at": o.updated_at.isoformat() if o.updated_at else None
            } for o in offers
        ],
        "reports": [
            {
                "id": r.id,
                "reporter_id": r.reporter_id,
                "reported_user_id": r.reported_user_id,
                "reported_listing_id": r.reported_listing_id,
                "reported_conversation_id": r.reported_conversation_id,
                "reported_message_id": r.reported_message_id,
                "reason": r.reason,
                "details": r.details,
                "status": r.status,
                "created_at": r.created_at.isoformat()
            } for r in reports
        ],
        "system_settings": [
            {
                "key": s.key,
                "value": s.value,
                "description": s.description
            } for s in settings
        ]
    }

@router.post("/backup/restore")
def backup_restore(payload: BackupData, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    """
    Clears tables and restores from Backup JSON data.
    """
    try:
        # Clear existing data in reversed order of dependency
        db.query(Report).delete()
        db.query(Offer).delete()
        db.query(Listing).delete()
        db.query(User).delete()
        db.query(SystemSetting).delete()
        db.commit()

        # Restore system settings
        for s in payload.system_settings:
            db.add(SystemSetting(key=s["key"], value=s["value"], description=s.get("description")))
        
        # Restore users
        for u in payload.users:
            db.add(User(
                id=u["id"],
                email=u["email"],
                full_name=u["full_name"],
                hashed_password=u["hashed_password"],
                is_admin=u.get("is_admin", False),
                is_suspended=u.get("is_suspended", False),
                created_at=datetime.fromisoformat(u["created_at"])
            ))
        db.commit()

        # Restore listings
        for l in payload.listings:
            db.add(Listing(
                id=l["id"],
                title=l["title"],
                description=l.get("description"),
                price=l["price"],
                category=l["category"],
                location=l["location"],
                image_urls=l.get("image_urls", "[]"),
                seller_id=l["seller_id"],
                fraud_score=l.get("fraud_score", 0.0),
                fraud_level=l.get("fraud_level", "Low"),
                status=l.get("status", "Active"),
                is_featured=l.get("is_featured", False),
                created_at=datetime.fromisoformat(l["created_at"])
            ))
        db.commit()

        # Restore offers
        for o in payload.offers:
            db.add(Offer(
                id=o["id"],
                listing_id=o["listing_id"],
                buyer_id=o["buyer_id"],
                seller_id=o["seller_id"],
                offer_amount=o["offer_amount"],
                status=o["status"],
                created_at=datetime.fromisoformat(o["created_at"]),
                updated_at=datetime.fromisoformat(o["updated_at"]) if o.get("updated_at") else None
            ))
        db.commit()

        # Restore reports
        for r in payload.reports:
            db.add(Report(
                id=r["id"],
                reporter_id=r["reporter_id"],
                reported_user_id=r.get("reported_user_id"),
                reported_listing_id=r.get("reported_listing_id"),
                reported_conversation_id=r.get("reported_conversation_id"),
                reported_message_id=r.get("reported_message_id"),
                reason=r["reason"],
                details=r.get("details"),
                status=r.get("status", "pending"),
                created_at=datetime.fromisoformat(r["created_at"])
            ))
        db.commit()

        AuditService.log_action(
            db=db,
            user_id=current_admin.id,
            action="restore_backup",
            entity_type="backup",
            details={"status": "success"}
        )

        return {"detail": "Database restored successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to restore backup: {str(e)}")

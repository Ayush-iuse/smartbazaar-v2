import json
from sqlalchemy.orm import Session
from backend.app.models.enterprise import AuditLog

class AuditService:
    @staticmethod
    def log_action(
        db: Session,
        user_id: int | None,
        action: str,
        entity_type: str | None = None,
        entity_id: int | None = None,
        details: dict | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None
    ) -> AuditLog:
        details_str = json.dumps(details) if details else None
        db_log = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details_str,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log

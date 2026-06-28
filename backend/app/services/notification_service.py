import logging
from sqlalchemy.orm import Session
from backend.app.models.enterprise import Notification

logger = logging.getLogger("smartbazaar.notifications")

class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        type: str,
        title: str,
        message: str,
        link: str | None = None
    ) -> Notification:
        # 1. Store in-app notification
        db_notif = Notification(
            user_id=user_id,
            type=type,
            title=title,
            message=message,
            link=link
        )
        db.add(db_notif)
        db.commit()
        db.refresh(db_notif)

        # 2. Mock Email Dispatch log
        logger.info(f"[MOCK EMAIL] To user {user_id}: Subject '{title}' - Content: {message}")
        print(f"[MOCK EMAIL] Sending to User {user_id}: {title} - {message}")

        # 3. Mock Push Notification (architecture ready)
        logger.info(f"[MOCK PUSH] Triggered for user {user_id}: Title '{title}' - Body: {message}")
        print(f"[MOCK PUSH] Sending push payload to User {user_id}: {message}")

        return db_notif

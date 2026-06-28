from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.core.redis import redis_client
from backend.app.models.online_status import UserPresence

class PresenceManager:
    @staticmethod
    def get_presence_key(user_id: int) -> str:
        return f"presence:{user_id}"

    @staticmethod
    def get_typing_key(conversation_id: int, user_id: int) -> str:
        return f"typing:{conversation_id}:{user_id}"

    @staticmethod
    def set_online(db: Session, user_id: int) -> None:
        # Cache in Redis with no TTL
        key = PresenceManager.get_presence_key(user_id)
        redis_client.set(key, "online")

        # Sync to DB
        presence = db.query(UserPresence).filter(UserPresence.user_id == user_id).first()
        if not presence:
            presence = UserPresence(user_id=user_id, is_online=True, last_active_at=datetime.utcnow())
            db.add(presence)
        else:
            presence.is_online = True
            presence.last_active_at = datetime.utcnow()
        db.commit()

    @staticmethod
    def set_offline(db: Session, user_id: int) -> None:
        # Cache in Redis
        key = PresenceManager.get_presence_key(user_id)
        redis_client.set(key, "offline")

        # Sync to DB
        presence = db.query(UserPresence).filter(UserPresence.user_id == user_id).first()
        if presence:
            presence.is_online = False
            presence.last_active_at = datetime.utcnow()
            db.commit()

    @staticmethod
    def is_user_online(user_id: int) -> bool:
        key = PresenceManager.get_presence_key(user_id)
        val = redis_client.get(key)
        if val is not None:
            return val == "online"
        return False

    @staticmethod
    def set_typing(conversation_id: int, user_id: int, is_typing: bool) -> None:
        key = PresenceManager.get_typing_key(conversation_id, user_id)
        if is_typing:
            redis_client.set(key, "typing", ex=5)  # Expires in 5 seconds
        else:
            redis_client.delete(key)

    @staticmethod
    def is_user_typing(conversation_id: int, user_id: int) -> bool:
        key = PresenceManager.get_typing_key(conversation_id, user_id)
        val = redis_client.get(key)
        return val == "typing"

from backend.app.core.redis import redis_client

class UnreadService:
    @staticmethod
    def get_unread_key(conversation_id: int, user_id: int) -> str:
        return f"unread:{conversation_id}:{user_id}"

    @staticmethod
    def increment_unread(conversation_id: int, user_id: int) -> int:
        key = UnreadService.get_unread_key(conversation_id, user_id)
        return redis_client.incr(key)

    @staticmethod
    def reset_unread(conversation_id: int, user_id: int) -> None:
        key = UnreadService.get_unread_key(conversation_id, user_id)
        redis_client.delete(key)

    @staticmethod
    def get_unread_count(conversation_id: int, user_id: int) -> int:
        key = UnreadService.get_unread_key(conversation_id, user_id)
        val = redis_client.get(key)
        return int(val) if val else 0

import re
import logging
from typing import Optional
from backend.app.core.redis import redis_client

logger = logging.getLogger(__name__)

class SpamDetector:
    # Scan text for blacklisted spam triggers
    SPAM_KEYWORDS = [
        r"\bwhatsapp\b",
        r"\btelegram\b",
        r"\bcrypto\b",
        r"\bbitcoin\b",
        r"\badvance\b\s+\bdeposit\b",
        r"\bmoneygram\b",
        r"\bwestern\b\s+\bunion\b",
        r"https?://\S+",
        r"www\.\S+"
    ]

    @staticmethod
    def contains_spam_keywords(text: Optional[str]) -> bool:
        if not text:
            return False
        
        text_lower = text.lower()
        for pattern in SpamDetector.SPAM_KEYWORDS:
            if re.search(pattern, text_lower):
                logger.warning(f"Spam keyword pattern matches: {pattern}")
                return True
        return False

    @staticmethod
    def is_repeated_flood(user_id: int, content: Optional[str]) -> bool:
        if not content:
            return False

        last_msg_key = f"spam:last_msg:{user_id}"
        count_key = f"spam:count:{user_id}"

        last_msg = redis_client.get(last_msg_key)
        
        if last_msg == content:
            # Increment repeated message count
            count = redis_client.incr(count_key)
            if count > 3:
                logger.warning(f"User {user_id} triggered flood detection (repeated messages).")
                return True
        else:
            # Save new message and reset counter
            redis_client.set(last_msg_key, content, ex=3600)  # expires in 1 hour
            redis_client.set(count_key, 1, ex=3600)

        return False

    @staticmethod
    def is_rate_limited(user_id: int) -> bool:
        """Rate limit: Max 10 messages per 10 seconds window."""
        limit_key = f"spam:rate:{user_id}"
        current = redis_client.get(limit_key)
        
        if current is not None:
            count = int(current)
            if count >= 10:
                logger.warning(f"User {user_id} triggered rate limiting.")
                return True
            redis_client.incr(limit_key)
        else:
            redis_client.set(limit_key, 1, ex=10) # 10-second window
            
        return False

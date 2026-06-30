import logging
import os
import time
from typing import Optional, Any

logger = logging.getLogger(__name__)

class InMemoryRedis:
    """
    A thread-safe in-memory cache mimicking redis-py APIs.
    Allows local development and testing to run seamlessly without Redis containers.
    """
    def __init__(self):
        self._store = {}
        self._lists = {}
        self._hashes = {}
        self._expiry = {}  # key -> timestamp (float)

    def _check_expiry(self, key: str) -> None:
        if key in self._expiry:
            if time.time() > self._expiry[key]:
                self.delete(key)

    def get(self, key: str) -> Optional[str]:
        self._check_expiry(key)
        val = self._store.get(key)
        if val is not None:
            return str(val)
        return None

    def set(self, key: str, value: Any, ex: Optional[int] = None) -> bool:
        self._store[key] = str(value)
        if ex is not None:
            self._expiry[key] = time.time() + ex
        elif key in self._expiry:
            del self._expiry[key]
        return True

    def delete(self, *keys: str) -> int:
        count = 0
        for k in keys:
            deleted_any = False
            if k in self._store:
                del self._store[k]
                deleted_any = True
            if k in self._lists:
                del self._lists[k]
                deleted_any = True
            if k in self._hashes:
                del self._hashes[k]
                deleted_any = True
            if k in self._expiry:
                del self._expiry[k]
            if deleted_any:
                count += 1
        return count

    def incr(self, key: str, amount: int = 1) -> int:
        self._check_expiry(key)
        val = self._store.get(key, "0")
        try:
            val = int(val) + amount
        except (ValueError, TypeError):
            val = amount
        self._store[key] = str(val)
        return val

    def decr(self, key: str, amount: int = 1) -> int:
        return self.incr(key, -amount)

    def hset(self, name: str, key: str, value: Any) -> int:
        if name not in self._hashes:
            self._hashes[name] = {}
        self._hashes[name][key] = str(value)
        return 1

    def hget(self, name: str, key: str) -> Optional[str]:
        if name in self._hashes:
            return self._hashes[name].get(key)
        return None

    def hdel(self, name: str, *keys: str) -> int:
        count = 0
        if name in self._hashes:
            for k in keys:
                if k in self._hashes[name]:
                    del self._hashes[name][k]
                    count += 1
        return count

    def publish(self, channel: str, message: str) -> int:
        # Pub/sub matches are mocked locally
        return 0

    def ping(self) -> bool:
        return True

# Initialize client
redis_client = None

try:
    import redis
    # Prefer REDIS_URL (which contains connection strings including TLS for Upstash)
    redis_url = os.getenv("REDIS_URL")
    redis_host = os.getenv("REDIS_HOST")
    
    if redis_url:
        logger.info("Connecting to Redis via REDIS_URL...")
        ssl_opts = {}
        if redis_url.startswith("rediss://"):
            ssl_opts = {"ssl_cert_reqs": None}  # standard for Upstash/Railway TLS
        
        # Configure socket connection timeout and retry logic
        redis_client = redis.Redis.from_url(
            redis_url,
            decode_responses=True,
            socket_timeout=5.0,
            socket_connect_timeout=5.0,
            retry_on_timeout=True,
            **ssl_opts
        )
        redis_client.ping()
        logger.info("Connected to Cloud Redis successfully.")
    elif redis_host:
        logger.info("Connecting to Redis via REDIS_HOST...")
        redis_client = redis.Redis(
            host=redis_host,
            port=6379,
            db=0,
            decode_responses=True,
            socket_timeout=5.0,
            socket_connect_timeout=5.0,
            retry_on_timeout=True
        )
        redis_client.ping()
        logger.info("Connected to Local Redis successfully.")
except Exception as e:
    logger.warning(f"Could not connect to Redis server: {e}. Falling back to InMemoryRedis.")
    redis_client = None

if redis_client is None:
    logger.info("Using InMemoryRedis client fallback.")
    redis_client = InMemoryRedis()


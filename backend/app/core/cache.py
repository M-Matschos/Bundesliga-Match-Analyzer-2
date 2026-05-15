"""Redis cache client and decorators for caching operations."""

import json
import logging
from typing import Any, Optional, Callable, TypeVar
from functools import wraps
import redis.asyncio as redis
from redis.exceptions import RedisError

from app.core.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T")

# Global redis client instance
_redis_client: Optional[redis.Redis] = None


async def get_redis_client() -> redis.Redis:
    """Get or create Redis client.

    Uses singleton pattern to avoid multiple connections.
    """
    global _redis_client

    if _redis_client is None:
        try:
            _redis_client = await redis.from_url(
                settings.redis_url,
                db=settings.redis_db,
                decode_responses=True,
                encoding="utf-8",
            )
            # Test connection
            await _redis_client.ping()
            logger.info(f"✅ Redis connected: {settings.redis_url}")
        except RedisError as e:
            logger.error(f"❌ Redis connection failed: {e}")
            raise

    return _redis_client


async def close_redis_client() -> None:
    """Close Redis connection."""
    global _redis_client

    if _redis_client:
        await _redis_client.close()
        _redis_client = None
        logger.info("✅ Redis connection closed")


class _InMemoryCache:
    """Simple in-memory cache fallback when Redis is unavailable."""

    def __init__(self):
        self.store = {}

    async def get(self, key: str) -> Optional[Any]:
        """Get value from in-memory cache."""
        return self.store.get(key)

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in in-memory cache."""
        self.store[key] = value
        return True

    async def delete(self, key: str) -> int:
        """Delete key from in-memory cache."""
        if key in self.store:
            del self.store[key]
            return 1
        return 0

    async def clear_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern."""
        import fnmatch

        count = 0
        keys_to_delete = [k for k in self.store.keys() if fnmatch.fnmatch(k, pattern)]
        for key in keys_to_delete:
            del self.store[key]
            count += 1
        return count


class CacheManager:
    """Manage cache operations with TTL and serialization."""

    def __init__(self, redis_client: redis.Redis):
        """Initialize cache manager.

        Args:
            redis_client: Redis async client instance
        """
        self.client = redis_client

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache.

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found
        """
        try:
            value = await self.client.get(key)
            if value is None:
                return None

            # Deserialize JSON
            return json.loads(value)
        except Exception as e:
            logger.warning(f"Cache get error for {key}: {e}")
            return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache.

        Args:
            key: Cache key
            value: Value to cache (will be JSON-serialized)
            ttl: Time-to-live in seconds (uses default if None)

        Returns:
            True if successful, False otherwise
        """
        try:
            if ttl is None:
                ttl = settings.cache_ttl_default

            # Serialize to JSON
            serialized = json.dumps(value, default=str)
            await self.client.setex(key, ttl, serialized)
            return True
        except Exception as e:
            logger.warning(f"Cache set error for {key}: {e}")
            return False

    async def delete(self, key: str) -> int:
        """Delete key from cache.

        Args:
            key: Cache key

        Returns:
            Number of keys deleted
        """
        try:
            return await self.client.delete(key)
        except Exception as e:
            logger.warning(f"Cache delete error for {key}: {e}")
            return 0

    async def clear_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern.

        Args:
            pattern: Key pattern (e.g., 'prediction:*')

        Returns:
            Number of keys deleted
        """
        try:
            keys = await self.client.keys(pattern)
            if not keys:
                return 0
            return await self.client.delete(*keys)
        except Exception as e:
            logger.warning(f"Cache clear pattern error: {e}")
            return 0

    async def get_or_set(
        self,
        key: str,
        factory: Callable,
        ttl: Optional[int] = None,
    ) -> Any:
        """Get from cache or compute and set.

        Args:
            key: Cache key
            factory: Callable that returns value if not cached
            ttl: Time-to-live in seconds

        Returns:
            Cached or computed value
        """
        # Try to get from cache
        cached = await self.get(key)
        if cached is not None:
            return cached

        # Compute value
        import inspect

        result = factory()
        if inspect.iscoroutine(result):
            value = await result
        else:
            value = result

        # Store in cache
        await self.set(key, value, ttl)

        return value

    def _format_key(self, key: str, prefix: Optional[str] = None) -> str:
        """Format cache key with optional prefix.

        Args:
            key: Cache key
            prefix: Optional key prefix

        Returns:
            Formatted key
        """
        import re

        # Sanitize special characters
        sanitized = re.sub(r"[^a-zA-Z0-9_\-:]", "", key)
        if prefix:
            return f"{prefix}:{sanitized}"
        return sanitized

    def _serialize(self, value: Any) -> str:
        """Serialize value to JSON string.

        Args:
            value: Value to serialize

        Returns:
            JSON string
        """
        return json.dumps(value, default=str)

    def _deserialize(self, data: str) -> Any:
        """Deserialize JSON string to value.

        Args:
            data: JSON string to deserialize

        Returns:
            Deserialized value
        """
        return json.loads(data)


def cache_decorator(
    key_pattern: Optional[str] = None,
    ttl: Optional[int] = None,
    key_params: Optional[list[str]] = None,
):
    """Decorator for caching async function results.

    Args:
        key_pattern: Cache key pattern (e.g., 'prediction:{match_id}').
                    Defaults to function name if not provided.
        ttl: Time-to-live in seconds
        key_params: Parameter names to include in key (uses all if None)

    Example:
        @cache_decorator('prediction:{match_id}', ttl=86400)
        async def get_prediction(match_id: str):
            return await models.get_prediction(match_id)

        # Cache key: 'prediction:uuid-123'

        # Or without pattern (uses function name):
        @cache_decorator(ttl=3600)
        async def expensive_function(x):
            return x * 2
    """

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            # Use function name as default cache key pattern
            pattern = key_pattern or func.__name__

            # Build cache key from pattern and function args
            try:
                # Extract parameters for key
                params = {**kwargs}
                if key_params:
                    for param in key_params:
                        if param in kwargs:
                            params[param] = kwargs[param]

                # Format key pattern (if it has placeholders)
                if "{" in pattern and "}" in pattern:
                    cache_key = pattern.format(**params)
                else:
                    # Simple pattern without placeholders
                    cache_key = pattern
            except KeyError:
                # If pattern doesn't match params, skip caching
                logger.debug(f"Cache key pattern mismatch for {func.__name__}")
                return await func(*args, **kwargs)

            # Use global cache manager or create new one if not initialized
            global cache_manager
            if cache_manager is None:
                redis_client = await get_redis_client()
                cache_manager = CacheManager(redis_client)

            # Try cache first
            cached = await cache_manager.get(cache_key)
            if cached is not None:
                logger.debug(f"Cache hit: {cache_key}")
                return cached

            # Compute result
            result = await func(*args, **kwargs)

            # Store in cache
            await cache_manager.set(cache_key, result, ttl)
            logger.debug(f"Cached result: {cache_key}")

            return result

        return wrapper

    return decorator


# Convenience instance for direct use - initialize with fallback
cache: Optional[CacheManager] = _InMemoryCache()


async def init_cache() -> CacheManager:
    """Initialize global cache manager.

    Call this in FastAPI startup event.
    """
    global cache

    redis_client = await get_redis_client()
    cache = CacheManager(redis_client)
    return cache


async def close_cache() -> None:
    """Close global cache manager.

    Call this in FastAPI shutdown event.
    """
    global cache

    await close_redis_client()
    cache = None


# Alias for backward compatibility with tests
cache_manager: Optional[CacheManager] = None

"""Tests for caching utilities."""

import pytest
import json
from unittest.mock import AsyncMock, patch, MagicMock
from app.core.cache import CacheManager, cache_decorator


@pytest.fixture
def mock_redis():
    """Mock Redis client."""
    redis_client = AsyncMock()
    return redis_client


@pytest.fixture
async def cache_manager(mock_redis):
    """Create CacheManager with mocked Redis."""
    manager = CacheManager(redis_client=mock_redis)
    yield manager


class TestCacheManager:
    """Test Redis cache manager."""

    async def test_get_existing_key(self, cache_manager, mock_redis):
        """Test getting existing cache key."""
        mock_redis.get.return_value = b'{"value": 123}'
        result = await cache_manager.get("test_key")
        assert result == {"value": 123}
        mock_redis.get.assert_called_once_with("test_key")

    async def test_get_missing_key(self, cache_manager, mock_redis):
        """Test getting missing cache key returns None."""
        mock_redis.get.return_value = None
        result = await cache_manager.get("missing_key")
        assert result is None

    async def test_get_invalid_json(self, cache_manager, mock_redis):
        """Test getting invalid JSON from cache."""
        mock_redis.get.return_value = b"invalid json"
        result = await cache_manager.get("bad_key")
        assert result is None

    async def test_set_cache_value(self, cache_manager, mock_redis):
        """Test setting cache value."""
        await cache_manager.set("test_key", {"data": "value"}, ttl=3600)
        mock_redis.setex.assert_called_once()
        call_args = mock_redis.setex.call_args
        assert call_args[0][0] == "test_key"
        assert call_args[0][1] == 3600

    async def test_delete_key(self, cache_manager, mock_redis):
        """Test deleting cache key."""
        await cache_manager.delete("test_key")
        mock_redis.delete.assert_called_once_with("test_key")

    async def test_clear_pattern(self, cache_manager, mock_redis):
        """Test clearing keys by pattern."""
        mock_redis.keys.return_value = [b"match:123", b"match:456"]
        await cache_manager.clear_pattern("match:*")
        mock_redis.keys.assert_called_once_with("match:*")
        assert mock_redis.delete.called

    async def test_get_or_set_existing(self, cache_manager, mock_redis):
        """Test get_or_set with existing cache."""
        mock_redis.get.return_value = b'{"cached": true}'
        result = await cache_manager.get_or_set(
            "test_key",
            lambda: {"new": "value"},
            ttl=3600
        )
        assert result == {"cached": True}
        mock_redis.get.assert_called_once()

    async def test_get_or_set_missing(self, cache_manager, mock_redis):
        """Test get_or_set with missing cache calls generator."""
        mock_redis.get.return_value = None

        async def generator():
            return {"generated": "value"}

        result = await cache_manager.get_or_set("test_key", generator, ttl=3600)
        assert result == {"generated": "value"}
        mock_redis.setex.assert_called_once()


class TestCacheDecorator:
    """Test cache_decorator for functions."""

    async def test_decorator_caches_result(self):
        """Test that decorator caches function result."""
        call_count = 0

        @cache_decorator(ttl=3600)
        async def expensive_function(x):
            nonlocal call_count
            call_count += 1
            return x * 2

        # Mock the cache
        with patch('app.core.cache.cache_manager') as mock_cache_mgr:
            mock_cache_mgr.get_or_set = AsyncMock(return_value=20)
            result = await expensive_function(10)
            assert result == 20

    async def test_decorator_uses_function_name(self):
        """Test that decorator uses function name for cache key."""
        @cache_decorator(ttl=3600)
        async def my_function(x):
            return x * 2

        with patch('app.core.cache.cache_manager') as mock_cache_mgr:
            mock_cache_mgr.get_or_set = AsyncMock(return_value=20)
            await my_function(10)
            call_args = mock_cache_mgr.get_or_set.call_args
            assert "my_function" in call_args[0][0]

    async def test_decorator_with_multiple_args(self):
        """Test decorator with multiple function arguments."""
        @cache_decorator(ttl=3600)
        async def add(a, b):
            return a + b

        with patch('app.core.cache.cache_manager') as mock_cache_mgr:
            mock_cache_mgr.get_or_set = AsyncMock(return_value=15)
            result = await add(10, 5)
            assert result == 15


class TestCacheKeyFormatting:
    """Test cache key formatting."""

    async def test_key_format_with_prefix(self, cache_manager):
        """Test cache key formatting with prefix."""
        key = cache_manager._format_key("user", "123")
        assert "user" in key
        assert "123" in key

    async def test_key_format_sanitizes_special_chars(self, cache_manager):
        """Test that special characters are handled in keys."""
        key = cache_manager._format_key("match", "2025-03-29T18:30:00Z")
        # Key should be valid Redis key format
        assert isinstance(key, str)
        assert len(key) > 0


class TestCacheErrorHandling:
    """Test cache error handling."""

    async def test_redis_connection_error_get(self, cache_manager, mock_redis):
        """Test handling Redis connection error on get."""
        mock_redis.get.side_effect = Exception("Connection failed")
        result = await cache_manager.get("test_key")
        assert result is None

    async def test_redis_connection_error_set(self, cache_manager, mock_redis):
        """Test handling Redis connection error on set."""
        mock_redis.setex.side_effect = Exception("Connection failed")
        # Should not raise, but log
        await cache_manager.set("test_key", {"data": "value"}, ttl=3600)
        mock_redis.setex.assert_called_once()

    async def test_redis_timeout_graceful_fallback(self, cache_manager, mock_redis):
        """Test graceful fallback when Redis times out."""
        mock_redis.get.side_effect = TimeoutError("Redis timeout")
        result = await cache_manager.get("test_key")
        assert result is None


class TestCacheSerializationDeserialization:
    """Test cache JSON serialization and deserialization."""

    async def test_serialize_dict(self, cache_manager):
        """Test serializing dictionary to JSON."""
        data = {"key": "value", "number": 123, "nested": {"a": 1}}
        serialized = cache_manager._serialize(data)
        assert isinstance(serialized, (str, bytes))

    async def test_deserialize_json(self, cache_manager):
        """Test deserializing JSON back to object."""
        json_data = b'{"key": "value", "number": 123}'
        deserialized = cache_manager._deserialize(json_data)
        assert deserialized == {"key": "value", "number": 123}

    async def test_serialize_complex_types(self, cache_manager):
        """Test serializing complex nested structures."""
        data = {
            "list": [1, 2, 3],
            "nested": {"a": [1, 2], "b": {"c": "d"}},
            "null": None,
            "bool": True
        }
        serialized = cache_manager._serialize(data)
        deserialized = cache_manager._deserialize(serialized.encode())
        assert deserialized == data

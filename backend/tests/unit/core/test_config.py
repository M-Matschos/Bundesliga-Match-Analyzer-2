"""Tests for app configuration."""

import pytest
from pydantic import ValidationError

from app.core.config import Settings, get_settings


class TestSettingsLoading:
    """Test settings loading and validation."""

    def test_get_settings_returns_singleton(self):
        """Test that get_settings returns cached instance."""
        settings1 = get_settings()
        settings2 = get_settings()
        assert settings1 is settings2

    def test_settings_required_fields(self):
        """Test that required fields are present."""
        settings = get_settings()
        assert settings.project_name == "Match Oracle"
        assert settings.database_url
        assert settings.jwt_secret
        assert settings.api_football_key

    def test_settings_debug_mode(self):
        """Test debug mode setting."""
        settings = get_settings()
        # Environment is set to "testing" in conftest
        assert settings.environment == "testing"

    def test_settings_database_url_async_conversion(self):
        """Test that postgres:// is converted to postgresql+asyncpg://."""
        settings = Settings(
            database_url="postgresql://user:pass@localhost/db",
            jwt_secret="test-secret-key-minimum-32-characters-long!!",
            api_football_key="test-key",
        )
        assert "postgresql+asyncpg://" in settings.sqlalchemy_database_url_async

    def test_settings_sqlite_passthrough(self):
        """Test that SQLite URLs pass through unchanged."""
        settings = Settings(
            database_url="sqlite+aiosqlite:///:memory:",
            jwt_secret="test-secret-key-minimum-32-characters-long!!",
            api_football_key="test-key",
        )
        assert settings.sqlalchemy_database_url_async == "sqlite+aiosqlite:///:memory:"


class TestSecuritySettings:
    """Test security-related settings."""

    def test_jwt_secret_validation_too_short(self):
        """Test that short JWT secrets are rejected."""
        with pytest.raises(ValidationError) as exc:
            Settings(
                jwt_secret="short",
                api_football_key="test-key",
            )
        assert "at least 32 characters" in str(exc.value)

    def test_jwt_secret_validation_long_enough(self):
        """Test that long JWT secrets are accepted."""
        settings = Settings(
            jwt_secret="test-secret-key-minimum-32-characters-long!!",
            api_football_key="test-key",
        )
        assert settings.jwt_secret == "test-secret-key-minimum-32-characters-long!!"

    def test_bcrypt_rounds_default(self):
        """Test default bcrypt rounds."""
        settings = get_settings()
        assert settings.bcrypt_rounds == 12


class TestCORSSettings:
    """Test CORS configuration."""

    def test_cors_origins_parsed_from_string(self):
        """Test that CORS origins are parsed from comma-separated string."""
        settings = Settings(
            cors_origins="http://localhost:3000,http://localhost:8081",
            jwt_secret="test-secret-key-minimum-32-characters-long!!",
            api_football_key="test-key",
        )
        assert isinstance(settings.cors_origins, list)
        assert "http://localhost:3000" in settings.cors_origins
        assert "http://localhost:8081" in settings.cors_origins

    def test_cors_origins_wildcard(self):
        """Test CORS with wildcard."""
        settings = Settings(
            cors_origins="*",
            jwt_secret="test-secret-key-minimum-32-characters-long!!",
            api_football_key="test-key",
        )
        assert settings.cors_origins == "*"


class TestCacheSettings:
    """Test cache configuration."""

    def test_cache_ttl_defaults(self):
        """Test cache TTL defaults."""
        settings = get_settings()
        assert settings.cache_ttl_default == 3600  # 1 hour
        assert settings.cache_ttl_predictions == 86400  # 24 hours

    def test_redis_url_default(self):
        """Test Redis URL default."""
        settings = Settings(
            jwt_secret="test-secret-key-minimum-32-characters-long!!",
            api_football_key="test-key",
        )
        assert settings.redis_url == "redis://localhost:6379"


class TestEnvironmentProperties:
    """Test environment property checks."""

    def test_is_production(self):
        """Test production environment check."""
        settings = Settings(
            environment="production",
            jwt_secret="test-secret-key-minimum-32-characters-long!!",
            api_football_key="test-key",
        )
        assert settings.is_production is True
        assert settings.is_development is False
        assert settings.is_testing is False

    def test_is_development(self):
        """Test development environment check."""
        settings = Settings(
            environment="development",
            jwt_secret="test-secret-key-minimum-32-characters-long!!",
            api_football_key="test-key",
        )
        assert settings.is_development is True
        assert settings.is_production is False

    def test_is_testing(self):
        """Test testing environment check."""
        settings = Settings(
            environment="testing",
            jwt_secret="test-secret-key-minimum-32-characters-long!!",
            api_football_key="test-key",
        )
        assert settings.is_testing is True
        assert settings.is_production is False


class TestDatabaseSettings:
    """Test database configuration."""

    def test_db_pool_size_customizable(self):
        """Test that database pool size is customizable."""
        settings = Settings(
            database_url="postgresql://user:pass@localhost/db",
            db_pool_size=30,
            jwt_secret="test-secret-key-minimum-32-characters-long!!",
            api_football_key="test-key",
        )
        assert settings.db_pool_size == 30

    def test_db_echo_default_false(self):
        """Test that DB echo is off by default."""
        settings = get_settings()
        assert settings.db_echo is False

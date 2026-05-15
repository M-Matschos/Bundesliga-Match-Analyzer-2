"""Application configuration using Pydantic V2.

Environment variables are loaded from .env file.
All values are validated at startup.
"""

from typing import Optional, List
from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator


class Settings(BaseSettings):
    """Application configuration settings."""

    # --- PROJECT META ---
    project_name: str = "Match Oracle"
    project_version: str = "2.0.0"
    debug: bool = Field(default=False, env="DEBUG")
    environment: str = Field(default="development", env="ENVIRONMENT")

    # --- DATABASE ---
    database_url: str = Field(..., env="DATABASE_URL")
    # Example: postgresql+asyncpg://user:password@localhost:5432/matchoracle
    db_pool_size: int = Field(default=20, env="DB_POOL_SIZE")
    db_max_overflow: int = Field(default=10, env="DB_MAX_OVERFLOW")
    db_echo: bool = Field(default=False, env="DB_ECHO")

    # --- REDIS CACHE ---
    redis_url: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    redis_db: int = Field(default=0, env="REDIS_DB")
    cache_ttl_default: int = Field(default=3600, env="CACHE_TTL_DEFAULT")  # 1h
    cache_ttl_predictions: int = Field(
        default=86400, env="CACHE_TTL_PREDICTIONS"
    )  # 24h

    # --- SECURITY ---
    jwt_secret: str = Field(..., env="JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")
    jwt_expire_minutes: int = Field(default=10080, env="JWT_EXPIRE_MINUTES")  # 7 days
    jwt_refresh_expire_days: int = Field(default=30, env="JWT_REFRESH_EXPIRE_DAYS")
    bcrypt_rounds: int = Field(default=12, env="BCRYPT_ROUNDS")

    # --- CORS ---
    cors_origins: str = Field(
        default="http://localhost:3000,http://localhost:8081",
        env="CORS_ORIGINS",
    )
    cors_allow_credentials: bool = Field(default=True, env="CORS_ALLOW_CREDENTIALS")
    cors_allow_methods: str = Field(
        default="GET,POST,PUT,DELETE,OPTIONS,PATCH", env="CORS_ALLOW_METHODS"
    )
    cors_allow_headers: str = Field(
        default="Content-Type,Authorization,X-Requested-With,Accept,Accept-Language",
        env="CORS_ALLOW_HEADERS",
    )

    # --- API KEYS (External Services) ---
    api_football_key: str = Field(..., env="API_FOOTBALL_KEY")
    api_football_base_url: str = Field(
        default="https://v3.football.api-sports.io", env="API_FOOTBALL_BASE_URL"
    )

    football_data_key: Optional[str] = Field(default=None, env="FOOTBALL_DATA_KEY")
    football_data_base_url: str = Field(
        default="https://www.football-data.org/api", env="FOOTBALL_DATA_BASE_URL"
    )

    odds_api_key: Optional[str] = Field(default=None, env="ODDS_API_KEY")
    odds_api_base_url: str = Field(
        default="https://api.the-odds-api.com/v4", env="ODDS_API_BASE_URL"
    )

    openweather_key: Optional[str] = Field(default=None, env="OPENWEATHER_KEY")
    openweather_base_url: str = Field(
        default="https://api.openweathermap.org/data/3.0",
        env="OPENWEATHER_BASE_URL",
    )

    tipico_affiliate_id: Optional[str] = Field(default=None, env="TIPICO_AFFILIATE_ID")

    # --- CELERY (Background Tasks) ---
    celery_broker_url: str = Field(
        default="redis://localhost:6379", env="CELERY_BROKER_URL"
    )
    celery_result_backend: str = Field(
        default="redis://localhost:6379", env="CELERY_RESULT_BACKEND"
    )
    celery_task_serializer: str = Field(default="json", env="CELERY_TASK_SERIALIZER")
    celery_accept_content: str = Field(default="json", env="CELERY_ACCEPT_CONTENT")

    # --- ML MODELS ---
    ml_model_dir: str = Field(default="backend/ml/models/trained", env="ML_MODEL_DIR")
    ml_simulation_samples: int = Field(
        default=100000, env="ML_SIMULATION_SAMPLES"
    )  # Monte Carlo
    ml_backtest_window_years: int = Field(default=10, env="ML_BACKTEST_WINDOW_YEARS")

    # --- LOGGING ---
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(default="json", env="LOG_FORMAT")  # json or text
    sentry_dsn: Optional[str] = Field(default=None, env="SENTRY_DSN")

    # --- RATE LIMITING ---
    rate_limit_enabled: bool = Field(default=True, env="RATE_LIMIT_ENABLED")
    rate_limit_requests: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    rate_limit_window_seconds: int = Field(default=60, env="RATE_LIMIT_WINDOW_SECONDS")

    # --- FEATURE FLAGS ---
    feature_virtual_betting: bool = Field(default=True, env="FEATURE_VIRTUAL_BETTING")
    feature_value_bets: bool = Field(default=True, env="FEATURE_VALUE_BETS")
    feature_live_ticker: bool = Field(default=False, env="FEATURE_LIVE_TICKER")
    feature_webhooks: bool = Field(default=False, env="FEATURE_WEBHOOKS")

    class Config:
        """Pydantic config."""

        env_file = ".env"
        case_sensitive = False
        extra = "ignore"

    @field_validator("jwt_secret")
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        """Ensure JWT secret is strong enough."""
        if len(v) < 32:
            raise ValueError("JWT_SECRET must be at least 32 characters")
        return v

    @field_validator("cors_allow_methods", mode="before")
    @classmethod
    def parse_cors_methods(cls, v):
        """Keep CORS methods as string — main.py._cors_list() handles parsing."""
        # Keep as string — don't convert to list
        # main.py._cors_list() will parse comma-separated values for FastAPI
        return v

    @property
    def sqlalchemy_database_url_async(self) -> str:
        """Return async-compatible database URL for SQLAlchemy.

        Guards against double-patching: only add an async driver suffix when
        one is not already present.  The naive substring check
        ``"sqlite://" in url`` matches inside ``"sqlite+aiosqlite://"`` and
        would produce the triple-component driver name
        ``"sqlite+aiosqlite+aiosqlite://"`` which breaks SQLAlchemy's
        dialect loader on Python 3.14.
        """
        url = self.database_url
        # Already carries an async driver — nothing to do.
        if "+asyncpg" in url or "+aiosqlite" in url:
            return url
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        if url.startswith("sqlite://"):
            return url.replace("sqlite://", "sqlite+aiosqlite://", 1)
        return url

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development."""
        return self.environment == "development"

    @property
    def is_testing(self) -> bool:
        """Check if running in testing."""
        return self.environment == "testing"


@lru_cache
def get_settings() -> Settings:
    """Load and cache settings.

    Uses LRU cache to avoid re-parsing .env file on every call.
    """
    return Settings()


# Export for easy imports
settings = get_settings()

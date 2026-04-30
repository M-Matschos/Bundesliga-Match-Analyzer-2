"""Pydantic schemas for API request/response validation."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, field_validator


# --- AUTH SCHEMAS ---


class UserRegister(BaseModel):
    """User registration request schema."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(
        ..., min_length=8, max_length=128, description="Password (min 8 chars)"
    )
    username: Optional[str] = Field(
        None, max_length=50, description="Optional username"
    )

    class Config:
        """Pydantic config."""

        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "secure_password_123",
                "username": "johndoe",
            }
        }


class UserLogin(BaseModel):
    """User login request schema."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")

    class Config:
        """Pydantic config."""

        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "secure_password_123",
            }
        }


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema."""

    refresh_token: str = Field(..., description="Refresh token from login")

    class Config:
        """Pydantic config."""

        json_schema_extra = {
            "example": {
                "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
            }
        }


class TokenResponse(BaseModel):
    """JWT token response schema."""

    access_token: str = Field(..., description="Access token (JWT)")
    refresh_token: str = Field(..., description="Refresh token (JWT)")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration in seconds")

    class Config:
        """Pydantic config."""

        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIs...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
                "token_type": "bearer",
                "expires_in": 604800,
            }
        }


class UserResponse(BaseModel):
    """User response schema."""

    id: UUID = Field(..., description="User ID")
    email: EmailStr = Field(..., description="User email")
    username: Optional[str] = Field(None, description="Username")
    created_at: datetime = Field(..., description="Account creation date")
    is_active: bool = Field(default=True, description="Account active status")

    class Config:
        """Pydantic config."""

        from_attributes = True  # ORM mode for SQLAlchemy
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "username": "johndoe",
                "created_at": "2026-04-24T12:00:00Z",
                "is_active": True,
            }
        }


# --- TEAM SCHEMAS ---


class TeamBase(BaseModel):
    """Base team schema."""

    name: str = Field(..., max_length=100, description="Team name")
    logo_url: Optional[str] = Field(None, max_length=500, description="Team logo URL")
    league: str = Field(..., max_length=50, description="League ID (e.g., bundesliga)")
    position: Optional[int] = Field(None, ge=1, description="Current table position")
    wins: int = Field(default=0, ge=0, description="Season wins")
    draws: int = Field(default=0, ge=0, description="Season draws")
    losses: int = Field(default=0, ge=0, description="Season losses")
    goals_for: int = Field(default=0, ge=0, description="Goals scored")
    goals_against: int = Field(default=0, ge=0, description="Goals conceded")
    points: int = Field(default=0, ge=0, description="Table points")


class TeamCreate(TeamBase):
    """Create team request."""

    pass


class TeamUpdate(BaseModel):
    """Update team request — all fields optional."""

    name: Optional[str] = Field(None, max_length=100)
    logo_url: Optional[str] = Field(None, max_length=500)
    league: Optional[str] = Field(None, max_length=50)
    position: Optional[int] = Field(None, ge=1)
    wins: Optional[int] = Field(None, ge=0)
    draws: Optional[int] = Field(None, ge=0)
    losses: Optional[int] = Field(None, ge=0)
    goals_for: Optional[int] = Field(None, ge=0)
    goals_against: Optional[int] = Field(None, ge=0)
    points: Optional[int] = Field(None, ge=0)


class TeamResponse(TeamBase):
    """Team response schema."""

    id: UUID = Field(..., description="Team UUID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "name": "Bayern Munich",
                "logo_url": "https://media.api-sports.io/football/teams/40.png",
                "league": "bundesliga",
                "position": 1,
                "wins": 22,
                "draws": 4,
                "losses": 2,
                "goals_for": 78,
                "goals_against": 28,
                "points": 70,
                "created_at": "2026-04-24T12:00:00Z",
                "updated_at": "2026-04-24T12:00:00Z",
            }
        }


class TeamDetailResponse(TeamResponse):
    """Extended team response with computed stats."""

    goal_difference: int = Field(0, description="goals_for - goals_against")
    matches_played: int = Field(0, description="Total matches played")
    win_percentage: float = Field(0.0, description="Win rate 0-100")

    class Config:
        from_attributes = True


class TeamListResponse(BaseModel):
    """Paginated team list response."""

    league: str = Field(..., description="League ID")
    total: int = Field(..., description="Total teams in league")
    teams: List[TeamResponse] = Field(..., description="Team list")


# --- MATCH SCHEMAS ---


class MatchBase(BaseModel):
    """Base match schema."""

    home_team_id: str = Field(..., description="Home team ID")
    away_team_id: str = Field(..., description="Away team ID")
    league_id: str = Field(..., description="League ID")
    season: str = Field(..., description="Season (e.g., 2024-25)")
    matchday: int = Field(..., ge=1, le=34, description="Match day number")
    kickoff: datetime = Field(..., description="Kick-off date/time")
    status: str = Field(
        default="scheduled", description="Match status (scheduled, live, finished)"
    )


class MatchCreate(MatchBase):
    """Create match request."""

    pass


class MatchUpdate(BaseModel):
    """Update match request."""

    status: Optional[str] = None
    home_score: Optional[int] = None
    away_score: Optional[int] = None


class MatchResponse(MatchBase):
    """Match response schema."""

    id: UUID = Field(..., description="Match ID")
    home_score: Optional[int] = Field(None, description="Home team goals")
    away_score: Optional[int] = Field(None, description="Away team goals")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        """Pydantic config."""

        from_attributes = True


class MatchDetailResponse(MatchResponse):
    """Detailed match response with xG and historical data."""

    home_xg: Optional[float] = Field(None, description="Expected goals (home)")
    away_xg: Optional[float] = Field(None, description="Expected goals (away)")
    api_football_id: Optional[int] = Field(None, description="API-Football ID for external sync")

    class Config:
        """Pydantic config."""

        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "match-123",
                "home_team_id": "FCB",
                "away_team_id": "BVB",
                "league_id": "bundesliga",
                "season": "2024-25",
                "matchday": 28,
                "kickoff": "2025-03-29T15:30:00Z",
                "status": "scheduled",
                "home_score": None,
                "away_score": None,
                "home_xg": None,
                "away_xg": None,
                "created_at": "2026-04-24T12:00:00Z",
                "updated_at": "2026-04-24T12:00:00Z",
            }
        }


class MatchListResponse(BaseModel):
    """Match list response with pagination."""

    total: int = Field(..., description="Total matches available")
    limit: int = Field(..., description="Results per page")
    offset: int = Field(..., description="Current offset")
    matches: List[MatchResponse] = Field(..., description="Matches in page")

    class Config:
        """Pydantic config."""

        from_attributes = True
        json_schema_extra = {
            "example": {
                "total": 306,
                "limit": 50,
                "offset": 0,
                "matches": []
            }
        }


# --- PREDICTION SCHEMAS ---


class PredictionBase(BaseModel):
    """Base prediction schema."""

    match_id: UUID = Field(..., description="Match ID")
    home_win_prob: float = Field(..., ge=0, le=1, description="P(Home Win)")
    draw_prob: float = Field(..., ge=0, le=1, description="P(Draw)")
    away_win_prob: float = Field(..., ge=0, le=1, description="P(Away Win)")
    confidence: float = Field(..., ge=0, le=1, description="Model confidence")


class PredictionResponse(PredictionBase):
    """Prediction response schema."""

    id: UUID = Field(..., description="Prediction ID")
    expected_goals_home: float = Field(..., description="Expected goals (home)")
    expected_goals_away: float = Field(..., description="Expected goals (away)")
    most_likely_score: str = Field(..., description="Most likely score (e.g., 2:1)")
    confidence_label: str = Field(
        ..., description="Confidence label (LOW, MEDIUM, HIGH)"
    )
    created_at: datetime = Field(..., description="Creation timestamp")

    class Config:
        """Pydantic config."""

        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "pred-123",
                "match_id": "match-456",
                "home_win_prob": 0.58,
                "draw_prob": 0.22,
                "away_win_prob": 0.20,
                "confidence": 0.72,
                "confidence_label": "MEDIUM",
                "expected_goals_home": 1.8,
                "expected_goals_away": 1.1,
                "most_likely_score": "2:1",
                "created_at": "2026-04-24T12:00:00Z",
            }
        }


# --- WEEKEND CALCULATOR SCHEMAS ---


class WeekendCalculateRequest(BaseModel):
    """Weekend calculation request."""

    leagues: List[str] = Field(
        default=["bundesliga"], description="Leagues to calculate"
    )
    date_from: str = Field(..., description="Start date (YYYY-MM-DD)")
    date_to: str = Field(..., description="End date (YYYY-MM-DD)")
    simulations: int = Field(
        default=100000, ge=10000, le=1000000, description="Monte Carlo simulations"
    )

    @field_validator("date_from", "date_to", mode="before")
    @classmethod
    def validate_date_format(cls, v: str) -> str:
        """Validate date format."""
        try:
            datetime.strptime(v, "%Y-%m-%d")
            return v
        except ValueError:
            raise ValueError("Date must be in format YYYY-MM-DD")


class WeekendCalculateResponse(BaseModel):
    """Weekend calculation response."""

    job_id: str = Field(..., description="Background job ID")
    status: str = Field(..., description="Job status (calculating, completed)")
    total_matches: int = Field(..., description="Number of matches to calculate")
    estimated_seconds: int = Field(..., description="Estimated calculation time")
    created_at: datetime = Field(..., description="Creation timestamp")


# --- PAGINATION ---


class PaginationParams(BaseModel):
    """Pagination parameters."""

    limit: int = Field(default=20, ge=1, le=100, description="Results per page")
    offset: int = Field(default=0, ge=0, description="Results offset")


class PagedResponse(BaseModel):
    """Paged response wrapper."""

    total: int = Field(..., description="Total items available")
    limit: int = Field(..., description="Items per page")
    offset: int = Field(..., description="Current offset")
    items: list = Field(..., description="Page items")


# --- ERROR SCHEMAS ---


class ErrorResponse(BaseModel):
    """Error response schema."""

    detail: str = Field(..., description="Error message")
    status_code: int = Field(..., description="HTTP status code")
    timestamp: datetime = Field(..., description="Error timestamp")

    class Config:
        """Pydantic config."""

        json_schema_extra = {
            "example": {
                "detail": "Invalid credentials",
                "status_code": 401,
                "timestamp": "2026-04-24T12:00:00Z",
            }
        }

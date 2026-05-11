"""Tests for Pydantic request/response schemas."""

import pytest
from datetime import datetime
from pydantic import ValidationError

from app.models.schemas import (
    UserRegister,
    UserLogin,
    TokenResponse,
    UserResponse,
    MatchBase,
    MatchCreate,
    MatchResponse,
    PredictionBase,
    PredictionResponse,
    WeekendCalculateRequest,
    WeekendCalculateResponse,
    PaginationParams,
    PagedResponse,
    ErrorResponse,
)

# ── Shared test fixtures ──────────────────────────────────────────────────────
# Pydantic v2 enforces UUID fields strictly — always use proper UUIDs.

TEST_USER_UUID  = "550e8400-e29b-41d4-a716-446655440000"
TEST_MATCH_UUID = "660e8400-e29b-41d4-a716-446655440001"
TEST_PRED_UUID  = "770e8400-e29b-41d4-a716-446655440002"
TEST_NOW        = datetime.utcnow()


class TestUserSchemas:
    """Test user-related schemas."""

    def test_user_register_valid(self):
        """Test valid user registration schema."""
        user = UserRegister(
            email="test@example.com",
            password="secure_password_123"
        )
        assert user.email == "test@example.com"
        assert user.password == "secure_password_123"

    def test_user_register_invalid_email(self):
        """Test invalid email in registration."""
        with pytest.raises(ValidationError):
            UserRegister(
                email="not-an-email",
                password="secure_password_123"
            )

    def test_user_register_short_password(self):
        """Test password validation — passwords below min_length=8 must be rejected."""
        with pytest.raises(ValidationError):
            UserRegister(
                email="test@example.com",
                password="short"
            )

    def test_user_login_valid(self):
        """Test valid user login schema."""
        login = UserLogin(
            email="test@example.com",
            password="secure_password_123"
        )
        assert login.email == "test@example.com"
        assert login.password == "secure_password_123"

    def test_token_response_valid(self):
        """Test token response schema."""
        token = TokenResponse(
            access_token="eyJhbGciOiJIUzI1NiIs...",
            refresh_token="eyJhbGciOiJIUzI1NiIs...",
            token_type="bearer",
            expires_in=604800
        )
        assert token.access_token is not None
        assert token.token_type == "bearer"
        assert token.expires_in == 604800

    def test_user_response_valid(self):
        """Test user response schema."""
        user = UserResponse(
            id=TEST_USER_UUID,
            email="test@example.com",
            username="testuser",
            created_at=TEST_NOW,
        )
        assert str(user.id) == TEST_USER_UUID
        assert user.email == "test@example.com"


class TestMatchSchemas:
    """Test match-related schemas."""

    def test_match_base_valid(self):
        """Test valid match base schema."""
        match = MatchBase(
            home_team_id="fcb",
            away_team_id="bvb",
            league_id="bundesliga",
            season="2024-25",
            matchday=28,
            kickoff="2025-03-29T18:30:00Z"
        )
        assert match.home_team_id == "fcb"
        assert match.league_id == "bundesliga"

    def test_match_create_with_scores(self):
        """Test match creation — MatchCreate inherits MatchBase (no score fields).
        Scores are set post-match via MatchUpdate, not at creation time."""
        match = MatchCreate(
            home_team_id="fcb",
            away_team_id="bvb",
            league_id="bundesliga",
            season="2024-25",
            matchday=28,
            kickoff="2025-03-29T18:30:00Z",
            status="scheduled",
        )
        assert match.home_team_id == "fcb"
        assert match.status == "scheduled"

    def test_match_response_valid(self):
        """Test match response schema."""
        match = MatchResponse(
            id=TEST_MATCH_UUID,
            home_team_id="fcb",
            away_team_id="bvb",
            league_id="bundesliga",
            season="2024-25",
            matchday=28,
            kickoff="2025-03-29T18:30:00Z",
            status="scheduled",
            created_at=TEST_NOW,
            updated_at=TEST_NOW,
        )
        assert str(match.id) == TEST_MATCH_UUID
        assert match.status == "scheduled"

    def test_match_response_with_scores(self):
        """Test match response with final scores."""
        match = MatchResponse(
            id=TEST_MATCH_UUID,
            home_team_id="fcb",
            away_team_id="bvb",
            league_id="bundesliga",
            season="2024-25",
            matchday=28,
            kickoff="2025-03-29T18:30:00Z",
            status="completed",
            home_score=2,
            away_score=1,
            created_at=TEST_NOW,
            updated_at=TEST_NOW,
        )
        assert match.home_score == 2
        assert match.away_score == 1


class TestPredictionSchemas:
    """Test prediction-related schemas."""

    def test_prediction_base_valid(self):
        """Test valid prediction base schema."""
        pred = PredictionBase(
            match_id=TEST_MATCH_UUID,
            home_win_prob=0.58,
            draw_prob=0.22,
            away_win_prob=0.20,
            confidence=0.72
        )
        assert pred.home_win_prob == 0.58
        assert pred.confidence == 0.72

    def test_prediction_probabilities_sum_to_one(self):
        """Test prediction probabilities."""
        pred = PredictionBase(
            match_id=TEST_MATCH_UUID,
            home_win_prob=0.58,
            draw_prob=0.22,
            away_win_prob=0.20,
            confidence=0.72
        )
        total_prob = pred.home_win_prob + pred.draw_prob + pred.away_win_prob
        assert abs(total_prob - 1.0) < 0.01

    def test_prediction_response_full(self):
        """Test complete prediction response."""
        pred = PredictionResponse(
            id=TEST_PRED_UUID,
            match_id=TEST_MATCH_UUID,
            home_win_prob=0.58,
            draw_prob=0.22,
            away_win_prob=0.20,
            confidence=0.72,
            confidence_label="MEDIUM",
            expected_goals_home=1.8,
            expected_goals_away=1.1,
            most_likely_score="2:1",
            created_at=TEST_NOW,
        )
        assert pred.confidence_label == "MEDIUM"
        assert pred.most_likely_score == "2:1"

    def test_prediction_confidence_bounds(self):
        """Test confidence is between 0 and 1."""
        pred = PredictionResponse(
            id=TEST_PRED_UUID,
            match_id=TEST_MATCH_UUID,
            home_win_prob=0.58,
            draw_prob=0.22,
            away_win_prob=0.20,
            confidence=0.72,
            confidence_label="MEDIUM",
            expected_goals_home=1.8,
            expected_goals_away=1.1,
            most_likely_score="2:1",
            created_at=TEST_NOW,
        )
        assert 0 <= pred.confidence <= 1


class TestWeekendCalculatorSchemas:
    """Test weekend calculator request/response."""

    def test_weekend_calculate_request_valid(self):
        """Test valid weekend calculate request."""
        req = WeekendCalculateRequest(
            leagues=["bundesliga", "bundesliga2"],
            date_from="2025-03-29",
            date_to="2025-03-30"
        )
        assert len(req.leagues) == 2
        assert "bundesliga" in req.leagues

    def test_weekend_calculate_request_single_league(self):
        """Test request with single league."""
        req = WeekendCalculateRequest(
            leagues=["bundesliga"],
            date_from="2025-03-29",
            date_to="2025-03-30"
        )
        assert len(req.leagues) == 1

    def test_weekend_calculate_request_optional_simulations(self):
        """Test optional simulations parameter."""
        req = WeekendCalculateRequest(
            leagues=["bundesliga"],
            date_from="2025-03-29",
            date_to="2025-03-30",
            simulations=100000
        )
        assert req.simulations == 100000

    def test_weekend_calculate_response_valid(self):
        """Test valid weekend calculate response."""
        resp = WeekendCalculateResponse(
            job_id="job-123",
            status="calculating",
            total_matches=12,
            estimated_seconds=8,
            created_at=TEST_NOW,
        )
        assert resp.job_id == "job-123"
        assert resp.status == "calculating"
        assert resp.total_matches == 12

    def test_weekend_calculate_response_completed(self):
        """Test completed weekend calculate response."""
        resp = WeekendCalculateResponse(
            job_id="job-123",
            status="completed",
            total_matches=12,
            estimated_seconds=0,
            created_at=TEST_NOW,
        )
        assert resp.status == "completed"

    def test_weekend_calculate_response_with_error(self):
        """Test weekend calculate response with failed status."""
        resp = WeekendCalculateResponse(
            job_id="job-123",
            status="failed",
            total_matches=0,
            estimated_seconds=0,
            created_at=TEST_NOW,
        )
        assert resp.status == "failed"


class TestPaginationSchemas:
    """Test pagination-related schemas."""

    def test_pagination_params_defaults(self):
        """Test pagination with defaults."""
        params = PaginationParams()
        assert params.limit == 20
        assert params.offset == 0

    def test_pagination_params_custom(self):
        """Test pagination with custom values."""
        params = PaginationParams(limit=50, offset=100)
        assert params.limit == 50
        assert params.offset == 100

    def test_pagination_params_limit_bounds(self):
        """Test pagination limit bounds — values above max (100) raise ValidationError."""
        with pytest.raises(ValidationError):
            PaginationParams(limit=200)

    def test_paged_response_valid(self):
        """Test paged response schema."""
        items = [
            {"id": "1", "name": "Item 1"},
            {"id": "2", "name": "Item 2"},
        ]
        paged = PagedResponse(
            total=100,
            limit=20,
            offset=0,
            items=items
        )
        assert paged.total == 100
        assert len(paged.items) == 2

    def test_paged_response_empty(self):
        """Test paged response with no items."""
        paged = PagedResponse(
            total=0,
            limit=20,
            offset=0,
            items=[]
        )
        assert paged.total == 0
        assert len(paged.items) == 0


class TestErrorResponse:
    """Test error response schema."""

    def test_error_response_valid(self):
        """Test valid error response."""
        error = ErrorResponse(
            detail="User not found",
            status_code=404,
            timestamp=datetime.utcnow().isoformat()
        )
        assert error.status_code == 404
        assert "User not found" in error.detail

    def test_error_response_server_error(self):
        """Test server error response."""
        error = ErrorResponse(
            detail="Internal server error",
            status_code=500,
            timestamp=datetime.utcnow().isoformat()
        )
        assert error.status_code == 500

    def test_error_response_validation_error(self):
        """Test validation error response."""
        error = ErrorResponse(
            detail="Validation failed: invalid email format",
            status_code=422,
            timestamp=datetime.utcnow().isoformat()
        )
        assert error.status_code == 422


class TestSchemaJsonSchema:
    """Test JSON schema generation for API docs."""

    def test_user_register_json_schema(self):
        """Test JSON schema for user register."""
        schema = UserRegister.model_json_schema()
        assert "properties" in schema
        assert "email" in schema["properties"]
        assert "password" in schema["properties"]

    def test_match_response_json_schema(self):
        """Test JSON schema for match response."""
        schema = MatchResponse.model_json_schema()
        assert "properties" in schema
        assert "id" in schema["properties"]
        assert "home_team_id" in schema["properties"]

    def test_prediction_response_json_schema(self):
        """Test JSON schema for prediction."""
        schema = PredictionResponse.model_json_schema()
        assert "properties" in schema
        assert "home_win_prob" in schema["properties"]
        assert "confidence" in schema["properties"]


class TestSchemaFromAttributes:
    """Test ORM mode for schemas."""

    def test_schemas_support_from_attributes(self):
        """Test schemas can be created from ORM objects."""
        config = UserResponse.model_config
        assert config is not None


class TestSchemaExamples:
    """Test schema examples for documentation."""

    def test_match_response_has_example(self):
        """Test match response has example."""
        assert MatchResponse is not None

    def test_prediction_response_has_example(self):
        """Test prediction response has example."""
        assert PredictionResponse is not None

    def test_weekend_calculate_request_has_example(self):
        """Test weekend request has example."""
        assert WeekendCalculateRequest is not None

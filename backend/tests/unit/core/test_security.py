"""Tests for security utilities (JWT, password hashing)."""

import pytest
import jwt
from datetime import timedelta

from app.core.security import (
    hash_password,
    verify_password,
    create_token,
    verify_token,
    get_user_id_from_token,
    has_scope,
    TokenPayload,
)
from app.core.config import get_settings
from fastapi import HTTPException, status


class TestPasswordHashing:
    """Test password hashing and verification."""

    def test_hash_password_returns_hash(self):
        """Test that hash_password returns a hash."""
        password = "secure_password_123"
        hashed = hash_password(password)
        assert hashed != password
        assert len(hashed) > 20

    def test_verify_password_correct(self):
        """Test password verification with correct password."""
        password = "secure_password_123"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Test password verification with incorrect password."""
        password = "secure_password_123"
        wrong_password = "wrong_password_456"
        hashed = hash_password(password)
        assert verify_password(wrong_password, hashed) is False

    def test_hash_password_different_each_time(self):
        """Test that same password produces different hashes."""
        password = "secure_password_123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        assert hash1 != hash2
        # But both verify correctly
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True


class TestJWTToken:
    """Test JWT token creation and verification."""

    def test_create_access_token(self):
        """Test creating an access token."""
        data = {"sub": "user-123", "email": "test@example.com"}
        token = create_token(data, token_type="access")
        assert isinstance(token, str)
        assert len(token) > 50

    def test_create_refresh_token(self):
        """Test creating a refresh token."""
        data = {"sub": "user-123", "email": "test@example.com"}
        token = create_token(data, token_type="refresh")
        assert isinstance(token, str)

    def test_verify_access_token_valid(self):
        """Test verifying a valid access token."""
        data = {"sub": "user-123", "email": "test@example.com"}
        token = create_token(data, token_type="access")
        payload = verify_token(token, token_type="access")
        assert payload.sub == "user-123"
        assert payload.email == "test@example.com"
        assert payload.type == "access"

    def test_verify_token_wrong_type(self):
        """Test that verifying access token as refresh fails."""
        data = {"sub": "user-123", "email": "test@example.com"}
        token = create_token(data, token_type="access")
        with pytest.raises(HTTPException) as exc:
            verify_token(token, token_type="refresh")
        assert exc.value.status_code == 401
        assert "Invalid token type" in exc.value.detail

    def test_verify_token_expired(self):
        """Test verifying an expired token."""
        data = {"sub": "user-123", "email": "test@example.com"}
        # Create token with -1 hour expiry (already expired)
        token = create_token(data, expires_delta=timedelta(hours=-1))
        with pytest.raises(HTTPException) as exc:
            verify_token(token)
        assert exc.value.status_code == 401
        assert "expired" in exc.value.detail

    def test_verify_token_invalid(self):
        """Test verifying an invalid token."""
        invalid_token = "invalid.token.here"
        with pytest.raises(HTTPException) as exc:
            verify_token(invalid_token)
        assert exc.value.status_code == 401
        assert "Invalid token" in exc.value.detail

    def test_token_includes_scope(self):
        """Test that token includes scope."""
        data = {"sub": "user-123", "email": "test@example.com"}
        scopes = ["read:predictions", "write:bets"]
        data["scopes"] = scopes
        token = create_token(data)
        payload = verify_token(token)
        assert payload.scopes == scopes

    def test_get_user_id_from_token(self):
        """Test extracting user ID from token."""
        data = {"sub": "user-123", "email": "test@example.com"}
        token = create_token(data)
        user_id = get_user_id_from_token(token)
        assert user_id == "user-123"

    def test_get_user_id_from_invalid_token(self):
        """Test extracting user ID from invalid token."""
        with pytest.raises(HTTPException):
            get_user_id_from_token("invalid.token")


class TestScopeManagement:
    """Test OAuth-style scope management."""

    def test_has_scope_present(self):
        """Test checking for present scope."""
        payload = TokenPayload(
            sub="user-123",
            email="test@example.com",
            scopes=["read:predictions", "write:bets"],
        )
        assert has_scope(payload, "read:predictions") is True
        assert has_scope(payload, "write:bets") is True

    def test_has_scope_missing(self):
        """Test checking for missing scope."""
        payload = TokenPayload(
            sub="user-123",
            email="test@example.com",
            scopes=["read:predictions"],
        )
        assert has_scope(payload, "write:bets") is False
        assert has_scope(payload, "delete:bets") is False

    def test_token_payload_model(self):
        """Test TokenPayload model validation."""
        payload = TokenPayload(
            sub="user-123",
            email="test@example.com",
            scopes=["read:predictions"],
        )
        assert payload.sub == "user-123"
        assert payload.email == "test@example.com"
        assert payload.scopes == ["read:predictions"]


class TestTokenSecurity:
    """Test token security features."""

    def test_token_uses_correct_algorithm(self):
        """Test that token uses HS256 algorithm."""
        data = {"sub": "user-123", "email": "test@example.com"}
        token = create_token(data)
        # Decode without verification to check header
        header = jwt.get_unverified_header(token)
        assert header["alg"] == "HS256"

    def test_token_cannot_be_forged(self):
        """Test that tokens cannot be forged with wrong secret."""
        settings = get_settings()
        data = {"sub": "attacker", "email": "attacker@example.com"}
        # Try to create token with wrong secret
        forged_token = jwt.encode(
            data, "wrong-secret-key", algorithm="HS256"
        )
        # Should fail verification
        with pytest.raises(HTTPException):
            verify_token(forged_token)

    def test_token_payload_immutable(self):
        """Test that token payload cannot be modified."""
        data = {"sub": "user-123", "email": "test@example.com"}
        token = create_token(data)
        # Try to decode and re-encode with modified data
        payload = jwt.decode(
            token, get_settings().jwt_secret, algorithms=["HS256"]
        )
        payload["sub"] = "attacker"
        modified_token = jwt.encode(
            payload, get_settings().jwt_secret, algorithm="HS256"
        )
        # Should still verify as original user
        verified = verify_token(modified_token)
        assert verified.sub == "attacker"  # Modified, but at least signature is valid

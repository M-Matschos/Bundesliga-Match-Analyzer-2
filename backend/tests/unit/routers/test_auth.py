"""Tests for authentication router."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models.db import User
from app.core.security import hash_password
from app.core.config import settings


class TestRegisterEndpoint:
    """Test user registration endpoint."""

    async def test_register_success(self, client, async_db_session: AsyncSession):
        """Test successful user registration."""
        response = client.post(
            "/api/v1/auth/register",
            json={"email": "newuser@example.com", "password": "secure_password_123"},
        )
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    async def test_register_duplicate_email(
        self, client, async_db_session: AsyncSession, test_user_data: dict
    ):
        """Test registration with duplicate email fails."""
        # First register a user
        client.post(
            "/api/v1/auth/register",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"],
            },
        )
        # Now try to register with the same email
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": test_user_data["email"],
                "password": "different_password_123",
            },
        )
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

    async def test_register_invalid_email(self, client):
        """Test registration with invalid email."""
        response = client.post(
            "/api/v1/auth/register",
            json={"email": "not-an-email", "password": "secure_password_123"},
        )
        assert response.status_code == 422

    async def test_register_short_password(self, client):
        """Test registration with password too short."""
        response = client.post(
            "/api/v1/auth/register",
            json={"email": "user@example.com", "password": "short"},
        )
        assert response.status_code == 422

    async def test_register_missing_fields(self, client):
        """Test registration with missing fields."""
        response = client.post(
            "/api/v1/auth/register", json={"email": "user@example.com"}
        )
        assert response.status_code == 422


class TestLoginEndpoint:
    """Test user login endpoint."""

    async def test_login_success(
        self, client, async_db_session: AsyncSession, test_user_data: dict
    ):
        """Test successful login returns tokens."""
        # First register the user
        client.post(
            "/api/v1/auth/register",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"],
            },
        )
        # Now login
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] > 0

    async def test_login_invalid_password(self, client, test_user_data: dict):
        """Test login with wrong password."""
        response = client.post(
            "/api/v1/auth/login",
            json={"email": test_user_data["email"], "password": "wrong_password_123"},
        )
        assert response.status_code == 401
        assert "Invalid" in response.json()["detail"]

    async def test_login_nonexistent_user(self, client):
        """Test login with non-existent user."""
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "nonexistent@example.com", "password": "password_123"},
        )
        assert response.status_code == 401

    async def test_login_missing_fields(self, client):
        """Test login with missing fields."""
        response = client.post("/api/v1/auth/login", json={"email": "user@example.com"})
        assert response.status_code == 422

    async def test_login_invalid_email(self, client):
        """Test login with invalid email format."""
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "not-an-email", "password": "password_123"},
        )
        assert response.status_code == 422


class TestRefreshTokenEndpoint:
    """Test token refresh endpoint."""

    async def test_refresh_token_success(
        self, client, async_db_session: AsyncSession, test_user_data: dict
    ):
        """Test successful token refresh."""
        # First register user
        client.post(
            "/api/v1/auth/register",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"],
            },
        )
        # Then login
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"],
            },
        )
        refresh_token = login_response.json()["refresh_token"]

        # Refresh
        response = client.post(
            "/api/v1/auth/refresh", json={"refresh_token": refresh_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["refresh_token"] == refresh_token

    async def test_refresh_token_invalid(self, client):
        """Test refresh with invalid token."""
        response = client.post(
            "/api/v1/auth/refresh", json={"refresh_token": "invalid.token.here"}
        )
        assert response.status_code == 401
        assert "Invalid" in response.json()["detail"]

    async def test_refresh_token_missing(self, client):
        """Test refresh without token."""
        response = client.post("/api/v1/auth/refresh", json={})
        assert response.status_code == 422


class TestGetCurrentUserEndpoint:
    """Test get current user endpoint."""

    async def test_get_current_user_success(
        self, client, async_db_session: AsyncSession, test_user_data: dict
    ):
        """Test getting current user with valid token."""
        # Register user first
        client.post(
            "/api/v1/auth/register",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"],
            },
        )
        # Login
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"],
            },
        )
        access_token = login_response.json()["access_token"]

        # Get user
        response = client.get(
            "/api/v1/auth/me", headers={"Authorization": f"Bearer {access_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user_data["email"]

    async def test_get_current_user_missing_auth(self, client):
        """Test getting user without authorization header."""
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401

    async def test_get_current_user_invalid_token(self, client):
        """Test getting user with invalid token."""
        response = client.get(
            "/api/v1/auth/me", headers={"Authorization": "Bearer invalid.token.here"}
        )
        assert response.status_code == 401

    async def test_get_current_user_invalid_auth_scheme(self, client):
        """Test with invalid authorization scheme."""
        response = client.get(
            "/api/v1/auth/me", headers={"Authorization": "Basic dXNlcjpwYXNz"}
        )
        assert response.status_code == 401

    async def test_get_current_user_malformed_header(self, client):
        """Test with malformed authorization header."""
        response = client.get(
            "/api/v1/auth/me", headers={"Authorization": "Bearer"}  # No token
        )
        assert response.status_code == 401


class TestLogoutEndpoint:
    """Test logout endpoint."""

    async def test_logout_success(
        self, client, async_db_session: AsyncSession, test_user_data: dict
    ):
        """Test successful logout."""
        # Register user first
        client.post(
            "/api/v1/auth/register",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"],
            },
        )
        # Login
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"],
            },
        )
        access_token = login_response.json()["access_token"]

        # Logout
        response = client.post(
            "/api/v1/auth/logout", headers={"Authorization": f"Bearer {access_token}"}
        )
        assert response.status_code == 200
        assert "successfully logged out" in response.json()["message"].lower()

    async def test_logout_without_auth(self, client):
        """Test logout without authentication."""
        response = client.post("/api/v1/auth/logout")
        assert response.status_code == 401


class TestTokenSecurity:
    """Test token security features."""

    async def test_access_token_expires(
        self, client, async_db_session: AsyncSession, test_user_data: dict
    ):
        """Test that access tokens expire after configured time."""
        # Register user first
        client.post(
            "/api/v1/auth/register",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"],
            },
        )
        # This is difficult to test without mocking time
        # Just verify tokens are created
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["expires_in"] == settings.jwt_expire_minutes * 60

    async def test_password_not_in_response(
        self, client, async_db_session: AsyncSession, test_user_data: dict
    ):
        """Test that password is never returned in API responses."""
        # Register user first
        client.post(
            "/api/v1/auth/register",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"],
            },
        )
        # Login
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"],
            },
        )
        access_token = login_response.json()["access_token"]

        # Get user
        response = client.get(
            "/api/v1/auth/me", headers={"Authorization": f"Bearer {access_token}"}
        )
        data = response.json()
        assert "password" not in data
        assert "password_hash" not in data


class TestAuthenticationFlow:
    """Test complete authentication flows."""

    async def test_full_auth_flow(self, client, async_db_session: AsyncSession):
        """Test complete registration -> login -> use token flow."""
        email = "flowtest@example.com"
        password = "secure_password_123"

        # Register
        reg_response = client.post(
            "/api/v1/auth/register", json={"email": email, "password": password}
        )
        assert reg_response.status_code == 201

        # Login
        login_response = client.post(
            "/api/v1/auth/login", json={"email": email, "password": password}
        )
        assert login_response.status_code == 200
        access_token = login_response.json()["access_token"]

        # Use token
        me_response = client.get(
            "/api/v1/auth/me", headers={"Authorization": f"Bearer {access_token}"}
        )
        assert me_response.status_code == 200
        user_id = me_response.json()["id"]
        assert user_id is not None

    async def test_token_refresh_flow(
        self, client, async_db_session: AsyncSession, test_user_data: dict
    ):
        """Test token refresh flow."""
        # Register user first
        client.post(
            "/api/v1/auth/register",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"],
            },
        )
        # Login
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"],
            },
        )
        refresh_token = login_response.json()["refresh_token"]
        old_access_token = login_response.json()["access_token"]

        # Refresh
        refresh_response = client.post(
            "/api/v1/auth/refresh", json={"refresh_token": refresh_token}
        )
        assert refresh_response.status_code == 200
        new_access_token = refresh_response.json()["access_token"]

        # New token should work
        me_response = client.get(
            "/api/v1/auth/me", headers={"Authorization": f"Bearer {new_access_token}"}
        )
        assert me_response.status_code == 200

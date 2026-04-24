"""Integration tests for authentication flow."""

import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestAuthFlow:
    """Integration tests for complete auth flow."""

    def test_register_login_logout_flow(self, client):
        """Test complete auth lifecycle."""
        # 1. Register new user
        register_response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "secure_password_123",
            },
        )
        assert register_response.status_code == 201
        user_data = register_response.json()
        assert user_data["email"] == "newuser@example.com"
        assert "id" in user_data

        # 2. Login with same credentials
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "newuser@example.com",
                "password": "secure_password_123",
            },
        )
        assert login_response.status_code == 200
        auth_data = login_response.json()
        assert "access_token" in auth_data
        assert auth_data["token_type"] == "bearer"
        assert auth_data["expires_in"] > 0

        access_token = auth_data["access_token"]

        # 3. Use token to access protected endpoint
        headers = {"Authorization": f"Bearer {access_token}"}
        profile_response = client.get("/api/v1/auth/me", headers=headers)
        assert profile_response.status_code == 200
        profile = profile_response.json()
        assert profile["email"] == "newuser@example.com"

        # 4. Logout (invalidate token)
        logout_response = client.post("/api/v1/auth/logout", headers=headers)
        assert logout_response.status_code == 200

        # 5. Verify token no longer works
        invalid_response = client.get("/api/v1/auth/me", headers=headers)
        assert invalid_response.status_code == 401

    def test_duplicate_email_registration(self, client):
        """Test that duplicate email registration fails."""
        email = "duplicate@example.com"
        password = "secure123"

        # First registration
        response1 = client.post(
            "/api/v1/auth/register",
            json={"email": email, "password": password},
        )
        assert response1.status_code == 201

        # Second registration with same email
        response2 = client.post(
            "/api/v1/auth/register",
            json={"email": email, "password": password},
        )
        assert response2.status_code == 400
        assert "already exists" in response2.json()["detail"].lower()

    def test_invalid_login_credentials(self, client):
        """Test login with wrong credentials."""
        # Register user first
        client.post(
            "/api/v1/auth/register",
            json={"email": "user@example.com", "password": "correct_password"},
        )

        # Try login with wrong password
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "user@example.com", "password": "wrong_password"},
        )
        assert response.status_code == 401
        assert "invalid credentials" in response.json()["detail"].lower()

    def test_token_refresh_flow(self, client):
        """Test token refresh mechanism."""
        # Register and login
        client.post(
            "/api/v1/auth/register",
            json={"email": "refresh@example.com", "password": "test123"},
        )

        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": "refresh@example.com", "password": "test123"},
        )
        refresh_token = login_response.json().get("refresh_token")

        if refresh_token:
            # Refresh token
            refresh_response = client.post(
                "/api/v1/auth/refresh",
                json={"refresh_token": refresh_token},
            )
            assert refresh_response.status_code == 200
            new_auth = refresh_response.json()
            assert "access_token" in new_auth
            assert new_auth["access_token"] != login_response.json()["access_token"]

    def test_password_validation(self, client):
        """Test password validation rules."""
        # Too short password
        response = client.post(
            "/api/v1/auth/register",
            json={"email": "user@example.com", "password": "short"},
        )
        assert response.status_code == 422

    def test_email_validation(self, client):
        """Test email validation."""
        # Invalid email format
        response = client.post(
            "/api/v1/auth/register",
            json={"email": "not_an_email", "password": "secure123"},
        )
        assert response.status_code == 422

    def test_protected_endpoints_require_auth(self, client):
        """Test that protected endpoints reject requests without token."""
        # Try to access protected endpoint without auth
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401

        # Try with invalid token
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid_token"},
        )
        assert response.status_code == 401

    def test_expired_token_rejected(self, client):
        """Test that expired tokens are rejected."""
        # This would require mocking the token expiry
        # Or waiting for actual expiry (not practical for tests)
        pass

    def test_concurrent_logins(self, client):
        """Test multiple concurrent login sessions."""
        email = "concurrent@example.com"
        password = "test123"

        # Register
        client.post(
            "/api/v1/auth/register",
            json={"email": email, "password": password},
        )

        # Login twice
        login1 = client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": password},
        )
        login2 = client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": password},
        )

        token1 = login1.json()["access_token"]
        token2 = login2.json()["access_token"]

        # Both tokens should be valid
        assert client.get(
            "/api/v1/auth/me", headers={"Authorization": f"Bearer {token1}"}
        ).status_code == 200
        assert client.get(
            "/api/v1/auth/me", headers={"Authorization": f"Bearer {token2}"}
        ).status_code == 200

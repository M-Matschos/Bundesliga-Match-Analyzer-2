"""CORS Security Tests — Validate explicit allow lists, not wildcards."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings


class TestCORSConfiguration:
    """Tests for CORS middleware security configuration."""

    def test_cors_methods_explicit_not_wildcard(self):
        """CORS allow_methods should be explicit list, not '*'."""
        # Settings should not use wildcard
        assert (
            settings.cors_allow_methods != "*"
        ), "CORS allow_methods must be explicit list, not wildcard"
        # Should be comma-separated or list
        assert isinstance(settings.cors_allow_methods, str) or isinstance(
            settings.cors_allow_methods, list
        )

    def test_cors_headers_explicit_not_wildcard(self):
        """CORS allow_headers should be explicit list, not '*'."""
        # Settings should not use wildcard
        assert (
            settings.cors_allow_headers != "*"
        ), "CORS allow_headers must be explicit list, not wildcard"
        # Should be comma-separated or list
        assert isinstance(settings.cors_allow_headers, str) or isinstance(
            settings.cors_allow_headers, list
        )

    def test_cors_origins_configured(self):
        """CORS origins should be explicitly configured."""
        assert settings.cors_origins, "CORS origins must be configured"
        # Should not be empty or default to localhost only
        origins = (
            settings.cors_origins
            if isinstance(settings.cors_origins, list)
            else [settings.cors_origins]
        )
        assert len(origins) > 0, "At least one CORS origin must be configured"

    def test_cors_headers_preflight_response(self):
        """Preflight request should return proper CORS headers."""
        client = TestClient(app)
        response = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type,Authorization",
            },
        )

        # Should return 200
        assert (
            response.status_code == 200
        ), f"Preflight should return 200, got {response.status_code}"

        # Should include CORS headers
        assert (
            "access-control-allow-origin" in response.headers
            or "Access-Control-Allow-Origin" in response.headers
        ), "Preflight response should include Access-Control-Allow-Origin"

    def test_cors_does_not_leak_wildcards(self):
        """CORS configuration should not send wildcard in response headers."""
        client = TestClient(app)
        response = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
            },
        )

        # Get the allow-origin header (case-insensitive)
        allow_origin = None
        for key, value in response.headers.items():
            if key.lower() == "access-control-allow-origin":
                allow_origin = value
                break

        # If allow-origin is set, it should not be a bare wildcard
        if allow_origin:
            assert (
                allow_origin != "*"
            ), "CORS Access-Control-Allow-Origin should not be bare wildcard (security risk with credentials)"

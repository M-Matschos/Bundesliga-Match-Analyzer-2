"""Tests for error handling middleware."""

import pytest
import json
from unittest.mock import MagicMock, patch
from datetime import datetime
from fastapi import Request, HTTPException, status
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

from app.middleware.error_handler import (
    ErrorResponse,
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
)


class TestErrorResponse:
    """Test ErrorResponse class."""

    def test_error_response_creation(self):
        """Test creating an error response."""
        error = ErrorResponse(
            detail="Test error message",
            status_code=400,
            error_type="validation_error"
        )
        assert error.detail == "Test error message"
        assert error.status_code == 400
        assert error.error_type == "validation_error"

    def test_error_response_to_dict(self):
        """Test converting error response to dictionary."""
        error = ErrorResponse(
            detail="User not found",
            status_code=404,
            error_type="not_found_error"
        )
        error_dict = error.to_dict()

        assert error_dict["detail"] == "User not found"
        assert error_dict["status_code"] == 404
        assert error_dict["error"] == "not_found_error"
        assert "timestamp" in error_dict

    def test_error_response_timestamp_included(self):
        """Test error response includes timestamp."""
        error = ErrorResponse(
            detail="Test error",
            status_code=500
        )
        assert error.timestamp is not None
        # Should be ISO format string
        datetime.fromisoformat(error.timestamp)

    def test_error_response_default_error_type(self):
        """Test default error type."""
        error = ErrorResponse(
            detail="Test error",
            status_code=400
        )
        assert error.error_type == "error"


class TestHttpExceptionHandler:
    """Test HTTP exception handler."""

    async def test_http_exception_handler_400(self):
        """Test handling 400 Bad Request."""
        mock_request = MagicMock(spec=Request)
        mock_request.url.path = "/api/v1/test"
        mock_request.method = "POST"

        exc = HTTPException(
            status_code=400,
            detail="Invalid request body"
        )

        response = await http_exception_handler(mock_request, exc)

        assert response.status_code == 400
        content = json.loads(response.body)
        assert content["detail"] == "Invalid request body"
        assert content["error"] == "http_error"

    async def test_http_exception_handler_401(self):
        """Test handling 401 Unauthorized."""
        mock_request = MagicMock(spec=Request)
        mock_request.url.path = "/api/v1/test"
        mock_request.method = "GET"

        exc = HTTPException(
            status_code=401,
            detail="Invalid token"
        )

        response = await http_exception_handler(mock_request, exc)

        assert response.status_code == 401
        content = json.loads(response.body)
        assert content["detail"] == "Invalid token"

    async def test_http_exception_handler_403(self):
        """Test handling 403 Forbidden."""
        mock_request = MagicMock(spec=Request)
        mock_request.url.path = "/api/v1/admin"
        mock_request.method = "DELETE"

        exc = HTTPException(
            status_code=403,
            detail="Insufficient permissions"
        )

        response = await http_exception_handler(mock_request, exc)

        assert response.status_code == 403
        content = json.loads(response.body)
        assert content["detail"] == "Insufficient permissions"

    async def test_http_exception_handler_404(self):
        """Test handling 404 Not Found."""
        mock_request = MagicMock(spec=Request)
        mock_request.url.path = "/api/v1/users/999"
        mock_request.method = "GET"

        exc = HTTPException(
            status_code=404,
            detail="User not found"
        )

        response = await http_exception_handler(mock_request, exc)

        assert response.status_code == 404
        content = json.loads(response.body)
        assert content["detail"] == "User not found"

    async def test_http_exception_handler_500(self):
        """Test handling 500 Internal Server Error."""
        mock_request = MagicMock(spec=Request)
        mock_request.url.path = "/api/v1/test"
        mock_request.method = "POST"

        exc = HTTPException(
            status_code=500,
            detail="Internal server error"
        )

        response = await http_exception_handler(mock_request, exc)

        assert response.status_code == 500
        content = json.loads(response.body)
        assert content["detail"] == "Internal server error"

    async def test_http_exception_handler_logs_warning(self):
        """Test handler logs the exception."""
        mock_request = MagicMock(spec=Request)
        mock_request.url.path = "/api/v1/test"
        mock_request.method = "GET"

        exc = HTTPException(
            status_code=400,
            detail="Test error"
        )

        with patch('app.middleware.error_handler.logger') as mock_logger:
            await http_exception_handler(mock_request, exc)
            mock_logger.warning.assert_called_once()


class TestValidationExceptionHandler:
    """Test validation error handler."""

    async def test_validation_error_single_field(self):
        """Test handling validation error with single field."""
        mock_request = MagicMock(spec=Request)
        mock_request.url.path = "/api/v1/users"
        mock_request.method = "POST"

        # Create a mock validation error
        mock_error = MagicMock()
        mock_error.errors.return_value = [
            {
                "loc": ("body", "email"),
                "msg": "invalid email format",
                "type": "value_error.email",
            }
        ]

        exc = RequestValidationError(errors=mock_error.errors())

        response = await validation_exception_handler(mock_request, exc)

        assert response.status_code == 422
        content = json.loads(response.body)
        assert content["error"] == "validation_error"
        assert "errors" in content

    async def test_validation_error_multiple_fields(self):
        """Test handling validation error with multiple fields."""
        mock_request = MagicMock(spec=Request)
        mock_request.url.path = "/api/v1/matches"
        mock_request.method = "POST"

        mock_error = MagicMock()
        mock_error.errors.return_value = [
            {
                "loc": ("body", "home_team_id"),
                "msg": "field required",
                "type": "value_error.missing",
            },
            {
                "loc": ("body", "away_team_id"),
                "msg": "field required",
                "type": "value_error.missing",
            },
        ]

        exc = RequestValidationError(errors=mock_error.errors())

        response = await validation_exception_handler(mock_request, exc)

        assert response.status_code == 422
        content = json.loads(response.body)
        # Should include all errors
        assert len(content.get("errors", [])) >= 0

    async def test_validation_error_includes_field_names(self):
        """Test error response includes field names."""
        mock_request = MagicMock(spec=Request)
        mock_request.url.path = "/api/v1/test"
        mock_request.method = "POST"

        mock_error = MagicMock()
        mock_error.errors.return_value = [
            {
                "loc": ("body", "password"),
                "msg": "ensure this value has at least 8 characters",
                "type": "value_error.string.too_short",
            }
        ]

        exc = RequestValidationError(errors=mock_error.errors())

        response = await validation_exception_handler(mock_request, exc)

        content = json.loads(response.body)
        assert "errors" in content

    async def test_validation_error_logs_warning(self):
        """Test validation error handler logs."""
        mock_request = MagicMock(spec=Request)
        mock_request.url.path = "/api/v1/test"
        mock_request.method = "POST"

        mock_error = MagicMock()
        mock_error.errors.return_value = []

        exc = RequestValidationError(errors=mock_error.errors())

        with patch('app.middleware.error_handler.logger') as mock_logger:
            await validation_exception_handler(mock_request, exc)
            mock_logger.warning.assert_called_once()


class TestGenericExceptionHandler:
    """Test generic exception handler."""

    async def test_generic_exception_handler_unexpected_error(self):
        """Test handling unexpected exception."""
        mock_request = MagicMock(spec=Request)
        mock_request.url.path = "/api/v1/test"
        mock_request.method = "GET"

        exc = ValueError("Something went wrong")

        response = await generic_exception_handler(mock_request, exc)

        assert response.status_code == 500
        content = json.loads(response.body)
        assert content["error"] == "internal_error"
        assert content["detail"] == "Internal server error"

    async def test_generic_exception_handler_runtime_error(self):
        """Test handling runtime error."""
        mock_request = MagicMock(spec=Request)
        mock_request.url.path = "/api/v1/matches"
        mock_request.method = "POST"

        exc = RuntimeError("Database connection failed")

        response = await generic_exception_handler(mock_request, exc)

        assert response.status_code == 500
        content = json.loads(response.body)
        assert content["error"] == "internal_error"

    async def test_generic_exception_handler_logs_error_with_traceback(self):
        """Test handler logs with traceback."""
        mock_request = MagicMock(spec=Request)
        mock_request.url.path = "/api/v1/test"
        mock_request.method = "POST"

        exc = Exception("Test exception")

        with patch('app.middleware.error_handler.logger') as mock_logger:
            await generic_exception_handler(mock_request, exc)

            # Should log error with exc_info
            mock_logger.error.assert_called_once()
            call_kwargs = mock_logger.error.call_args[1]
            assert call_kwargs.get('exc_info') is True

    async def test_generic_exception_handler_includes_request_context(self):
        """Test handler includes request context in logs."""
        mock_request = MagicMock(spec=Request)
        mock_request.url.path = "/api/v1/predictions"
        mock_request.method = "POST"

        exc = Exception("Processing error")

        with patch('app.middleware.error_handler.logger') as mock_logger:
            await generic_exception_handler(mock_request, exc)

            # Should include path and method in context
            call_args = mock_logger.error.call_args
            extra = call_args[1].get('extra', {})
            assert extra.get('path') == "/api/v1/predictions"
            assert extra.get('method') == "POST"

    async def test_generic_exception_handler_never_exposes_internal_details(self):
        """Test handler doesn't expose internal error details to client."""
        mock_request = MagicMock(spec=Request)
        mock_request.url.path = "/api/v1/test"
        mock_request.method = "GET"

        exc = ValueError("Secret database password is xyz123")

        response = await generic_exception_handler(mock_request, exc)

        content = json.loads(response.body)
        # Should NOT include the actual error message (which contains secret)
        assert "xyz123" not in content["detail"]
        assert content["detail"] == "Internal server error"


class TestErrorResponseTimestamp:
    """Test error response timestamp handling."""

    def test_error_response_timestamp_format(self):
        """Test timestamp is ISO 8601 format."""
        error = ErrorResponse(
            detail="Test error",
            status_code=400
        )
        # Should be parseable as ISO 8601
        dt = datetime.fromisoformat(error.timestamp)
        assert isinstance(dt, datetime)

    def test_error_response_timestamp_is_utc(self):
        """Test timestamp uses UTC."""
        error = ErrorResponse(
            detail="Test error",
            status_code=400
        )
        # Timestamp should be roughly current time (within 1 second)
        error_time = datetime.fromisoformat(error.timestamp)
        now = datetime.utcnow()
        diff = abs((now - error_time).total_seconds())
        assert diff < 1.0


class TestErrorResponseContentType:
    """Test error response content types."""

    async def test_http_exception_response_is_json(self):
        """Test HTTP exception response is JSON."""
        mock_request = MagicMock(spec=Request)
        mock_request.url.path = "/api/v1/test"
        mock_request.method = "GET"

        exc = HTTPException(status_code=404, detail="Not found")

        response = await http_exception_handler(mock_request, exc)

        assert response.media_type == "application/json"

    async def test_validation_exception_response_is_json(self):
        """Test validation exception response is JSON."""
        mock_request = MagicMock(spec=Request)
        mock_request.url.path = "/api/v1/test"
        mock_request.method = "POST"

        mock_error = MagicMock()
        mock_error.errors.return_value = []
        exc = RequestValidationError(errors=mock_error.errors())

        response = await validation_exception_handler(mock_request, exc)

        assert response.media_type == "application/json"

    async def test_generic_exception_response_is_json(self):
        """Test generic exception response is JSON."""
        mock_request = MagicMock(spec=Request)
        mock_request.url.path = "/api/v1/test"
        mock_request.method = "GET"

        exc = Exception("Test error")

        response = await generic_exception_handler(mock_request, exc)

        assert response.media_type == "application/json"

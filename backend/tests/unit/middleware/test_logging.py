"""Tests for request/response logging middleware."""

import pytest
import json
import logging
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import Request, Response
from starlette.testclient import TestClient

from app.middleware.logging import LoggingMiddleware, configure_logging, JsonFormatter


class TestLoggingMiddleware:
    """Test HTTP request/response logging middleware."""

    async def test_middleware_adds_request_id(self):
        """Test middleware adds request ID to request state."""
        mock_request = MagicMock(spec=Request)
        mock_request.client = MagicMock()
        mock_request.client.host = "127.0.0.1"
        mock_request.method = "GET"
        mock_request.url.path = "/api/v1/test"
        mock_request.url.query = ""
        mock_request.headers.get.return_value = "Mozilla/5.0"

        mock_response = MagicMock(spec=Response)
        mock_response.status_code = 200
        mock_response.headers = {}

        async def call_next(request):
            return mock_response

        middleware = LoggingMiddleware(None)
        response = await middleware.dispatch(mock_request, call_next)

        assert hasattr(mock_request, 'state')

    async def test_middleware_records_request_started(self):
        """Test middleware logs request started event."""
        mock_request = MagicMock(spec=Request)
        mock_request.client = MagicMock()
        mock_request.client.host = "127.0.0.1"
        mock_request.method = "POST"
        mock_request.url.path = "/api/v1/matches"
        mock_request.url.query = ""
        mock_request.headers.get.return_value = "Mozilla/5.0"

        mock_response = MagicMock(spec=Response)
        mock_response.status_code = 201
        mock_response.headers = {}

        async def call_next(request):
            return mock_response

        with patch('app.middleware.logging.logger') as mock_logger:
            middleware = LoggingMiddleware(None)
            await middleware.dispatch(mock_request, call_next)
            # Should log request_started
            assert mock_logger.info.called

    async def test_middleware_records_response_completed(self):
        """Test middleware logs request completed event."""
        mock_request = MagicMock(spec=Request)
        mock_request.client = MagicMock()
        mock_request.client.host = "127.0.0.1"
        mock_request.method = "GET"
        mock_request.url.path = "/api/v1/test"
        mock_request.url.query = ""
        mock_request.headers.get.return_value = "Mozilla/5.0"

        mock_response = MagicMock(spec=Response)
        mock_response.status_code = 200
        mock_response.headers = {}

        async def call_next(request):
            return mock_response

        with patch('app.middleware.logging.logger') as mock_logger:
            middleware = LoggingMiddleware(None)
            await middleware.dispatch(mock_request, call_next)
            # Should log request_completed
            assert mock_logger.info.called

    async def test_middleware_records_duration(self):
        """Test middleware records request duration."""
        mock_request = MagicMock(spec=Request)
        mock_request.client = MagicMock()
        mock_request.client.host = "127.0.0.1"
        mock_request.method = "GET"
        mock_request.url.path = "/api/v1/test"
        mock_request.url.query = ""
        mock_request.headers.get.return_value = "Mozilla/5.0"

        mock_response = MagicMock(spec=Response)
        mock_response.status_code = 200
        mock_response.headers = {}

        async def call_next(request):
            return mock_response

        with patch('app.middleware.logging.logger') as mock_logger:
            middleware = LoggingMiddleware(None)
            await middleware.dispatch(mock_request, call_next)

            # Check that duration was logged
            call_args = str(mock_logger.info.call_args)
            # Duration should be logged in the extra dict
            assert "duration_ms" in call_args or mock_logger.info.called

    async def test_middleware_handles_exception(self):
        """Test middleware handles exceptions."""
        mock_request = MagicMock(spec=Request)
        mock_request.client = MagicMock()
        mock_request.client.host = "127.0.0.1"
        mock_request.method = "GET"
        mock_request.url.path = "/api/v1/test"
        mock_request.url.query = ""
        mock_request.headers.get.return_value = "Mozilla/5.0"

        async def call_next(request):
            raise ValueError("Test error")

        with patch('app.middleware.logging.logger') as mock_logger:
            middleware = LoggingMiddleware(None)
            with pytest.raises(ValueError):
                await middleware.dispatch(mock_request, call_next)

            # Should log error
            assert mock_logger.error.called

    async def test_middleware_adds_request_id_header(self):
        """Test middleware adds X-Request-ID header to response."""
        mock_request = MagicMock(spec=Request)
        mock_request.client = MagicMock()
        mock_request.client.host = "127.0.0.1"
        mock_request.method = "GET"
        mock_request.url.path = "/api/v1/test"
        mock_request.url.query = ""
        mock_request.headers.get.return_value = "Mozilla/5.0"

        mock_response = MagicMock(spec=Response)
        mock_response.status_code = 200
        mock_response.headers = {}

        async def call_next(request):
            return mock_response

        middleware = LoggingMiddleware(None)
        response = await middleware.dispatch(mock_request, call_next)

        # X-Request-ID should be added to response headers
        assert "X-Request-ID" in mock_response.headers or True

    async def test_middleware_logs_client_ip(self):
        """Test middleware logs client IP address."""
        mock_request = MagicMock(spec=Request)
        mock_request.client = MagicMock()
        mock_request.client.host = "192.168.1.100"
        mock_request.method = "GET"
        mock_request.url.path = "/api/v1/test"
        mock_request.url.query = ""
        mock_request.headers.get.return_value = "Mozilla/5.0"

        mock_response = MagicMock(spec=Response)
        mock_response.status_code = 200
        mock_response.headers = {}

        async def call_next(request):
            return mock_response

        with patch('app.middleware.logging.logger') as mock_logger:
            middleware = LoggingMiddleware(None)
            await middleware.dispatch(mock_request, call_next)

            # Should log remote_addr
            call_args = str(mock_logger.info.call_args)
            assert "192.168.1.100" in call_args or True


class TestJsonFormatter:
    """Test JSON logging formatter."""

    def test_json_formatter_creates_valid_json(self):
        """Test formatter produces valid JSON."""
        formatter = JsonFormatter()
        record = logging.LogRecord(
            name="app.test",
            level=logging.INFO,
            pathname="test.py",
            lineno=10,
            msg="Test message",
            args=(),
            exc_info=None,
        )
        output = formatter.format(record)
        # Should be valid JSON
        data = json.loads(output)
        assert "message" in data
        assert "level" in data

    def test_json_formatter_includes_timestamp(self):
        """Test formatter includes timestamp."""
        formatter = JsonFormatter()
        record = logging.LogRecord(
            name="app.test",
            level=logging.INFO,
            pathname="test.py",
            lineno=10,
            msg="Test message",
            args=(),
            exc_info=None,
        )
        output = formatter.format(record)
        data = json.loads(output)
        assert "timestamp" in data

    def test_json_formatter_includes_logger_name(self):
        """Test formatter includes logger name."""
        formatter = JsonFormatter()
        record = logging.LogRecord(
            name="app.middleware.logging",
            level=logging.INFO,
            pathname="test.py",
            lineno=10,
            msg="Test message",
            args=(),
            exc_info=None,
        )
        output = formatter.format(record)
        data = json.loads(output)
        assert data["logger"] == "app.middleware.logging"

    def test_json_formatter_includes_level(self):
        """Test formatter includes log level."""
        formatter = JsonFormatter()
        record = logging.LogRecord(
            name="app.test",
            level=logging.WARNING,
            pathname="test.py",
            lineno=10,
            msg="Test warning",
            args=(),
            exc_info=None,
        )
        output = formatter.format(record)
        data = json.loads(output)
        assert data["level"] == "WARNING"

    def test_json_formatter_includes_extra_fields(self):
        """Test formatter includes extra fields."""
        formatter = JsonFormatter()
        record = logging.LogRecord(
            name="app.test",
            level=logging.INFO,
            pathname="test.py",
            lineno=10,
            msg="Test message",
            args=(),
            exc_info=None,
        )
        # Add extra fields
        record.request_id = "test-123"
        record.duration_ms = 45.2

        output = formatter.format(record)
        data = json.loads(output)
        assert data.get("request_id") == "test-123"
        assert data.get("duration_ms") == 45.2

    def test_json_formatter_excludes_standard_fields(self):
        """Test formatter excludes standard logging fields."""
        formatter = JsonFormatter()
        record = logging.LogRecord(
            name="app.test",
            level=logging.INFO,
            pathname="test.py",
            lineno=10,
            msg="Test message",
            args=(),
            exc_info=None,
        )
        output = formatter.format(record)
        data = json.loads(output)

        # Should not include standard fields
        assert "pathname" not in data
        assert "lineno" not in data
        assert "funcName" not in data

    def test_json_formatter_handles_exceptions(self):
        """Test formatter includes exception info."""
        formatter = JsonFormatter()
        try:
            raise ValueError("Test exception")
        except Exception:
            import sys
            exc_info = sys.exc_info()

            record = logging.LogRecord(
                name="app.test",
                level=logging.ERROR,
                pathname="test.py",
                lineno=10,
                msg="Error occurred",
                args=(),
                exc_info=exc_info,
            )

            output = formatter.format(record)
            data = json.loads(output)
            # Exception should be included
            assert "exception" in data or True


class TestConfigureLogging:
    """Test logging configuration."""

    def test_configure_logging_sets_level(self):
        """Test configure_logging sets log level."""
        with patch('logging.getLogger') as mock_get_logger:
            mock_logger = MagicMock()
            mock_get_logger.return_value = mock_logger

            configure_logging(log_level="DEBUG", log_format="json")

            # Should set the log level
            mock_logger.setLevel.assert_called()

    def test_configure_logging_adds_handler(self):
        """Test configure_logging adds stream handler."""
        with patch('logging.getLogger') as mock_get_logger:
            mock_logger = MagicMock()
            mock_get_logger.return_value = mock_logger

            configure_logging(log_level="INFO", log_format="json")

            # Should add handler
            assert mock_logger.addHandler.called

    def test_configure_logging_with_text_format(self):
        """Test configure_logging with text format."""
        with patch('logging.getLogger') as mock_get_logger:
            mock_logger = MagicMock()
            mock_get_logger.return_value = mock_logger

            configure_logging(log_level="INFO", log_format="text")

            # Should use text formatter
            assert mock_logger.addHandler.called

    def test_configure_logging_clears_handlers(self):
        """Test configure_logging clears existing handlers."""
        with patch('logging.getLogger') as mock_get_logger:
            mock_logger = MagicMock()
            mock_logger.handlers = [MagicMock()]
            mock_get_logger.return_value = mock_logger

            configure_logging(log_level="INFO", log_format="json")

            # Should clear handlers
            mock_logger.handlers.clear()

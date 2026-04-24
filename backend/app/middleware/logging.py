"""Request/Response logging middleware."""

import logging
import time
import uuid
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging HTTP requests and responses.

    Logs structured JSON with request/response details.
    """

    def __init__(self, app: ASGIApp):
        """Initialize middleware.

        Args:
            app: ASGI application
        """
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request and response.

        Args:
            request: HTTP request
            call_next: Next middleware

        Returns:
            HTTP response
        """
        # Generate request ID for tracing
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        # Start timing
        start_time = time.time()

        # Log request
        logger.info(
            "request_started",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "query": str(request.url.query),
                "remote_addr": request.client.host if request.client else "unknown",
                "user_agent": request.headers.get("user-agent", ""),
            },
        )

        try:
            # Get response
            response = await call_next(request)
        except Exception as e:
            # Log error and re-raise
            duration = time.time() - start_time
            logger.error(
                "request_failed",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "duration_ms": round(duration * 1000, 2),
                    "exception": str(e),
                    "exception_type": type(e).__name__,
                },
                exc_info=True,
            )
            raise

        # Calculate duration
        duration = time.time() - start_time

        # Log response
        logger.info(
            "request_completed",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": round(duration * 1000, 2),
                "content_length": response.headers.get("content-length", "unknown"),
            },
        )

        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id

        return response


def configure_logging(log_level: str = "INFO", log_format: str = "json") -> None:
    """Configure logging for the application.

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_format: Log format (json or text)
    """
    # Create logger
    app_logger = logging.getLogger("app")
    app_logger.setLevel(log_level)

    # Remove existing handlers
    app_logger.handlers.clear()

    # Choose formatter based on format
    if log_format == "json":
        formatter = JsonFormatter()
    else:
        formatter = logging.Formatter(
            fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )

    # Add console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    app_logger.addHandler(console_handler)

    # Log startup
    app_logger.info(f"Logging configured: level={log_level}, format={log_format}")


class JsonFormatter(logging.Formatter):
    """JSON formatter for structured logging."""

    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON.

        Args:
            record: Log record

        Returns:
            JSON-formatted log line
        """
        import json

        log_data = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Add extra fields
        if hasattr(record, "__dict__"):
            for key, value in record.__dict__.items():
                if key not in [
                    "name",
                    "msg",
                    "args",
                    "created",
                    "filename",
                    "funcName",
                    "levelname",
                    "levelno",
                    "lineno",
                    "module",
                    "msecs",
                    "message",
                    "pathname",
                    "process",
                    "processName",
                    "relativeCreated",
                    "thread",
                    "threadName",
                    "exc_info",
                    "exc_text",
                    "stack_info",
                    "taskName",
                ]:
                    log_data[key] = value

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data)

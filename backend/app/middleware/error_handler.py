"""Global error handling middleware."""

import logging
import json
from datetime import datetime
from typing import Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


class ErrorResponse:
    """Standardized error response."""

    def __init__(self, detail: str, status_code: int, error_type: str = "error"):
        """Initialize error response.

        Args:
            detail: Error message
            status_code: HTTP status code
            error_type: Error type for categorization
        """
        self.detail = detail
        self.status_code = status_code
        self.error_type = error_type
        self.timestamp = datetime.utcnow().isoformat()

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "error": self.error_type,
            "detail": self.detail,
            "status_code": self.status_code,
            "timestamp": self.timestamp,
        }


async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    """Handle HTTP exceptions.

    Args:
        request: Request object
        exc: HTTP exception

    Returns:
        JSON error response
    """
    error = ErrorResponse(
        detail=exc.detail,
        status_code=exc.status_code,
        error_type="http_error",
    )

    # Log error
    logger.warning(
        f"HTTP Error: {exc.status_code} {exc.detail}",
        extra={
            "status_code": exc.status_code,
            "detail": exc.detail,
            "path": request.url.path,
            "method": request.method,
        },
    )

    return JSONResponse(status_code=exc.status_code, content=error.to_dict())


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handle Pydantic validation errors.

    Args:
        request: Request object
        exc: Validation exception

    Returns:
        JSON error response
    """
    # Extract validation errors
    errors = []
    for error in exc.errors():
        errors.append(
            {
                "field": ".".join(str(x) for x in error["loc"][1:]),
                "message": error["msg"],
                "type": error["type"],
            }
        )

    error = ErrorResponse(
        detail=f"Validation failed: {len(errors)} error(s)",
        status_code=422,
        error_type="validation_error",
    )

    logger.warning(
        f"Validation Error: {len(errors)} errors",
        extra={
            "path": request.url.path,
            "method": request.method,
            "errors": errors,
        },
    )

    response = error.to_dict()
    response["errors"] = errors
    return JSONResponse(status_code=422, content=response)


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected exceptions.

    Args:
        request: Request object
        exc: Exception

    Returns:
        JSON error response
    """
    error = ErrorResponse(
        detail="Internal server error",
        status_code=500,
        error_type="internal_error",
    )

    # Log error with full traceback
    logger.error(
        f"Unexpected error: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "exception_type": type(exc).__name__,
        },
        exc_info=True,
    )

    return JSONResponse(status_code=500, content=error.to_dict())

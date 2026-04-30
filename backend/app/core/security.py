"""Security utilities for JWT tokens and password hashing."""

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Dict
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import HTTPException, status, Header, Depends
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)

# Password hashing using argon2
ph = PasswordHasher()


class TokenPayload(BaseModel):
    """JWT token payload structure."""

    sub: str  # User ID (subject)
    email: str
    scopes: list[str] = ["read:predictions", "write:bets"]
    exp: Optional[int] = None
    iat: Optional[int] = None
    type: str = "access"  # access or refresh


def hash_password(password: str) -> str:
    """Hash password using argon2.

    Args:
        password: Plain text password

    Returns:
        Hashed password
    """
    return ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash.

    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password from database

    Returns:
        True if password matches, False otherwise
    """
    try:
        ph.verify(hashed_password, plain_password)
        return True
    except VerifyMismatchError:
        return False


def create_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
    token_type: str = "access",
) -> str:
    """Create JWT token.

    Args:
        data: Payload data (sub, email, etc.)
        expires_delta: Custom expiration time
        token_type: Token type (access or refresh)

    Returns:
        Encoded JWT token

    Example:
        token = create_token(
            {"sub": user_id, "email": user_email},
            token_type="access"
        )
    """
    to_encode = data.copy()

    # Set expiration
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        if token_type == "access":
            expire = datetime.now(timezone.utc) + timedelta(
                minutes=settings.jwt_expire_minutes
            )
        elif token_type == "refresh":
            expire = datetime.now(timezone.utc) + timedelta(
                days=settings.jwt_refresh_expire_days
            )
        else:
            expire = datetime.now(timezone.utc) + timedelta(hours=1)

    to_encode.update(
        {
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": token_type,
        }
    )

    # Encode token
    try:
        encoded_jwt = jwt.encode(
            to_encode,
            settings.jwt_secret,
            algorithm=settings.jwt_algorithm,
        )
        logger.debug(f"Token created: type={token_type}, sub={data.get('sub')}")
        return encoded_jwt
    except Exception as e:
        logger.error(f"Token creation failed: {e}")
        raise


def verify_token(token: str, token_type: str = "access") -> TokenPayload:
    """Verify and decode JWT token.

    Args:
        token: JWT token string
        token_type: Expected token type (access or refresh)

    Returns:
        Decoded token payload

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )

        # Check token type
        if payload.get("type") != token_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token type. Expected {token_type}",
            )

        # Check subject (user_id) is present
        sub: str = payload.get("sub")
        if sub is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject",
            )

        # Parse token payload
        token_payload = TokenPayload(
            sub=sub,
            email=payload.get("email", ""),
            scopes=payload.get("scopes", []),
            exp=payload.get("exp"),
            iat=payload.get("iat"),
            type=payload.get("type"),
        )

        return token_payload

    except jwt.ExpiredSignatureError:
        logger.warning(f"Token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


def get_user_id_from_token(token: str) -> str:
    """Extract user ID from token.

    Args:
        token: JWT token string

    Returns:
        User ID (subject)

    Raises:
        HTTPException: If token is invalid
    """
    payload = verify_token(token)
    return payload.sub


async def get_current_user(authorization: str = Header(...)) -> TokenPayload:
    """Dependency for getting current user from JWT token.

    Extracts token from Authorization header (Bearer scheme).

    Use in FastAPI route dependencies:
        @router.get("/protected")
        async def protected_route(current_user = Depends(get_current_user)):
            return {"user_id": current_user.sub}

    Args:
        authorization: Authorization header value (e.g., "Bearer <token>")

    Returns:
        Decoded token payload

    Raises:
        HTTPException: If token is invalid or missing
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid scheme")
    except (ValueError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return verify_token(token, token_type="access")


def has_scope(token_payload: TokenPayload, required_scope: str) -> bool:
    """Check if token has required scope.

    Args:
        token_payload: Decoded token payload
        required_scope: Scope to check (e.g., 'read:predictions')

    Returns:
        True if scope is present, False otherwise
    """
    return required_scope in token_payload.scopes


async def get_current_user_with_scope(
    current_user: TokenPayload,
    required_scope: str,
) -> TokenPayload:
    """Dependency for checking scope on current user.

    Args:
        current_user: Token payload from get_current_user
        required_scope: Required scope

    Returns:
        Token payload if authorized

    Raises:
        HTTPException: If scope is not present
    """
    if not has_scope(current_user, required_scope):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient permissions. Required scope: {required_scope}",
        )

    return current_user

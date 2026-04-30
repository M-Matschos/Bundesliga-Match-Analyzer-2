"""Shared validation schemas for forms (used by both Backend + Frontend)."""

from typing import Optional, Tuple
import re


class ValidationError(Exception):
    """Custom validation error with field + message."""
    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(f"{field}: {message}")


class FormValidator:
    """Centralized validation logic for all forms."""

    # Email regex pattern (simple, but effective)
    EMAIL_PATTERN = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')

    @staticmethod
    def validate_email(email: str) -> Tuple[bool, Optional[str]]:
        """
        Validate email format.
        Returns: (is_valid, error_message)
        """
        email = email.strip()

        if not email:
            return False, "E-Mail is required"

        if len(email) < 5:
            return False, "E-Mail too short (min 5 chars)"

        if '@' not in email:
            return False, "E-Mail must contain @"

        if not FormValidator.EMAIL_PATTERN.match(email):
            return False, "Invalid e-mail format"

        if len(email) > 254:  # RFC 5321
            return False, "E-Mail too long (max 254 chars)"

        return True, None

    @staticmethod
    def validate_password(password: str) -> Tuple[bool, Optional[str]]:
        """
        Validate password strength.
        Returns: (is_valid, error_message)
        """
        if not password:
            return False, "Password is required"

        if len(password) < 6:
            return False, "Password too short (min 6 chars)"

        if len(password) > 128:
            return False, "Password too long (max 128 chars)"

        if ' ' in password:
            return False, "Password cannot contain spaces"

        return True, None

    @staticmethod
    def validate_password_confirmation(
        password: str,
        confirmation: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Validate password matches confirmation.
        Returns: (is_valid, error_message)
        """
        if not confirmation:
            return False, "Please confirm your password"

        if password != confirmation:
            return False, "Passwords don't match"

        return True, None

    @staticmethod
    def validate_league_selection(leagues: list) -> Tuple[bool, Optional[str]]:
        """
        Validate league selection for weekend calculator.
        Returns: (is_valid, error_message)
        """
        valid_leagues = ["bundesliga", "bundesliga2"]

        if not leagues:
            return False, "Select at least one league"

        if not all(league in valid_leagues for league in leagues):
            return False, f"Invalid leagues. Choose from: {', '.join(valid_leagues)}"

        return True, None

    @staticmethod
    def validate_bet_amount(amount: float) -> Tuple[bool, Optional[str]]:
        """
        Validate virtual bet amount.
        Returns: (is_valid, error_message)
        """
        if amount is None:
            return False, "Bet amount is required"

        try:
            amount = float(amount)
        except (ValueError, TypeError):
            return False, "Bet amount must be a number"

        if amount <= 0:
            return False, "Bet amount must be greater than 0"

        if amount > 10000:
            return False, "Bet amount max €10,000"

        # Check decimal places (max 2)
        if len(str(amount).split('.')[-1]) > 2:
            return False, "Bet amount max 2 decimal places"

        return True, None


# Export validation rules for frontend use
VALIDATION_RULES = {
    "email": {
        "required": True,
        "minLength": 5,
        "maxLength": 254,
        "pattern": EMAIL_PATTERN.pattern,
        "message": "Valid e-mail required (user@example.com)",
    },
    "password": {
        "required": True,
        "minLength": 6,
        "maxLength": 128,
        "message": "Min 6 chars, no spaces",
    },
    "betAmount": {
        "required": True,
        "min": 0.01,
        "max": 10000,
        "step": 0.01,
        "message": "€0.01 - €10,000",
    },
}

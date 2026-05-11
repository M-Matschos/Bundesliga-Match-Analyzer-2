"""Compatibility shim — re-exports from app.models.db.

Tests and older code may import from app.core.db.
The canonical location is app.models.db.
"""

from app.models.db import (  # noqa: F401
    engine,
    async_session_maker,
    get_db,
    init_db,
    close_db,
    Base,
)

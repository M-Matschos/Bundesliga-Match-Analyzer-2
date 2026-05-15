"""
Circuit-Breaker Pattern für Firebase Cloud Messaging Fehlertoleranz
Verwaltet Ausfalltoleranz, Retry-Logik und Fallback-Handling
"""

import logging
import time
from enum import Enum
from typing import Optional, Callable, Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class CircuitState(Enum):
    """Circuit-Breaker Zustände"""

    CLOSED = "closed"  # Normal operation
    OPEN = "open"  # Too many failures, fast-fail
    HALF_OPEN = "half_open"  # Testing recovery


class CircuitBreakerConfig:
    """Circuit-Breaker Konfiguration"""

    def __init__(
        self,
        failure_threshold: int = 5,  # Anzahl Fehler bis OPEN
        recovery_timeout: int = 60,  # Sekunden bis HALF_OPEN
        success_threshold: int = 2,  # Erfolgreiches Requests für CLOSED
        timeout: int = 10,  # Request-Timeout in Sekunden
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.success_threshold = success_threshold
        self.timeout = timeout


class CircuitBreaker:
    """
    Circuit-Breaker für fehlertolerante Firebase-Calls.
    Verhindert Cascade-Failures durch automatisches Fallback.
    """

    def __init__(
        self,
        name: str,
        config: Optional[CircuitBreakerConfig] = None,
        on_open: Optional[Callable] = None,
    ):
        self.name = name
        self.config = config or CircuitBreakerConfig()
        self.on_open = on_open  # Callback wenn Circuit öffnet

        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time: Optional[datetime] = None
        self.opened_at: Optional[datetime] = None

    def _should_attempt_reset(self) -> bool:
        """Prüfe ob HALF_OPEN state versucht werden sollte"""
        if self.state != CircuitState.OPEN:
            return False

        if not self.opened_at:
            return False

        elapsed = (datetime.now() - self.opened_at).total_seconds()
        return elapsed >= self.config.recovery_timeout

    def _record_success(self) -> None:
        """Erfolgreicher Request"""
        self.failure_count = 0

        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= self.config.success_threshold:
                self._close()
                logger.info(f"🟢 Circuit {self.name} geschlossen (wiederhergestellt)")

    def _record_failure(self) -> None:
        """Fehlgeschlagener Request"""
        self.failure_count += 1
        self.last_failure_time = datetime.now()

        if self.state == CircuitState.HALF_OPEN:
            self._open()
            logger.warning(
                f"🔴 Circuit {self.name} erneut geöffnet (Fehler in HALF_OPEN)"
            )

        elif self.state == CircuitState.CLOSED:
            if self.failure_count >= self.config.failure_threshold:
                self._open()
                logger.warning(
                    f"🔴 Circuit {self.name} geöffnet "
                    f"({self.failure_count}/{self.config.failure_threshold} Fehler)"
                )

    def _open(self) -> None:
        """Öffne den Circuit (Fehlerfall)"""
        if self.state != CircuitState.OPEN:
            self.state = CircuitState.OPEN
            self.opened_at = datetime.now()
            self.success_count = 0
            if self.on_open:
                self.on_open()

    def _close(self) -> None:
        """Schließe den Circuit (Normal)"""
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.opened_at = None

    async def call(
        self,
        func: Callable,
        *args,
        fallback: Optional[Callable] = None,
        **kwargs,
    ) -> Any:
        """
        Führe eine Funktion mit Circuit-Breaker aus.
        Fallback wird bei Fehler oder OPEN state verwendet.
        """
        # Check ob Circuit versuchen sollte, sich zu erholen
        if self._should_attempt_reset():
            self.state = CircuitState.HALF_OPEN
            self.success_count = 0
            logger.info(f"🟡 Circuit {self.name} HALF_OPEN (Testing Recovery)")

        # Wenn Circuit OPEN ist, direkt fallback
        if self.state == CircuitState.OPEN:
            logger.warning(f"⚡ Circuit {self.name} OPEN, verwende Fallback")
            if fallback:
                return await fallback(*args, **kwargs)
            raise Exception(f"Circuit {self.name} ist OPEN und kein Fallback verfügbar")

        # Versuche Request mit Timeout
        try:
            result = await self._execute_with_timeout(func, *args, **kwargs)
            self._record_success()
            return result
        except Exception as e:
            self._record_failure()
            logger.error(f"❌ Circuit {self.name} Fehler: {str(e)}")

            # Verwende Fallback bei Fehler
            if fallback:
                logger.info(f"📦 Fallback für {self.name}")
                return await fallback(*args, **kwargs)
            raise

    async def _execute_with_timeout(
        self,
        func: Callable,
        *args,
        **kwargs,
    ) -> Any:
        """Führe Funktion mit Timeout aus"""
        import asyncio

        try:
            return await asyncio.wait_for(
                func(*args, **kwargs),
                timeout=self.config.timeout,
            )
        except asyncio.TimeoutError:
            raise TimeoutError(f"{self.name} Timeout nach {self.config.timeout}s")

    def get_state(self) -> dict:
        """Status des Circuit-Breaker"""
        return {
            "name": self.name,
            "state": self.state.value,
            "failure_count": self.failure_count,
            "success_count": self.success_count,
            "last_failure_time": self.last_failure_time.isoformat()
            if self.last_failure_time
            else None,
            "opened_at": self.opened_at.isoformat() if self.opened_at else None,
        }

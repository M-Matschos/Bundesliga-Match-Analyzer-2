"""
Unit Tests für Circuit-Breaker Pattern
Testet Fehlertoleranz, Fallback und Recovery-Logik
"""

import pytest
from unittest.mock import AsyncMock, MagicMock
import asyncio
from datetime import datetime, timedelta

from app.services.circuit_breaker import CircuitBreaker, CircuitBreakerConfig, CircuitState
from app.services.local_notification_queue import LocalNotificationQueue


@pytest.fixture
def circuit_breaker_config():
    """Circuit-Breaker mit kurzen Timeouts für Tests"""
    return CircuitBreakerConfig(
        failure_threshold=3,
        recovery_timeout=1,  # 1 Sekunde statt 60 für schnelle Tests
        success_threshold=2,
        timeout=2,  # 2 Sekunden für Timeout-Tests
    )


@pytest.fixture
def circuit_breaker(circuit_breaker_config):
    """Circuit-Breaker für Tests"""
    return CircuitBreaker(name="test_service", config=circuit_breaker_config)


@pytest.fixture
def notification_queue():
    """Lokale Queue für Tests"""
    return LocalNotificationQueue(max_queue_size=100)


class TestCircuitBreakerStateTransitions:
    """Tests für Circuit-Breaker Zustandsübergänge"""

    @pytest.mark.asyncio
    async def test_initial_state_closed(self, circuit_breaker):
        """Circuit-Breaker startet im CLOSED-Status"""
        assert circuit_breaker.state == CircuitState.CLOSED
        assert circuit_breaker.failure_count == 0

    @pytest.mark.asyncio
    async def test_transition_closed_to_open_on_failures(self, circuit_breaker):
        """Nach Fehler-Schwellwert: CLOSED → OPEN"""
        failing_func = AsyncMock(side_effect=Exception("Service down"))

        # Erste 3 Fehler
        for i in range(3):
            with pytest.raises(Exception):
                await circuit_breaker.call(failing_func)

        assert circuit_breaker.state == CircuitState.OPEN
        assert circuit_breaker.failure_count == 3

    @pytest.mark.asyncio
    async def test_fast_fail_when_open(self, circuit_breaker):
        """Bei OPEN-Status: Sofort fail-fast, keine weiteren Versuche"""
        failing_func = AsyncMock(side_effect=Exception("Service down"))

        # Öffne Circuit durch 3 Fehler
        for _ in range(3):
            with pytest.raises(Exception):
                await circuit_breaker.call(failing_func)

        assert circuit_breaker.state == CircuitState.OPEN
        call_count_before = failing_func.call_count

        # Nächster Call sollte fail-fast OHNE weitere Versuche
        with pytest.raises(Exception, match="Circuit .* ist OPEN"):
            await circuit_breaker.call(failing_func)

        # failing_func wurde NICHT aufgerufen (fail-fast)
        assert failing_func.call_count == call_count_before

    @pytest.mark.asyncio
    async def test_transition_open_to_half_open(self, circuit_breaker):
        """Nach Timeout: OPEN → HALF_OPEN"""
        failing_func = AsyncMock(side_effect=Exception("Service down"))

        # Öffne Circuit
        for _ in range(3):
            with pytest.raises(Exception):
                await circuit_breaker.call(failing_func)

        assert circuit_breaker.state == CircuitState.OPEN
        opened_at = circuit_breaker.opened_at

        # Warte auf Recovery-Timeout
        await asyncio.sleep(1.1)

        # Nächster Call versucht HALF_OPEN
        successful_func = AsyncMock(return_value="success")
        result = await circuit_breaker.call(successful_func)

        assert circuit_breaker.state == CircuitState.HALF_OPEN
        assert successful_func.called

    @pytest.mark.asyncio
    async def test_transition_half_open_to_closed(self, circuit_breaker):
        """Nach Erfolgen in HALF_OPEN: HALF_OPEN → CLOSED"""
        failing_func = AsyncMock(side_effect=Exception("Service down"))

        # Öffne Circuit
        for _ in range(3):
            with pytest.raises(Exception):
                await circuit_breaker.call(failing_func)

        # Warte auf Recovery
        await asyncio.sleep(1.1)

        # Zwei Erfolge schließen Circuit
        successful_func = AsyncMock(return_value="success")
        for i in range(2):
            result = await circuit_breaker.call(successful_func)
            assert result == "success"

        assert circuit_breaker.state == CircuitState.CLOSED
        assert circuit_breaker.failure_count == 0


class TestCircuitBreakerFailureHandling:
    """Tests für Fehlertoleranz und Fallback"""

    @pytest.mark.asyncio
    async def test_fallback_called_when_circuit_open(self, circuit_breaker):
        """Bei OPEN-Status: Fallback-Funktion wird aufgerufen"""
        failing_func = AsyncMock(side_effect=Exception("Service down"))
        fallback_func = AsyncMock(return_value="fallback_result")

        # Öffne Circuit
        for _ in range(3):
            with pytest.raises(Exception):
                await circuit_breaker.call(failing_func)

        # Bei OPEN-Status: Fallback statt Exception
        result = await circuit_breaker.call(failing_func, fallback=fallback_func)

        assert result == "fallback_result"
        assert fallback_func.called

    @pytest.mark.asyncio
    async def test_fallback_called_on_exception(self, circuit_breaker):
        """Bei Exception: Fallback wird aufgerufen"""
        failing_func = AsyncMock(side_effect=Exception("Service error"))
        fallback_func = AsyncMock(return_value="fallback_result")

        # Fallback bei Exception (Circuit noch CLOSED)
        result = await circuit_breaker.call(failing_func, fallback=fallback_func)

        assert result == "fallback_result"
        assert fallback_func.called
        assert circuit_breaker.failure_count == 1

    @pytest.mark.asyncio
    async def test_queue_fallback_integration(self, circuit_breaker, notification_queue):
        """Queue wird als Fallback verwendet wenn Circuit OPEN"""
        failing_func = AsyncMock(side_effect=Exception("Firebase down"))

        # Öffne Circuit
        for _ in range(3):
            with pytest.raises(Exception):
                await circuit_breaker.call(failing_func)

        # Fallback zur Queue
        async def queue_fallback(*args, **kwargs):
            return notification_queue.enqueue(
                device_token=args[0] if args else "unknown",
                user_id=kwargs.get("user_id", 0),
                title="test_title",
                body="test_body",
            )

        result = await circuit_breaker.call(failing_func, fallback=queue_fallback)

        assert circuit_breaker.state == CircuitState.OPEN
        assert notification_queue.queue_size > 0


class TestCircuitBreakerTimeoutHandling:
    """Tests für Timeout-Logik"""

    @pytest.mark.asyncio
    async def test_timeout_triggers_failure(self, circuit_breaker):
        """Wenn Funktion zu lange dauert: Timeout → Fehler"""
        async def slow_func():
            await asyncio.sleep(3)  # Länger als Timeout (2s)
            return "success"

        # Timeout sollte 3 Fehler erzeugen
        for _ in range(3):
            with pytest.raises(Exception):  # TimeoutError
                await circuit_breaker.call(slow_func)

        assert circuit_breaker.state == CircuitState.OPEN

    @pytest.mark.asyncio
    async def test_within_timeout_succeeds(self, circuit_breaker):
        """Wenn Funktion schnell genug ist: Kein Timeout"""
        async def fast_func():
            await asyncio.sleep(0.1)
            return "success"

        result = await circuit_breaker.call(fast_func)

        assert result == "success"
        assert circuit_breaker.failure_count == 0


class TestCircuitBreakerRecovery:
    """Tests für Recovery und Wiederherstellung"""

    @pytest.mark.asyncio
    async def test_circuit_recovers_after_timeout(self, circuit_breaker):
        """Circuit erholt sich nach Recovery-Timeout"""
        failing_func = AsyncMock(side_effect=Exception("Temporary failure"))

        # Öffne Circuit
        for _ in range(3):
            with pytest.raises(Exception):
                await circuit_breaker.call(failing_func)

        assert circuit_breaker.state == CircuitState.OPEN

        # Service kommt zurück online
        successful_func = AsyncMock(return_value="recovered")
        await asyncio.sleep(1.1)  # Warte auf Recovery

        result = await circuit_breaker.call(successful_func)
        assert result == "recovered"
        assert circuit_breaker.state == CircuitState.HALF_OPEN

    @pytest.mark.asyncio
    async def test_circuit_reopens_on_failure_during_recovery(self, circuit_breaker):
        """Fehler während HALF_OPEN: Zurück zu OPEN"""
        failing_func = AsyncMock(side_effect=Exception("Service down"))

        # Öffne Circuit
        for _ in range(3):
            with pytest.raises(Exception):
                await circuit_breaker.call(failing_func)

        await asyncio.sleep(1.1)

        # Fehler während HALF_OPEN
        with pytest.raises(Exception):
            await circuit_breaker.call(failing_func)

        assert circuit_breaker.state == CircuitState.OPEN

    @pytest.mark.asyncio
    async def test_get_circuit_status(self, circuit_breaker):
        """Circuit-Status kann abgefragt werden"""
        failing_func = AsyncMock(side_effect=Exception("Error"))

        for _ in range(2):
            with pytest.raises(Exception):
                await circuit_breaker.call(failing_func)

        status = circuit_breaker.get_state()

        assert status["name"] == "test_service"
        assert status["state"] == "closed"
        assert status["failure_count"] == 2
        assert status["last_failure_time"] is not None


class TestLocalNotificationQueue:
    """Tests für Fallback-Queue"""

    def test_enqueue_notification(self, notification_queue):
        """Notification wird in Queue eingefügt"""
        notification_id = notification_queue.enqueue(
            device_token="token_123",
            user_id=42,
            title="Test Title",
            body="Test Body",
        )

        assert notification_id is not None
        assert len(notification_queue.queue) == 1
        assert notification_queue.queue[0].device_token == "token_123"

    def test_dequeue_batch(self, notification_queue):
        """Batch wird aus Queue entnommen"""
        for i in range(5):
            notification_queue.enqueue(
                device_token=f"token_{i}",
                user_id=i,
                title=f"Title {i}",
                body=f"Body {i}",
            )

        batch = notification_queue.dequeue_batch(batch_size=3)

        assert len(batch) == 3
        assert len(notification_queue.queue) == 2

    def test_queue_status(self, notification_queue):
        """Queue-Status kann abgefragt werden"""
        notification_queue.enqueue(
            device_token="token",
            user_id=1,
            title="Title",
            body="Body",
        )

        status = notification_queue.get_queue_status()

        assert status["queue_size"] == 1
        assert status["failed_count"] == 0
        assert status["max_size"] == 100

    def test_mark_failed_retry(self, notification_queue):
        """Fehlerhafte Notification wird für Retry in Queue zurück"""
        notification_queue.enqueue(
            device_token="token",
            user_id=1,
            title="Title",
            body="Body",
        )

        notification = notification_queue.queue[0]
        notification_queue.dequeue_batch(1)  # Aus Queue entnehmen

        notification_queue.mark_failed(notification)

        assert len(notification_queue.queue) == 1
        assert notification.retry_count == 1
        assert len(notification_queue.failed_notifications) == 0

    def test_mark_failed_permanent(self, notification_queue):
        """Nach 3 Versuchen: Notification wird als fehlgeschlagen markiert"""
        notification_queue.enqueue(
            device_token="token",
            user_id=1,
            title="Title",
            body="Body",
        )

        notification = notification_queue.queue[0]

        # Simuliere 3 Fehlgeschlagene Versuche
        for _ in range(3):
            notification_queue.dequeue_batch(1)
            notification_queue.mark_failed(notification)

        assert notification.retry_count == 3
        assert len(notification_queue.failed_notifications) == 1

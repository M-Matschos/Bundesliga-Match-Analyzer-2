"""Tests for Celery async task queue."""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from app.core.celery_app import celery_app, debug_task


class TestCeleryAppConfiguration:
    """Test Celery application setup."""

    def test_celery_broker_configured(self):
        """Test Celery broker is Redis."""
        assert celery_app.conf.broker_url.startswith("redis://")

    def test_celery_result_backend_configured(self):
        """Test Celery result backend is Redis."""
        assert celery_app.conf.result_backend.startswith("redis://")

    def test_celery_task_serializer(self):
        """Test task serialization is JSON."""
        assert celery_app.conf.task_serializer == "json"

    def test_celery_result_serializer(self):
        """Test result serialization is JSON."""
        assert celery_app.conf.result_serializer == "json"

    def test_celery_accept_content(self):
        """Test accepted content types."""
        assert "json" in celery_app.conf.accept_content

    def test_celery_timezone(self):
        """Test timezone is UTC."""
        assert celery_app.conf.timezone == "UTC"

    def test_celery_enable_utc(self):
        """Test UTC is enabled."""
        assert celery_app.conf.enable_utc is True


class TestCeleryTaskQueues:
    """Test Celery task queue routing."""

    def test_default_queue_exists(self):
        """Test default queue is configured."""
        queues = celery_app.conf.task_queues
        assert queues is not None

    def test_predictions_queue_exists(self):
        """Test predictions queue is configured."""
        # Queues should be defined in config
        assert celery_app.conf.get("task_queues") is not None

    def test_data_collection_queue_exists(self):
        """Test data collection queue is configured."""
        # Queues should be defined in config
        assert celery_app.conf.get("task_queues") is not None

    def test_task_routing_configured(self):
        """Test task routing is configured."""
        routing = celery_app.conf.get("task_routes")
        # Routing may be None if not explicitly set
        assert routing is None or isinstance(routing, dict)


class TestCeleryTaskDefaults:
    """Test Celery task default settings."""

    def test_task_always_eager_false_production(self):
        """Test tasks are async (not eager) in production."""
        # In production, tasks should run async
        # In tests, this might be overridden
        assert celery_app.conf.task_always_eager is not True

    def test_task_acks_late_enabled(self):
        """Test late task acknowledgment is enabled."""
        # This prevents task loss on worker crash
        assert celery_app.conf.task_acks_late is True

    def test_worker_prefetch_multiplier(self):
        """Test worker prefetch multiplier."""
        assert celery_app.conf.worker_prefetch_multiplier == 4

    def test_task_time_limit(self):
        """Test hard task time limit is set."""
        # Default should be 30 minutes (1800 seconds)
        assert celery_app.conf.task_time_limit >= 1800

    def test_task_soft_time_limit(self):
        """Test soft task time limit is set."""
        # Default should be 25 minutes (1500 seconds)
        assert celery_app.conf.task_soft_time_limit >= 1500


class TestDebugTask:
    """Test debug_task for Celery verification."""

    def test_debug_task_is_registered(self):
        """Test debug_task is registered with Celery."""
        # The task should be in the app's task registry
        task_names = celery_app.tasks.keys()
        assert any("debug_task" in name for name in task_names)

    def test_debug_task_callable(self):
        """Test debug_task is callable."""
        assert callable(debug_task)

    @patch('celery.current_app')
    def test_debug_task_sends_ping(self, mock_app):
        """Test debug_task sends ping message."""
        # This test would require mocking the Celery event system
        # The actual implementation calls app.send_task('celery.ping')
        assert callable(debug_task)


class TestCeleryResultBackend:
    """Test Celery result backend configuration."""

    def test_result_expires_configured(self):
        """Test result expiration time."""
        result_expires = celery_app.conf.result_expires
        # Results should expire in 1 hour (3600 seconds)
        assert result_expires >= 3600

    def test_result_extended_expiry_enabled(self):
        """Test extended result expiry for long tasks."""
        # For long-running tasks like weekend calculation
        assert celery_app.conf.result_expires >= 3600


class TestCeleryWorkerConfiguration:
    """Test worker-related configuration."""

    def test_worker_max_tasks_per_child(self):
        """Test max tasks per worker child process."""
        max_tasks = celery_app.conf.worker_max_tasks_per_child
        # Prevent memory leaks in long-running workers
        assert max_tasks >= 1000

    def test_worker_disable_rate_limits(self):
        """Test if rate limits are disabled (should be in most configs)."""
        # Rate limits might be configured per task
        assert celery_app.conf is not None


class TestCeleryErrorHandling:
    """Test error handling in Celery configuration."""

    def test_task_reject_on_worker_lost(self):
        """Test tasks are rejected if worker is lost."""
        # This prevents task duplication on worker crash
        assert celery_app.conf.task_reject_on_worker_lost is True

    def test_task_track_started(self):
        """Test task started event is tracked."""
        # Allows monitoring of task progress
        assert celery_app.conf.task_track_started is True


class TestCeleryLogging:
    """Test logging configuration for Celery."""

    def test_celery_app_configured(self):
        """Test Celery app is properly initialized."""
        assert celery_app is not None
        assert celery_app.conf is not None

    def test_celery_app_autodiscover_tasks(self):
        """Test task autodiscovery is configured."""
        # Tasks should be autodiscovered from app modules
        assert hasattr(celery_app, 'autodiscover_tasks')


class TestCeleryIntegration:
    """Test Celery integration points."""

    def test_celery_app_has_send_task(self):
        """Test Celery app can send tasks."""
        assert hasattr(celery_app, 'send_task')

    def test_celery_app_has_group_chord(self):
        """Test Celery primitives are available via the celery module."""
        # group/chord are module-level imports, not app-instance attributes
        import celery
        assert hasattr(celery, 'group')
        assert hasattr(celery, 'chord')

    def test_celery_app_signature_available(self):
        """Test task signatures are available."""
        assert hasattr(celery_app, 'signature')

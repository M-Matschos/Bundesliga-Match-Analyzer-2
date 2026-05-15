"""Celery configuration for background task queue."""

import logging
from celery import Celery
from kombu import Queue, Exchange

from app.core.config import settings

logger = logging.getLogger(__name__)

# Create Celery app
celery_app = Celery(settings.project_name)

# Configure Celery
celery_app.conf.update(
    broker_url=settings.celery_broker_url,
    result_backend=settings.celery_result_backend,
    task_serializer=settings.celery_task_serializer,
    accept_content=[settings.celery_accept_content],
    timezone="UTC",
    enable_utc=True,
    # Task configuration
    task_track_started=True,
    task_acks_late=True,  # Prevent task loss on worker crash
    task_reject_on_worker_lost=True,  # Reject (requeue) if worker is lost
    task_time_limit=30 * 60,  # 30 minutes hard limit
    task_soft_time_limit=25 * 60,  # 25 minutes soft limit
    # Result backend configuration
    result_expires=3600,  # Results expire after 1 hour
    # Worker configuration
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=1000,
)

# Define queues
default_exchange = Exchange("default", type="direct")
celery_app.conf.task_queues = (
    Queue("default", default_exchange, routing_key="default"),
    Queue("predictions", default_exchange, routing_key="predictions"),
    Queue("data_collection", default_exchange, routing_key="data_collection"),
)

# Set default queue
celery_app.conf.task_default_queue = "default"
celery_app.conf.task_default_exchange_type = "direct"
celery_app.conf.task_default_routing_key = "default"

# Route tasks to specific queues
celery_app.conf.task_routes = {
    "app.tasks.weekend_tasks.*": {"queue": "predictions"},
    "app.tasks.data_tasks.*": {"queue": "data_collection"},
}

# Auto-discover tasks
celery_app.autodiscover_tasks(["app.tasks"])

logger.info(f"✅ Celery configured: broker={settings.celery_broker_url}")


@celery_app.task(bind=True)
def debug_task(self) -> None:
    """Debug task for testing Celery."""
    print(f"Request: {self.request!r}")

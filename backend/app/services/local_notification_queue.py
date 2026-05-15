"""
Lokale Notification Queue für Fallback-Handling
Speichert Notifications wenn Firebase nicht verfügbar ist
"""

import logging
from typing import List, Dict, Optional
from datetime import datetime
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)


@dataclass
class QueuedNotification:
    """Notification in der lokalen Queue"""

    id: str
    device_token: str
    user_id: int
    title: str
    body: str
    data: Dict = None
    queued_at: str = None
    retry_count: int = 0

    def __post_init__(self):
        if self.data is None:
            self.data = {}
        if self.queued_at is None:
            self.queued_at = datetime.now().isoformat()


class LocalNotificationQueue:
    """
    In-Memory Queue für Notifications während Firebase-Ausfällen.
    Versucht später Nachzuverfand zu senden und loggt fehlgeschlagene Notifications.
    """

    def __init__(self, max_queue_size: int = 1000):
        self.queue: List[QueuedNotification] = []
        self.max_queue_size = max_queue_size
        self.failed_notifications: List[QueuedNotification] = []

    def enqueue(
        self,
        device_token: str,
        user_id: int,
        title: str,
        body: str,
        data: Optional[Dict] = None,
    ) -> str:
        """Füge Notification zur Queue hinzu"""
        if len(self.queue) >= self.max_queue_size:
            logger.warning(
                f"📦 Queue voll ({self.max_queue_size}), älteste Notification entfernt"
            )
            self.queue.pop(0)

        notification_id = f"{device_token}_{int(datetime.now().timestamp() * 1000)}"
        notification = QueuedNotification(
            id=notification_id,
            device_token=device_token,
            user_id=user_id,
            title=title,
            body=body,
            data=data or {},
        )

        self.queue.append(notification)
        logger.info(f"📦 Notification in Queue: {notification_id}")
        return notification_id

    def dequeue_batch(self, batch_size: int = 50) -> List[QueuedNotification]:
        """Hole Batch von Notifications zum Versand"""
        batch = self.queue[:batch_size]
        self.queue = self.queue[batch_size:]
        return batch

    def mark_failed(self, notification: QueuedNotification) -> None:
        """Markiere Notification als endgültig fehlgeschlagen"""
        notification.retry_count += 1

        if notification.retry_count >= 3:
            self.failed_notifications.append(notification)
            logger.error(
                f"❌ Notification {notification.id} nach 3 Versuchen fehlgeschlagen"
            )
        else:
            self.queue.append(notification)
            logger.warning(
                f"⚠️ Notification {notification.id} in Queue zurück "
                f"(Versuch {notification.retry_count}/3)"
            )

    @property
    def queue_size(self) -> int:
        """Aktuelle Größe der Queue"""
        return len(self.queue)

    def get_queue_status(self) -> Dict:
        """Status der Queue"""
        return {
            "queue_size": len(self.queue),
            "failed_count": len(self.failed_notifications),
            "max_size": self.max_queue_size,
            "queue_items": [asdict(n) for n in self.queue],
            "failed_items": [asdict(n) for n in self.failed_notifications],
        }

    def clear_failed(self) -> int:
        """Leere fehlerhafte Notifications (z.B. für Datenschutz-Cleanup)"""
        count = len(self.failed_notifications)
        self.failed_notifications.clear()
        logger.info(f"🗑️ {count} fehlerhafte Notifications gelöscht")
        return count

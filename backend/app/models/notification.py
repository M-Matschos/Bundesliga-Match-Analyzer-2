"""
Push Notification Models für Phase C: Firebase Cloud Messaging Integration
Definiert alle Datenstrukturen für Push-Benachrichtigungen
"""

from typing import Optional, Dict, Any, Literal
from datetime import datetime
from pydantic import BaseModel, Field


class DeviceToken(BaseModel):
    """Registriertes Gerät mit Push-Benachrichtigungstoken"""

    user_id: int
    device_token: str
    platform: Literal["ios", "android", "web"]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "device_token": "dPr5RTt4_lEAAAA...",
                "platform": "ios",
                "created_at": "2026-04-28T12:00:00",
                "updated_at": "2026-04-28T12:00:00",
            }
        }


class NotificationSubscription(BaseModel):
    """Benutzer-Match-Subscription für Benachrichtigungen"""

    user_id: int
    match_id: int
    subscribed_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "match_id": 12345,
                "subscribed_at": "2026-04-28T12:00:00",
            }
        }


class PushNotificationRequest(BaseModel):
    """Request zum Senden einer Push-Benachrichtigung"""

    device_token: str
    title: str = Field(..., min_length=1, max_length=200)
    body: str = Field(..., min_length=1, max_length=1000)
    data: Optional[Dict[str, str]] = None
    image_url: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "device_token": "dPr5RTt4_lEAAAA...",
                "title": "Match 12345 - GOAL",
                "body": "Bayern München scored! Lewandowski 45'",
                "data": {"match_id": "12345", "event_type": "goal"},
                "image_url": "https://example.com/match.jpg",
            }
        }


class NotificationHistory(BaseModel):
    """Historischer Datensatz einer gesendeten Benachrichtigung"""

    id: int
    user_id: int
    match_id: int
    event_type: str
    title: str
    body: str
    sent_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "match_id": 12345,
                "event_type": "goal",
                "title": "Match 12345 - GOAL",
                "body": "Bayern München scored! Lewandowski 45'",
                "sent_at": "2026-04-28T12:00:00",
                "read_at": "2026-04-28T12:05:00",
            }
        }


class DeviceTokenRequest(BaseModel):
    """Request zum Registrieren eines Geräts"""

    user_id: int
    device_token: str
    platform: Literal["ios", "android", "web"]

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "device_token": "dPr5RTt4_lEAAAA...",
                "platform": "ios",
            }
        }


class MatchSubscriptionRequest(BaseModel):
    """Request zum Abonnieren von Match-Benachrichtigungen"""

    user_id: int
    match_id: int

    class Config:
        json_schema_extra = {"example": {"user_id": 1, "match_id": 12345}}


class NotificationResponse(BaseModel):
    """Response nach erfolgreichem Benachrichtigungsversand"""

    status: str
    message: Optional[str] = None
    firebase_message_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "status": "sent",
                "message": "Push notification sent successfully",
                "firebase_message_id": "projects/123/messages/456",
                "timestamp": "2026-04-28T12:00:00",
            }
        }

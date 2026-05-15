"""
Push Notifications Router für Phase C: Firebase Cloud Messaging Integration
Verwaltet Geräte-Registrierungen, Match-Subscriptions und Notification-History
"""

import logging
from typing import List

from fastapi import APIRouter, HTTPException, Path, Depends

from app.models.notification import (
    DeviceTokenRequest,
    MatchSubscriptionRequest,
    NotificationResponse,
    NotificationHistory,
)
from app.services.notification_service import (
    get_notification_service,
    NotificationService,
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["notifications"])


async def get_service() -> NotificationService:
    """Dependency: Hole den Notification-Service"""
    try:
        return get_notification_service()
    except RuntimeError as e:
        logger.error(f"Notification-Service nicht initialisiert: {e}")
        raise HTTPException(
            status_code=500, detail="Notification-Service nicht verfügbar"
        )


@router.post("/register-device", response_model=NotificationResponse)
async def register_device(
    request: DeviceTokenRequest,
    service: NotificationService = Depends(get_service),
) -> NotificationResponse:
    """
    Registriere oder aktualisiere ein Gerät für Push-Benachrichtigungen.

    - **user_id**: Benutzer-ID
    - **device_token**: Firebase-Gerät-Token
    - **platform**: Gerät-Plattform (ios, android, web)
    """
    try:
        await service.register_device(
            user_id=request.user_id,
            device_token=request.device_token,
            platform=request.platform,
        )

        logger.info(
            f"✓ Gerät registriert: user_id={request.user_id}, platform={request.platform}"
        )

        return NotificationResponse(
            status="success",
            message=f"Device registered for user {request.user_id} on {request.platform}",
        )

    except Exception as e:
        logger.error(f"✗ Fehler bei Geräte-Registrierung: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to register device: {str(e)}",
        )


@router.post("/subscribe-match", response_model=NotificationResponse)
async def subscribe_to_match(
    request: MatchSubscriptionRequest,
    service: NotificationService = Depends(get_service),
) -> NotificationResponse:
    """
    Abonniere Push-Benachrichtigungen für ein Match.

    - **user_id**: Benutzer-ID
    - **match_id**: Match-ID
    """
    try:
        await service.subscribe_to_match(
            user_id=request.user_id,
            match_id=request.match_id,
        )

        logger.info(f"✓ Benutzer {request.user_id} abonniert Match {request.match_id}")

        return NotificationResponse(
            status="success",
            message=f"User {request.user_id} subscribed to match {request.match_id}",
        )

    except Exception as e:
        logger.error(f"✗ Fehler bei Match-Abo: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to subscribe to match: {str(e)}",
        )


@router.post("/unsubscribe-match", response_model=NotificationResponse)
async def unsubscribe_from_match(
    request: MatchSubscriptionRequest,
    service: NotificationService = Depends(get_service),
) -> NotificationResponse:
    """
    Beende das Abo für Push-Benachrichtigungen eines Matches.

    - **user_id**: Benutzer-ID
    - **match_id**: Match-ID
    """
    try:
        await service.unsubscribe_from_match(
            user_id=request.user_id,
            match_id=request.match_id,
        )

        logger.info(
            f"✓ Benutzer {request.user_id} abgemeldet von Match {request.match_id}"
        )

        return NotificationResponse(
            status="success",
            message=f"User {request.user_id} unsubscribed from match {request.match_id}",
        )

    except Exception as e:
        logger.error(f"✗ Fehler bei Abo-Beendigung: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to unsubscribe from match: {str(e)}",
        )


@router.get("/history/{user_id}", response_model=List[NotificationHistory])
async def get_notification_history(
    user_id: int = Path(..., gt=0, description="Benutzer-ID"),
    limit: int = 50,
    service: NotificationService = Depends(get_service),
) -> List[NotificationHistory]:
    """
    Hole die Benachrichtigungs-Historie eines Benutzers.

    - **user_id**: Benutzer-ID (muss > 0 sein)
    - **limit**: Maximale Anzahl von Benachrichtigungen (default: 50, max: 200)
    """
    try:
        if limit > 200:
            limit = 200

        history = await service.get_notification_history(user_id=user_id, limit=limit)

        logger.info(
            f"✓ Notification-Historie abgerufen: user_id={user_id}, records={len(history)}"
        )

        return history

    except Exception as e:
        logger.error(f"✗ Fehler beim Abrufen der Notification-Historie: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to retrieve notification history: {str(e)}",
        )


@router.post("/mark-as-read/{notification_id}", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: int = Path(..., gt=0, description="Benachrichtigungs-ID"),
    service: NotificationService = Depends(get_service),
) -> NotificationResponse:
    """
    Markiere eine Benachrichtigung als gelesen.

    - **notification_id**: Benachrichtigungs-ID (muss > 0 sein)
    """
    try:
        await service.mark_notification_as_read(notification_id=notification_id)

        logger.info(f"✓ Benachrichtigung {notification_id} als gelesen markiert")

        return NotificationResponse(
            status="success",
            message=f"Notification {notification_id} marked as read",
        )

    except Exception as e:
        logger.error(f"✗ Fehler beim Markieren als gelesen: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to mark notification as read: {str(e)}",
        )


@router.get("/devices/{user_id}")
async def get_user_devices(
    user_id: int = Path(..., gt=0, description="Benutzer-ID"),
    service: NotificationService = Depends(get_service),
):
    """
    Hole alle registrierten Geräte eines Benutzers.

    - **user_id**: Benutzer-ID (muss > 0 sein)
    """
    try:
        devices = await service.get_user_devices(user_id=user_id)

        logger.info(f"✓ Geräte abgerufen: user_id={user_id}, count={len(devices)}")

        return {
            "status": "success",
            "user_id": user_id,
            "devices": devices,
            "total": len(devices),
        }

    except Exception as e:
        logger.error(f"✗ Fehler beim Abrufen der Geräte: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to retrieve devices: {str(e)}",
        )


@router.post("/unregister-device/{device_token}", response_model=NotificationResponse)
async def unregister_device(
    device_token: str = Path(..., min_length=1, description="Firebase Gerät-Token"),
    service: NotificationService = Depends(get_service),
) -> NotificationResponse:
    """
    Deregistriere ein Gerät (z.B. bei App-Deinstallation).

    - **device_token**: Firebase Gerät-Token
    """
    try:
        await service.unregister_device(device_token=device_token)

        logger.info(f"✓ Gerät deregistriert: {device_token[:20]}...")

        return NotificationResponse(
            status="success",
            message=f"Device {device_token[:20]}... unregistered",
        )

    except Exception as e:
        logger.error(f"✗ Fehler bei Geräte-Deregistrierung: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to unregister device: {str(e)}",
        )

"""WebSocket router for live match updates and real-time events."""

import logging
import json
from datetime import datetime
from typing import Dict, Set, Callable, Optional, Any
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.db import User, Match, get_db
from app.core.security import verify_token
from app.core.redis_pubsub import pubsub_manager, RedisPubSubManager

router = APIRouter(tags=["websocket"])
logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manage WebSocket connections for live match updates."""

    def __init__(self):
        """Initialize connection manager."""
        # Structure: {match_id: {connection_id: websocket}}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        # Structure: {connection_id: {match_id, user_id, connected_at}}
        self.connection_metadata: Dict[str, dict] = {}
        # Structure: {match_id: Set[channel_names]} for Redis subscriptions
        self.active_subscriptions: Dict[str, Set[str]] = {}

    async def connect(
        self,
        match_id: str,
        websocket: WebSocket,
        user_id: UUID,
        connection_id: str,
    ) -> None:
        """
        Register new WebSocket connection.

        Args:
            match_id: ID of match being watched
            websocket: WebSocket connection object
            user_id: ID of authenticated user
            connection_id: Unique connection identifier

        Raises:
            Exception: If connection fails to accept
        """
        await websocket.accept()

        # Initialize match dict if needed
        if match_id not in self.active_connections:
            self.active_connections[match_id] = {}

        # Store connection
        self.active_connections[match_id][connection_id] = websocket

        # Store metadata
        self.connection_metadata[connection_id] = {
            "match_id": match_id,
            "user_id": str(user_id),
            "connected_at": datetime.utcnow().isoformat(),
        }

        # Log connection
        logger.info(
            "websocket_connected",
            extra={
                "match_id": match_id,
                "connection_id": connection_id,
                "user_id": str(user_id),
                "total_connections": len(self.active_connections[match_id]),
            },
        )

    async def disconnect(self, match_id: str, connection_id: str) -> None:
        """
        Remove WebSocket connection.

        Args:
            match_id: ID of match
            connection_id: Connection identifier to remove
        """
        if match_id in self.active_connections:
            self.active_connections[match_id].pop(connection_id, None)

            # Clean up empty match entries
            if not self.active_connections[match_id]:
                del self.active_connections[match_id]

        # Remove metadata
        metadata = self.connection_metadata.pop(connection_id, None)

        if metadata:
            logger.info(
                "websocket_disconnected",
                extra={
                    "match_id": match_id,
                    "connection_id": connection_id,
                    "user_id": metadata["user_id"],
                    "duration_seconds": (
                        datetime.utcnow()
                        - datetime.fromisoformat(metadata["connected_at"])
                    ).total_seconds(),
                },
            )

    async def broadcast_to_match(self, match_id: str, message: dict) -> None:
        """
        Send message to all connections watching a match.

        Args:
            match_id: Match ID to broadcast to
            message: Message dictionary to send
        """
        if match_id not in self.active_connections:
            return

        dead_connections: Set[str] = set()

        for connection_id, websocket in self.active_connections[match_id].items():
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.warning(
                    f"Failed to send message to connection {connection_id}: {str(e)}"
                )
                dead_connections.add(connection_id)

        # Clean up dead connections
        for connection_id in dead_connections:
            await self.disconnect(match_id, connection_id)

    async def send_error(self, websocket: WebSocket, error_message: str) -> None:
        """
        Send error message to specific connection.

        Args:
            websocket: WebSocket connection
            error_message: Error message to send
        """
        try:
            await websocket.send_json(
                {
                    "type": "error",
                    "message": error_message,
                    "timestamp": datetime.utcnow().isoformat(),
                }
            )
        except Exception as e:
            logger.error(f"Failed to send error message: {str(e)}")

    async def send_status(self, websocket: WebSocket, status_msg: str) -> None:
        """
        Send status message to specific connection.

        Args:
            websocket: WebSocket connection
            status_msg: Status message to send
        """
        try:
            await websocket.send_json(
                {
                    "type": "status",
                    "message": status_msg,
                    "timestamp": datetime.utcnow().isoformat(),
                }
            )
        except Exception as e:
            logger.error(f"Failed to send status message: {str(e)}")

    def get_match_connections_count(self, match_id: str) -> int:
        """
        Get number of active connections for a match.

        Args:
            match_id: Match ID

        Returns:
            Number of active connections
        """
        if match_id not in self.active_connections:
            return 0
        return len(self.active_connections[match_id])

    async def start_listening_for_match_events(self, match_id: str) -> None:
        """
        Subscribe to Redis Pub/Sub channels for a match.

        Listens to:
        - match:{match_id}:events (live events)
        - match:{match_id}:stats (statistics updates)
        - match:{match_id}:notifications (system notifications)

        Broadcasts all received messages to connected WebSocket clients.

        Args:
            match_id: Match ID to listen for
        """
        if not await pubsub_manager.is_connected():
            logger.warning(f"Redis not connected, skipping listener for match {match_id}")
            return

        # Define callback to broadcast to all WebSocket clients
        async def on_event_received(message: str) -> None:
            """Handle event from Redis and broadcast to WebSocket clients."""
            try:
                event_data = json.loads(message)
                await self.broadcast_to_match(match_id, event_data)
                logger.debug(
                    f"Broadcasted Redis event to {self.get_match_connections_count(match_id)} clients"
                )
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse Redis message: {str(e)}")
            except Exception as e:
                logger.error(f"Failed to broadcast event: {str(e)}")

        # Subscribe to all 3 channels for this match
        channels = [
            RedisPubSubManager.get_match_events_channel(match_id),
            RedisPubSubManager.get_match_stats_channel(match_id),
            RedisPubSubManager.get_match_notifications_channel(match_id),
        ]

        try:
            for channel in channels:
                await pubsub_manager.subscribe(channel, on_event_received)

            # Track active subscriptions
            self.active_subscriptions[match_id] = set(channels)
            logger.info(
                f"Started listening for match events",
                extra={
                    "match_id": match_id,
                    "channels": channels,
                },
            )
        except Exception as e:
            logger.error(f"Failed to subscribe to Redis channels for match {match_id}: {str(e)}")

    async def stop_listening_for_match(self, match_id: str) -> None:
        """
        Unsubscribe from Redis Pub/Sub channels for a match.

        Called when all WebSocket clients for a match disconnect.

        Args:
            match_id: Match ID to stop listening for
        """
        if match_id not in self.active_subscriptions:
            return

        channels = self.active_subscriptions.pop(match_id)

        try:
            for channel in channels:
                await pubsub_manager.unsubscribe(channel)

            logger.info(
                f"Stopped listening for match events",
                extra={
                    "match_id": match_id,
                    "channels": list(channels),
                },
            )
        except Exception as e:
            logger.error(f"Failed to unsubscribe from Redis channels: {str(e)}")


# Global connection manager instance
manager = ConnectionManager()


@router.websocket("/live/{match_id}")
async def websocket_live_match(
    websocket: WebSocket,
    match_id: str,
    token: str = None,
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    WebSocket endpoint for live match updates.

    Clients connect with a match ID and authentication token.
    Server sends real-time events (goals, cards, substitutions, etc.)
    as they occur during the match.

    Connection URL:
        ws://localhost:8000/api/v1/ws/live/{match_id}?token={jwt_token}

    Message Format:
        {
            "type": "goal|card|substitution|match_start|match_end|injury",
            "match_id": "bundesliga_vs_m090505",
            "minute": 45,
            "team": "home|away",
            "player": "player_name",
            "event_time": "2026-04-27T20:30:00Z",
            "details": {...}
        }

    Args:
        websocket: WebSocket connection
        match_id: Match ID to watch
        token: JWT authentication token
        db: Database session

    Raises:
        WebSocketDisconnect: When client disconnects
    """

    # Authenticate user
    if not token:
        await manager.send_error(websocket, "Authentication required")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        payload = verify_token(token)
        user_id = UUID(payload.sub)
    except Exception as e:
        logger.warning(f"WebSocket authentication failed: {str(e)}")
        await manager.send_error(websocket, "Invalid authentication token")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Verify user exists and is active
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        logger.warning(f"WebSocket connection attempt by inactive user: {user_id}")
        await manager.send_error(websocket, "User account is inactive")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Verify match exists
    stmt = select(Match).where(Match.api_football_id == match_id)
    result = await db.execute(stmt)
    match = result.scalar_one_or_none()

    if not match:
        logger.warning(f"WebSocket connection to non-existent match: {match_id}")
        await manager.send_error(websocket, f"Match not found: {match_id}")
        await websocket.close(code=status.WS_1000_NORMAL_CLOSURE)
        return

    # Generate unique connection ID
    connection_id = f"{user_id}_{match_id}_{datetime.utcnow().timestamp()}"

    # Register connection
    await manager.connect(match_id, websocket, user_id, connection_id)

    # Start listening for Redis events on first connection for this match
    if manager.get_match_connections_count(match_id) == 1:
        await manager.start_listening_for_match_events(match_id)
        logger.info(
            f"First client connected for match, starting Redis listener",
            extra={"match_id": match_id},
        )

    # Send welcome message
    await manager.send_status(
        websocket,
        f"Connected to match {match.home_team_id} vs {match.away_team_id}",
    )

    try:
        # Listen for client messages (for keep-alive pings, etc.)
        while True:
            data = await websocket.receive_text()

            try:
                message = json.loads(data)

                # Handle ping/pong for keep-alive
                if message.get("type") == "ping":
                    await websocket.send_json(
                        {
                            "type": "pong",
                            "timestamp": datetime.utcnow().isoformat(),
                        }
                    )
                    logger.debug(f"Ping received from {connection_id}")

            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON from connection {connection_id}: {data}")
                await manager.send_error(websocket, "Invalid message format")

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnect from connection {connection_id}")
        await manager.disconnect(match_id, connection_id)

        # Stop listening for Redis events when last client disconnects
        if manager.get_match_connections_count(match_id) == 0:
            await manager.stop_listening_for_match(match_id)
            logger.info(
                f"Last client disconnected from match, stopping Redis listener",
                extra={"match_id": match_id},
            )

    except Exception as e:
        logger.error(f"WebSocket error in connection {match_id}: {str(e)}")
        await manager.disconnect(match_id, connection_id)

        # Cleanup Redis subscription on error
        if manager.get_match_connections_count(match_id) == 0:
            await manager.stop_listening_for_match(match_id)


@router.get("/live/{match_id}/status")
async def get_match_connections_status(
    match_id: str,
    authorization: str = None,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Get number of active connections for a specific match.

    Requires authentication. Useful for monitoring and debugging.

    Args:
        match_id: Match ID
        authorization: Bearer token for authentication
        db: Database session

    Returns:
        Status dict with connection count
    """
    # Simple authentication check
    if not authorization:
        return {"error": "Unauthorized", "status_code": 401}

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return {"error": "Invalid scheme", "status_code": 401}
        verify_token(token)
    except Exception:
        return {"error": "Invalid token", "status_code": 401}

    count = manager.get_match_connections_count(match_id)

    return {
        "match_id": match_id,
        "active_connections": count,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/stats")
async def get_websocket_stats(
    authorization: str = None,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Get global WebSocket statistics.

    Requires authentication. Useful for monitoring server health.

    Args:
        authorization: Bearer token for authentication
        db: Database session

    Returns:
        Global stats dict
    """
    # Simple authentication check
    if not authorization:
        return {"error": "Unauthorized", "status_code": 401}

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return {"error": "Invalid scheme", "status_code": 401}
        verify_token(token)
    except Exception:
        return {"error": "Invalid token", "status_code": 401}

    total_connections = sum(
        len(conns) for conns in manager.active_connections.values()
    )
    active_matches = len(manager.active_connections)

    return {
        "total_connections": total_connections,
        "active_matches": active_matches,
        "timestamp": datetime.utcnow().isoformat(),
        "matches": {
            match_id: len(conns)
            for match_id, conns in manager.active_connections.items()
        },
    }

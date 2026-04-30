"""
Event Publisher Service — High-level API for publishing match events to Redis.

Wraps RedisPubSubManager with domain-specific methods:
- publish_goal()
- publish_card()
- publish_substitution()
- publish_stats_update()
- publish_match_notification()

Called by: ingestion.py (API polling), WebSocket handlers, background tasks.
"""

import logging
from datetime import datetime
from typing import Dict, Any, Optional
from uuid import UUID

from app.core.redis_pubsub import pubsub_manager
from app.models.events import (
    GoalEvent,
    CardEvent,
    SubstitutionEvent,
    StatsUpdateEvent,
    InjuryEvent,
    MatchStartEvent,
    MatchEndEvent,
    BaseEvent,
    EventType,
    Team,
    CardType,
)

logger = logging.getLogger(__name__)


class EventPublisher:
    """Publishes match events to Redis Pub/Sub for real-time distribution."""

    @staticmethod
    async def publish_goal(
        match_id: str,
        minute: int,
        team: Team,
        player_name: str,
        player_id: str,
        assist_player_name: Optional[str] = None,
        score_before: Optional[Dict[str, int]] = None,
        score_after: Optional[Dict[str, int]] = None,
        xg_value: float = 0.0,
    ) -> int:
        """
        Publish goal event.

        Args:
            match_id: Match identifier
            minute: Minute of goal
            team: HOME or AWAY
            player_name: Player who scored
            player_id: Player ID
            assist_player_name: Player who assisted (optional)
            score_before: Score before goal
            score_after: Score after goal
            xg_value: Expected goals value

        Returns:
            Number of subscribers that received the event
        """
        try:
            event = GoalEvent(
                event_type=EventType.GOAL,
                match_id=match_id,
                timestamp=datetime.utcnow(),
                minute=minute,
                is_live=True,
                team=team,
                player_name=player_name,
                player_id=player_id,
                assist_player_name=assist_player_name,
                score_before=score_before or {"home": 0, "away": 0},
                score_after=score_after or {"home": 0, "away": 0},
                xg_value=xg_value,
            )

            num_subscribers = await pubsub_manager.publish_event(match_id, event)

            logger.info(
                "goal_published",
                extra={
                    "match_id": match_id,
                    "minute": minute,
                    "team": team.value,
                    "player": player_name,
                    "subscribers": num_subscribers,
                },
            )

            return num_subscribers

        except Exception as e:
            logger.error(f"Failed to publish goal event: {str(e)}")
            raise

    @staticmethod
    async def publish_card(
        match_id: str,
        minute: int,
        team: Team,
        player_name: str,
        player_id: str,
        card_type: CardType,
        offense: str,
    ) -> int:
        """
        Publish card event (yellow or red).

        Args:
            match_id: Match identifier
            minute: Minute of card
            team: HOME or AWAY
            player_name: Player who received card
            player_id: Player ID
            card_type: CardType.YELLOW or CardType.RED
            offense: Description of offense

        Returns:
            Number of subscribers
        """
        try:
            event = CardEvent(
                event_type=EventType.YELLOW_CARD
                if card_type == CardType.YELLOW
                else EventType.RED_CARD,
                match_id=match_id,
                timestamp=datetime.utcnow(),
                minute=minute,
                is_live=True,
                team=team,
                player_name=player_name,
                player_id=player_id,
                card_type=card_type,
                offense=offense,
            )

            num_subscribers = await pubsub_manager.publish_event(match_id, event)

            logger.info(
                "card_published",
                extra={
                    "match_id": match_id,
                    "minute": minute,
                    "team": team.value,
                    "card_type": card_type.value,
                    "player": player_name,
                    "subscribers": num_subscribers,
                },
            )

            return num_subscribers

        except Exception as e:
            logger.error(f"Failed to publish card event: {str(e)}")
            raise

    @staticmethod
    async def publish_substitution(
        match_id: str,
        minute: int,
        team: Team,
        player_off_name: str,
        player_off_id: str,
        player_on_name: str,
        player_on_id: str,
    ) -> int:
        """
        Publish substitution event.

        Args:
            match_id: Match identifier
            minute: Minute of substitution
            team: HOME or AWAY
            player_off_name: Player being substituted off
            player_off_id: Player ID off
            player_on_name: Player being substituted on
            player_on_id: Player ID on

        Returns:
            Number of subscribers
        """
        try:
            event = SubstitutionEvent(
                event_type=EventType.SUBSTITUTION,
                match_id=match_id,
                timestamp=datetime.utcnow(),
                minute=minute,
                is_live=True,
                team=team,
                player_off_name=player_off_name,
                player_off_id=player_off_id,
                player_on_name=player_on_name,
                player_on_id=player_on_id,
            )

            num_subscribers = await pubsub_manager.publish_event(match_id, event)

            logger.info(
                "substitution_published",
                extra={
                    "match_id": match_id,
                    "minute": minute,
                    "team": team.value,
                    "off": player_off_name,
                    "on": player_on_name,
                    "subscribers": num_subscribers,
                },
            )

            return num_subscribers

        except Exception as e:
            logger.error(f"Failed to publish substitution event: {str(e)}")
            raise

    @staticmethod
    async def publish_stats_update(
        match_id: str,
        home_possession: float,
        away_possession: float,
        home_shots: int,
        away_shots: int,
        home_shots_on_target: int,
        away_shots_on_target: int,
        home_corners: int,
        away_corners: int,
        home_fouls: int,
        away_fouls: int,
        **kwargs,
    ) -> int:
        """
        Publish match statistics update.

        Args:
            match_id: Match identifier
            home_possession: Home team possession (%)
            away_possession: Away team possession (%)
            home_shots: Home team total shots
            away_shots: Away team total shots
            home_shots_on_target: Home shots on target
            away_shots_on_target: Away shots on target
            home_corners: Home team corners
            away_corners: Away team corners
            home_fouls: Home team fouls
            away_fouls: Away team fouls
            **kwargs: Additional stats

        Returns:
            Number of subscribers
        """
        try:
            stats = {
                "home_possession": home_possession,
                "away_possession": away_possession,
                "home_shots": home_shots,
                "away_shots": away_shots,
                "home_shots_on_target": home_shots_on_target,
                "away_shots_on_target": away_shots_on_target,
                "home_corners": home_corners,
                "away_corners": away_corners,
                "home_fouls": home_fouls,
                "away_fouls": away_fouls,
                **kwargs,  # xG, passes, tackles, etc.
            }

            num_subscribers = await pubsub_manager.publish_stats_update(
                match_id, stats
            )

            logger.info(
                "stats_update_published",
                extra={
                    "match_id": match_id,
                    "home_possession": home_possession,
                    "away_possession": away_possession,
                    "subscribers": num_subscribers,
                },
            )

            return num_subscribers

        except Exception as e:
            logger.error(f"Failed to publish stats update: {str(e)}")
            raise

    @staticmethod
    async def publish_match_start(match_id: str) -> int:
        """
        Publish match start notification.

        Args:
            match_id: Match identifier

        Returns:
            Number of subscribers
        """
        try:
            event = MatchStartEvent(
                event_type=EventType.MATCH_START,
                match_id=match_id,
                timestamp=datetime.utcnow(),
                minute=0,
                is_live=True,
            )

            num_subscribers = await pubsub_manager.publish_event(match_id, event)

            logger.info(
                "match_start_published",
                extra={
                    "match_id": match_id,
                    "subscribers": num_subscribers,
                },
            )

            return num_subscribers

        except Exception as e:
            logger.error(f"Failed to publish match start: {str(e)}")
            raise

    @staticmethod
    async def publish_match_end(match_id: str) -> int:
        """
        Publish match end notification.

        Args:
            match_id: Match identifier

        Returns:
            Number of subscribers
        """
        try:
            event = MatchEndEvent(
                event_type=EventType.MATCH_END,
                match_id=match_id,
                timestamp=datetime.utcnow(),
                minute=90,
                is_live=False,
            )

            num_subscribers = await pubsub_manager.publish_event(match_id, event)

            logger.info(
                "match_end_published",
                extra={
                    "match_id": match_id,
                    "subscribers": num_subscribers,
                },
            )

            return num_subscribers

        except Exception as e:
            logger.error(f"Failed to publish match end: {str(e)}")
            raise

    @staticmethod
    async def publish_injury(
        match_id: str,
        minute: int,
        team: Team,
        player_name: str,
        player_id: str,
        injury_type: str,
    ) -> int:
        """
        Publish injury notification.

        Args:
            match_id: Match identifier
            minute: Minute of injury
            team: HOME or AWAY
            player_name: Injured player
            player_id: Player ID
            injury_type: Type of injury (e.g., "hamstring")

        Returns:
            Number of subscribers
        """
        try:
            event = InjuryEvent(
                event_type=EventType.INJURY,
                match_id=match_id,
                timestamp=datetime.utcnow(),
                minute=minute,
                is_live=True,
                team=team,
                player_name=player_name,
                player_id=player_id,
                injury_type=injury_type,
            )

            num_subscribers = await pubsub_manager.publish_event(match_id, event)

            logger.info(
                "injury_published",
                extra={
                    "match_id": match_id,
                    "minute": minute,
                    "player": player_name,
                    "injury_type": injury_type,
                    "subscribers": num_subscribers,
                },
            )

            return num_subscribers

        except Exception as e:
            logger.error(f"Failed to publish injury event: {str(e)}")
            raise

    @staticmethod
    async def publish_notification(match_id: str, message: str) -> int:
        """
        Publish generic notification (e.g., "Match delayed by 10 minutes").

        Args:
            match_id: Match identifier
            message: Notification message

        Returns:
            Number of subscribers
        """
        try:
            num_subscribers = await pubsub_manager.publish_notification(
                match_id, message
            )

            logger.info(
                "notification_published",
                extra={
                    "match_id": match_id,
                    "message": message,
                    "subscribers": num_subscribers,
                },
            )

            return num_subscribers

        except Exception as e:
            logger.error(f"Failed to publish notification: {str(e)}")
            raise

    @staticmethod
    async def publish_system_alert(message: str) -> int:
        """
        Publish system-wide alert (e.g., "Server maintenance in 5 minutes").

        Args:
            message: Alert message

        Returns:
            Number of subscribers
        """
        try:
            num_subscribers = await pubsub_manager.publish_system_alert(message)

            logger.warning(
                "system_alert_published",
                extra={
                    "message": message,
                    "subscribers": num_subscribers,
                },
            )

            return num_subscribers

        except Exception as e:
            logger.error(f"Failed to publish system alert: {str(e)}")
            raise


# Singleton instance for convenience
event_publisher = EventPublisher()

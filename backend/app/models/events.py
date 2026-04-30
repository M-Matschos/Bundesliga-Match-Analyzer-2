"""
Pydantic models for WebSocket events and real-time match updates.

Defines all event types for live match streaming:
- Match lifecycle (start, end, pause, resume)
- Playing events (goals, shots, passes)
- Disciplinary events (yellow/red cards)
- Tactical events (substitutions, formations)
- Stats updates (possession, xG, fouls)
"""

from datetime import datetime
from typing import Optional, List, Any
from enum import Enum
from pydantic import BaseModel, Field, field_validator


# ===== EVENT TYPE ENUMS =====


class EventType(str, Enum):
    """All possible event types in a live match."""

    # Match lifecycle
    MATCH_START = "match_start"
    MATCH_END = "match_end"
    MATCH_PAUSE = "match_pause"
    MATCH_RESUME = "match_resume"
    HALF_TIME = "half_time"

    # Goals and shots
    GOAL = "goal"
    SHOT = "shot"
    ASSIST = "assist"

    # Disciplinary
    YELLOW_CARD = "yellow_card"
    RED_CARD = "red_card"
    VAR_REVIEW = "var_review"
    VAR_DECISION = "var_decision"

    # Tactical
    SUBSTITUTION = "substitution"
    FORMATION_CHANGE = "formation_change"
    INJURY = "injury"
    TIMEOUT = "timeout"

    # Stats
    POSSESSION_UPDATE = "possession_update"
    STATS_UPDATE = "stats_update"
    XG_UPDATE = "xg_update"
    CORNER = "corner"
    FOUL = "foul"
    OFFSIDE = "offside"
    THROW_IN = "throw_in"


class Team(str, Enum):
    """Team identifier in match."""

    HOME = "home"
    AWAY = "away"


class ShotResult(str, Enum):
    """Outcome of a shot."""

    GOAL = "goal"
    SAVED = "saved"
    BLOCKED = "blocked"
    OFF_TARGET = "off_target"
    CROSSBAR = "crossbar"
    POST = "post"


class CardType(str, Enum):
    """Card type in disciplinary events."""

    YELLOW = "yellow"
    RED = "red"
    SECOND_YELLOW = "second_yellow"


class VARDecisionType(str, Enum):
    """VAR review decision outcome."""

    GOAL_STAND = "goal_stand"
    GOAL_DISALLOWED = "goal_disallowed"
    NO_PENALTY = "no_penalty"
    PENALTY_AWARDED = "penalty_awarded"
    RED_CARD_UPHELD = "red_card_upheld"
    RED_CARD_OVERTURNED = "red_card_overturned"
    NO_FOUL = "no_foul"
    FOUL_CONFIRMED = "foul_confirmed"


# ===== BASE EVENT =====


class BaseEvent(BaseModel):
    """Base event that all specific events inherit from."""

    event_type: EventType = Field(..., description="Type of event")
    match_id: str = Field(..., description="External match ID")
    timestamp: datetime = Field(..., description="Event timestamp (UTC)")
    minute: int = Field(..., ge=0, le=120, description="Match minute")
    is_live: bool = Field(default=True, description="Whether event is from live match")

    class Config:
        """Pydantic config."""

        use_enum_values = True


# ===== MATCH LIFECYCLE EVENTS =====


class MatchStartEvent(BaseEvent):
    """Match has started."""

    event_type: EventType = Field(default=EventType.MATCH_START)
    team_lineups: Optional[dict] = Field(
        None, description="Initial team lineups {home: [...], away: [...]}"
    )


class MatchEndEvent(BaseEvent):
    """Match has ended."""

    event_type: EventType = Field(default=EventType.MATCH_END)
    final_score: dict = Field(..., description="Final score {home: int, away: int}")


class HalfTimeEvent(BaseEvent):
    """Half-time break."""

    event_type: EventType = Field(default=EventType.HALF_TIME)
    halftime_score: dict = Field(..., description="Score at half-time")


class MatchPauseEvent(BaseEvent):
    """Match paused (e.g., injury timeout)."""

    event_type: EventType = Field(default=EventType.MATCH_PAUSE)
    reason: Optional[str] = Field(None, description="Pause reason")


class MatchResumeEvent(BaseEvent):
    """Match resumed after pause."""

    event_type: EventType = Field(default=EventType.MATCH_RESUME)


# ===== GOALS & SHOTS =====


class GoalEvent(BaseEvent):
    """Goal scored event."""

    event_type: EventType = Field(default=EventType.GOAL)
    team: Team = Field(..., description="Scoring team")
    player_name: str = Field(..., description="Goal scorer name")
    player_id: Optional[str] = Field(None, description="Goal scorer ID")
    assist_player_name: Optional[str] = Field(None, description="Assist player name")
    assist_player_id: Optional[str] = Field(None, description="Assist player ID")
    is_penalty: bool = Field(default=False, description="Whether goal was from penalty")
    is_own_goal: bool = Field(default=False, description="Whether own goal")
    score_before: dict = Field(..., description="Score before goal")
    score_after: dict = Field(..., description="Score after goal")
    xg_value: Optional[float] = Field(None, ge=0, le=1, description="Expected goals value")

    @field_validator("team")
    @classmethod
    def validate_team(cls, v):
        """Validate team is home or away."""
        if isinstance(v, str):
            return Team(v)
        return v


class ShotEvent(BaseEvent):
    """Shot on goal event."""

    event_type: EventType = Field(default=EventType.SHOT)
    team: Team = Field(..., description="Team taking shot")
    player_name: str = Field(..., description="Player taking shot")
    player_id: Optional[str] = Field(None, description="Player ID")
    result: ShotResult = Field(..., description="Outcome of shot")
    xg_value: float = Field(..., ge=0, le=1, description="Expected goals value")
    distance_yards: Optional[float] = Field(None, description="Shot distance in yards")


# ===== DISCIPLINARY EVENTS =====


class CardEvent(BaseEvent):
    """Yellow or red card event."""

    event_type: EventType = Field(default=EventType.YELLOW_CARD)
    team: Team = Field(..., description="Team of player receiving card")
    player_name: str = Field(..., description="Player name")
    player_id: Optional[str] = Field(None, description="Player ID")
    card_type: CardType = Field(..., description="Yellow or red card")
    offense: Optional[str] = Field(None, description="Offense description")


class VARReviewEvent(BaseEvent):
    """VAR review initiated."""

    event_type: EventType = Field(default=EventType.VAR_REVIEW)
    review_reason: str = Field(..., description="Reason for review")
    review_team: Optional[Team] = Field(None, description="Team being reviewed (if applicable)")


class VARDecisionEvent(BaseEvent):
    """VAR review decision."""

    event_type: EventType = Field(default=EventType.VAR_DECISION)
    decision: VARDecisionType = Field(..., description="VAR decision outcome")
    review_duration_seconds: int = Field(..., ge=0, description="Duration of review")
    decision_reason: Optional[str] = Field(None, description="Reason for decision")


# ===== TACTICAL EVENTS =====


class SubstitutionEvent(BaseEvent):
    """Player substitution event."""

    event_type: EventType = Field(default=EventType.SUBSTITUTION)
    team: Team = Field(..., description="Team making substitution")
    player_off_name: str = Field(..., description="Player being substituted off")
    player_off_id: Optional[str] = Field(None, description="Player off ID")
    player_on_name: str = Field(..., description="Player coming on")
    player_on_id: Optional[str] = Field(None, description="Player on ID")
    reason: Optional[str] = Field(None, description="Substitution reason (injury, tactical)")


class InjuryEvent(BaseEvent):
    """Player injury event."""

    event_type: EventType = Field(default=EventType.INJURY)
    team: Team = Field(..., description="Team with injured player")
    player_name: str = Field(..., description="Injured player name")
    player_id: Optional[str] = Field(None, description="Player ID")
    severity: str = Field(..., description="Severity (minor, moderate, severe)")
    expected_return_minute: Optional[int] = Field(
        None, description="Estimated return to play minute"
    )


class FormationChangeEvent(BaseEvent):
    """Team formation change."""

    event_type: EventType = Field(default=EventType.FORMATION_CHANGE)
    team: Team = Field(..., description="Team changing formation")
    new_formation: str = Field(..., description="New formation (e.g. '4-3-3')")
    old_formation: Optional[str] = Field(None, description="Previous formation")


class TimeoutEvent(BaseEvent):
    """Official timeout or stoppage."""

    event_type: EventType = Field(default=EventType.TIMEOUT)
    timeout_type: str = Field(..., description="Timeout type (injury, VAR, etc.)")
    duration_seconds: int = Field(..., ge=0, description="Timeout duration")


# ===== STATS EVENTS =====


class PossessionUpdateEvent(BaseEvent):
    """Possession percentage update."""

    event_type: EventType = Field(default=EventType.POSSESSION_UPDATE)
    home_possession: float = Field(..., ge=0, le=100, description="Home team possession %")
    away_possession: float = Field(..., ge=0, le=100, description="Away team possession %")


class CornerEvent(BaseEvent):
    """Corner kick awarded."""

    event_type: EventType = Field(default=EventType.CORNER)
    team: Team = Field(..., description="Team awarded corner")
    corner_number: int = Field(..., ge=1, description="Corner number in match")


class FoulEvent(BaseEvent):
    """Foul committed."""

    event_type: EventType = Field(default=EventType.FOUL)
    team: Team = Field(..., description="Team committing foul")
    player_name: str = Field(..., description="Player committing foul")
    player_id: Optional[str] = Field(None, description="Player ID")
    foul_type: str = Field(..., description="Type of foul")
    is_penalty: bool = Field(default=False, description="Whether penalty foul")


class OffSideEvent(BaseEvent):
    """Offside called."""

    event_type: EventType = Field(default=EventType.OFFSIDE)
    team: Team = Field(..., description="Team in offside position")
    player_name: str = Field(..., description="Player in offside")
    player_id: Optional[str] = Field(None, description="Player ID")


class StatsUpdateEvent(BaseModel):
    """Comprehensive match stats update."""

    event_type: str = "stats_update"
    match_id: str = Field(..., description="Match ID")
    timestamp: datetime = Field(..., description="Update timestamp")
    minute: int = Field(..., description="Match minute")

    # Possession
    home_possession: float = Field(..., ge=0, le=100, description="Home possession %")
    away_possession: float = Field(..., ge=0, le=100, description="Away possession %")

    # Shots
    home_shots: int = Field(..., ge=0, description="Home team shots")
    away_shots: int = Field(..., ge=0, description="Away team shots")
    home_shots_on_target: int = Field(..., ge=0, description="Home shots on target")
    away_shots_on_target: int = Field(..., ge=0, description="Away shots on target")

    # Expected Goals (xG)
    home_xg: float = Field(..., ge=0, description="Home team expected goals")
    away_xg: float = Field(..., ge=0, description="Away team expected goals")

    # Passes
    home_passes: int = Field(..., ge=0, description="Home team completed passes")
    away_passes: int = Field(..., ge=0, description="Away team completed passes")
    home_pass_accuracy: float = Field(
        ..., ge=0, le=100, description="Home pass accuracy %"
    )
    away_pass_accuracy: float = Field(
        ..., ge=0, le=100, description="Away pass accuracy %"
    )

    # Fouls & Cards
    home_fouls: int = Field(..., ge=0, description="Home team fouls")
    away_fouls: int = Field(..., ge=0, description="Away team fouls")
    home_yellow_cards: int = Field(..., ge=0, description="Home yellow cards")
    away_yellow_cards: int = Field(..., ge=0, description="Away yellow cards")
    home_red_cards: int = Field(..., ge=0, description="Home red cards")
    away_red_cards: int = Field(..., ge=0, description="Away red cards")

    # Set pieces
    home_corners: int = Field(..., ge=0, description="Home team corners")
    away_corners: int = Field(..., ge=0, description="Away team corners")
    home_offsides: int = Field(..., ge=0, description="Home team offsides")
    away_offsides: int = Field(..., ge=0, description="Away team offsides")

    # Other
    home_tackles: int = Field(..., ge=0, description="Home tackles")
    away_tackles: int = Field(..., ge=0, description="Away tackles")
    home_interceptions: int = Field(..., ge=0, description="Home interceptions")
    away_interceptions: int = Field(..., ge=0, description="Away interceptions")


# ===== WEBSOCKET MESSAGE WRAPPER =====


class WebSocketMessage(BaseModel):
    """JSON-RPC 2.0 wrapper for WebSocket messages."""

    # JSON-RPC fields
    jsonrpc: str = Field(default="2.0", description="JSON-RPC version")
    id: Optional[str] = Field(None, description="Request ID for responses")

    # Message fields
    method: Optional[str] = Field(None, description="Method name (e.g. 'event')")
    params: Optional[dict] = Field(None, description="Parameters (contains event)")

    # Response fields
    result: Optional[dict] = Field(None, description="Result object")
    error: Optional[dict] = Field(None, description="Error object {code, message}")

    # Event as union type
    event: Optional[BaseEvent] = Field(None, description="Embedded event object")

    class Config:
        """Pydantic config."""

        use_enum_values = True
        arbitrary_types_allowed = True


# ===== RESPONSE WRAPPERS =====


class EventResponse(BaseModel):
    """Standard response wrapper for events."""

    success: bool = Field(..., description="Whether event was processed")
    event_type: EventType = Field(..., description="Type of event")
    timestamp: datetime = Field(..., description="Response timestamp")
    message: Optional[str] = Field(None, description="Optional message")


class BroadcastMessage(BaseModel):
    """Message to broadcast to all connections."""

    type: str = Field(..., description="Message type (event, status, error)")
    data: dict = Field(..., description="Message data")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    match_id: Optional[str] = Field(None, description="Associated match ID")

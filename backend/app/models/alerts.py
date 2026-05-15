"""
Alert System Models — NLP-powered breaking news monitoring
Klassifiziert News-Events nach Wett-Relevanz (Verletzungen, Tactical Changes, etc.)
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Column,
    String,
    DateTime,
    Float,
    Boolean,
    Integer,
    Text,
    Enum as SQLEnum,
)
from sqlalchemy.orm import declarative_base
from enum import Enum

Base = declarative_base()


class AlertType(str, Enum):
    """Alert Classification"""

    INJURY = "injury"  # Spieler verletzt
    SUSPENSION = "suspension"  # Spielsperre
    TACTICAL_CHANGE = "tactical"  # Formation/Taktik-Änderung
    MANAGER_CHANGE = "manager"  # Trainer-Wechsel
    TRANSFER = "transfer"  # Transfer-News
    WEATHER = "weather"  # Extremes Wetter
    VENUE_CHANGE = "venue"  # Platz-Wechsel
    TEAM_NEWS = "team_news"  # Sonstiges Team-News
    ODDS_MOVEMENT = "odds"  # Verdächtige Quoten-Bewegung
    EXTERNAL = "external"  # Externe Events


class AlertPriority(str, Enum):
    """Alert Importance for User"""

    CRITICAL = "critical"  # Sofort: Spieler aus
    HIGH = "high"  # Wichtig: Formation-Änderung
    MEDIUM = "medium"  # Standard: Transfer-Gerüchte
    LOW = "low"  # Info: Allgemeines News


class NewsSource(str, Enum):
    """Datenquellen"""

    TWITTER = "twitter"
    REDDIT = "reddit"
    OFFICIAL = "official"  # Team offizielle Accounts
    RSS = "rss"  # News RSS Feeds
    API = "api"  # Externe APIs (transfermarkt, etc.)


class NewsAlert(Base):
    """Breaking News Alert — einzelnes Event"""

    __tablename__ = "news_alerts"

    id = Column(String, primary_key=True, index=True)  # UUID

    # Klassifikation
    alert_type = Column(SQLEnum(AlertType), index=True)
    priority = Column(SQLEnum(AlertPriority), index=True)
    source = Column(SQLEnum(NewsSource))

    # Inhalt
    title = Column(String(500), nullable=False)
    description = Column(Text)
    raw_text = Column(Text)  # Original-Text vom Scraper

    # NLP Scores
    relevance_score = Column(Float, default=0.0)  # 0-1: Wie relevant für Wetten?
    confidence = Column(Float, default=0.0)  # 0-1: Modell-Confidence
    nlp_tags = Column(String)  # JSON: ["injury", "bayern", "sane"]

    # Betroffene Entities
    team_id = Column(String, index=True)  # Beteiligtes Team
    player_id = Column(String)  # Betroffener Spieler (optional)
    match_id = Column(String, index=True)  # Beteiligtes Match (wenn bekannt)

    # Metadata
    source_url = Column(String)
    published_at = Column(DateTime, index=True)  # Wann published die News?
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    expires_at = Column(DateTime)  # Wann ist Alert nicht mehr relevant?

    # Tracking
    is_verified = Column(Boolean, default=False)  # Wurde von Humans bestätigt?
    user_dismissed_count = Column(Integer, default=0)
    user_acted_count = Column(
        Integer, default=0
    )  # Wie viele Nutzer haben Aktion getroffen?

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserAlertSubscription(Base):
    """User Alert Preferences"""

    __tablename__ = "user_alert_subscriptions"

    id = Column(String, primary_key=True)
    user_id = Column(String, index=True)

    # Was interessiert den Nutzer?
    alert_types = Column(String)  # JSON: ["injury", "tactical", "odds"]
    min_priority = Column(SQLEnum(AlertPriority), default=AlertPriority.MEDIUM)

    # Push/Email Preferences
    enable_push = Column(Boolean, default=True)
    enable_email = Column(Boolean, default=False)
    push_on_critical_only = Column(Boolean, default=False)

    # Team-spezifisch
    favorite_teams = Column(String)  # JSON: ["bayern", "bvb"]
    favorite_players = Column(String)  # JSON: ["sane", "haaland"]

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AlertImpact(Base):
    """Wie sehr beeinflussen Alerts die Odds/Predictions?"""

    __tablename__ = "alert_impacts"

    id = Column(String, primary_key=True)
    alert_id = Column(String, index=True)

    # Betroffene Matches
    affected_matches = Column(String)  # JSON: ["match_123", "match_456"]

    # Predicted Impact auf Odds
    odds_shift_percent = Column(Float)  # z.B. -5.2 (Odds fallen 5.2%)
    confidence_shift = Column(Float)  # -0.08 (Confidence sinkt um 8%)

    # Historical Accuracy
    past_alerts_same_type = Column(Integer)  # Wie viele ähnliche Alerts gab es?
    historical_accuracy = Column(Float)  # Wie oft trat das ein? (0-1)

    created_at = Column(DateTime, default=datetime.utcnow)

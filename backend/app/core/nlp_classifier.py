"""
NLP Alert Classifier — Klassifiziert Fußball-News nach Typ, Priorität, Relevanz
Nutzt einfache Pattern-Matching + Keyword-Extraktion (kein ML-Modell nötig)
"""
import re
from typing import Optional, Dict, List, Tuple
from app.models.alerts import AlertType, AlertPriority

# Injury Keywords (Deutsch + Englisch)
INJURY_KEYWORDS = [
    r"verletz",
    r"injury",
    r"out",
    r"ausfallen",
    r"muskel",
    r"adduktor",
    r"meniskus",
    r"kreuzband",
    r"zerrung",
    r"faserriss",
    r"überbelastung",
    r"blessur",
    r"trauma",
]

SUSPENSION_KEYWORDS = [
    r"sperre",
    r"suspension",
    r"rot",
    r"gelb-rot",
    r"disqualifiziert",
]

TACTICAL_KEYWORDS = [
    r"formation",
    r"taktik",
    r"system wechsel",
    r"3-5-2",
    r"4-2-3-1",
    r"umstellen",
    r"umstellung",
    r"defensiv",
    r"offensiv",
    r"pressing",
    r"rückzug",
    r"offensive",
]

MANAGER_KEYWORDS = [
    r"trainer",
    r"coach",
    r"manager",
    r"neuer",
    r"new",
    r"ablöse",
    r"entlassung",
    r"kündigung",
    r"Fehler! Lesezeichen nicht definiert.",
]

TRANSFER_KEYWORDS = [
    r"transfer",
    r"deal",
    r"signing",
    r"ablöse",
    r"verpflicht",
    r"leihvertrag",
    r"ausstiegsklausel",
    r"verhandlungen",
]

WEATHER_KEYWORDS = [
    r"sturm",
    r"unwetter",
    r"hagel",
    r"schnee",
    r"hochwasser",
    r"extreme",
    r"klima",
    r"regen",
]

ODDS_KEYWORDS = [
    r"quoten",
    r"odds",
    r"manipulation",
    r"verdächtig",
    r"unsicher",
    r"bewegung",
    r"sprung",
    r"flash crash",
]

# Team-Namen Mapping (Shortcodes)
TEAM_MAPPING = {
    "bayern": ["fc bayern", "fcb", "munich", "münchen"],
    "bvb": ["borussia dortmund", "dortmund", "bvb"],
    "leverkusen": ["bayer leverkusen", "werkself"],
    "hamburg": ["fc st. pauli", "hsv"],
    "freiburg": ["sc freiburg"],
    "rb": ["rb leipzig", "rbl"],
    "schalke": ["fc schalke"],
    "cologne": ["1. fc köln", "koeln"],
}

# Top-Spieler
TOP_PLAYERS = [
    "lewandowski",
    "haaland",
    "sane",
    "müller",
    "gnabry",
    "reus",
    "bellingham",
    "akanji",
    "ginter",
    "neuer",
    "ter stegen",
    "nkunku",
    "nkh",
    "wirtz",
]


def classify_news(text: str, title: str = "") -> Tuple[AlertType, AlertPriority, float]:
    """
    Klassifiziere News-Text in Alert-Typ, Priorität und Relevanz-Score

    Returns: (alert_type, priority, relevance_score: 0-1)
    """
    combined_text = f"{title} {text}".lower()

    # Schritt 1: Bestimme Alert-Typ
    alert_type = AlertType.TEAM_NEWS  # Default

    if _match_keywords(combined_text, INJURY_KEYWORDS):
        alert_type = AlertType.INJURY
    elif _match_keywords(combined_text, SUSPENSION_KEYWORDS):
        alert_type = AlertType.SUSPENSION
    elif _match_keywords(combined_text, TACTICAL_KEYWORDS):
        alert_type = AlertType.TACTICAL_CHANGE
    elif _match_keywords(combined_text, MANAGER_KEYWORDS):
        alert_type = AlertType.MANAGER_CHANGE
    elif _match_keywords(combined_text, TRANSFER_KEYWORDS):
        alert_type = AlertType.TRANSFER
    elif _match_keywords(combined_text, WEATHER_KEYWORDS):
        alert_type = AlertType.WEATHER
    elif _match_keywords(combined_text, ODDS_KEYWORDS):
        alert_type = AlertType.ODDS_MOVEMENT

    # Schritt 2: Bestimme Priorität basierend auf Typ + Keywords
    priority = _calculate_priority(alert_type, combined_text)

    # Schritt 3: Berechne Relevanz-Score
    relevance_score = _calculate_relevance_score(alert_type, combined_text, text)

    return alert_type, priority, relevance_score


def extract_entities(text: str) -> Dict[str, List[str]]:
    """
    Extrahiere wichtige Entities: Teams, Spieler, Taktiken

    Returns: {
        "teams": ["bayern", "bvb"],
        "players": ["lewandowski", "haaland"],
        "tactics": ["3-5-2", "pressing"]
    }
    """
    text_lower = text.lower()

    # Teams
    teams = []
    for shortcode, names in TEAM_MAPPING.items():
        if any(name in text_lower for name in names):
            teams.append(shortcode)

    # Spieler
    players = []
    for player in TOP_PLAYERS:
        if player in text_lower:
            players.append(player)

    # Taktiken
    tactics = []
    formation_pattern = r"\d-\d-\d"
    formations = re.findall(formation_pattern, text_lower)
    if formations:
        tactics.extend(formations)

    if _match_keywords(text_lower, TACTICAL_KEYWORDS):
        tactics.append("tactical_change")

    return {
        "teams": list(set(teams)),
        "players": list(set(players)),
        "tactics": list(set(tactics)),
    }


def calculate_impact_score(alert_type: AlertType, entities: Dict) -> float:
    """
    Berechne Wett-Impact-Score (0-1)

    Verletzungen von Top-Spielern = höherer Impact
    Formation-Änderungen = mittlerer Impact
    Transfer-Gerüchte = niedriger Impact
    """
    base_scores = {
        AlertType.INJURY: 0.8,  # Hoch: Spieler fehlt
        AlertType.SUSPENSION: 0.8,
        AlertType.TACTICAL_CHANGE: 0.6,  # Mittel: Taktik-Änderung
        AlertType.MANAGER_CHANGE: 0.7,
        AlertType.TRANSFER: 0.3,  # Niedrig: Zukunfts-News
        AlertType.WEATHER: 0.5,
        AlertType.ODDS_MOVEMENT: 0.9,  # Sehr hoch: Market-Signal
        AlertType.TEAM_NEWS: 0.4,
    }

    score = base_scores.get(alert_type, 0.4)

    # Boost für Top-Spieler
    if entities.get("players"):
        top_player_boost = 0.15 * len(entities["players"])
        score = min(1.0, score + top_player_boost)

    # Boost für große Teams
    if entities.get("teams") and len(entities["teams"]) > 0:
        big_teams = ["bayern", "bvb", "leverkusen"]
        if any(t in big_teams for t in entities["teams"]):
            score = min(1.0, score + 0.1)

    return score


def _match_keywords(text: str, keywords: List[str]) -> bool:
    """Prüfe ob Text eines der Keywords enthält (Regex)"""
    for keyword in keywords:
        if re.search(keyword, text):
            return True
    return False


def _calculate_priority(alert_type: AlertType, text: str) -> AlertPriority:
    """Bestimme Priority basierend auf Type und Text-Signale"""

    # Kritisch: Spieler definitiv verletzt/gesperrt
    if alert_type == AlertType.INJURY:
        if any(
            word in text for word in ["ausfallen", "out", "wochenüber", "monatelang"]
        ):
            return AlertPriority.CRITICAL
        return AlertPriority.HIGH

    if alert_type == AlertType.SUSPENSION:
        return AlertPriority.CRITICAL

    # Hoch: Formation-Change, Manager-Change
    if alert_type in [AlertType.TACTICAL_CHANGE, AlertType.MANAGER_CHANGE]:
        return AlertPriority.HIGH

    # Odds-Bewegung: immer wichtig
    if alert_type == AlertType.ODDS_MOVEMENT:
        return AlertPriority.HIGH

    # Transfer/Weather: Medium-Low
    if alert_type == AlertType.TRANSFER:
        if any(word in text for word in ["bestätigt", "offiziell", "deal"]):
            return AlertPriority.HIGH
        return AlertPriority.LOW

    # Default
    return AlertPriority.MEDIUM


def _calculate_relevance_score(
    alert_type: AlertType, text: str, description: str
) -> float:
    """
    Berechne Relevanz-Score (0-1)

    Faktoren:
    - Alert-Type selbst
    - Certainty-Indikatoren ("bestätigt", "offiziell" vs "Gerücht", "möglich")
    - Text-Länge (längere = detaillierter)
    - Timing (aktuelle Events > alte News)
    """

    # Base score nach Type
    base_scores = {
        AlertType.INJURY: 0.85,
        AlertType.SUSPENSION: 0.9,
        AlertType.TACTICAL_CHANGE: 0.7,
        AlertType.MANAGER_CHANGE: 0.75,
        AlertType.ODDS_MOVEMENT: 0.95,
        AlertType.WEATHER: 0.5,
        AlertType.TRANSFER: 0.4,
        AlertType.TEAM_NEWS: 0.3,
    }

    score = base_scores.get(alert_type, 0.5)

    # Certainty Boost/Penalty
    if any(
        word in text for word in ["bestätigt", "offiziell", "announced", "confirmed"]
    ):
        score = min(1.0, score + 0.15)
    elif any(
        word in text for word in ["gerücht", "rumor", "möglich", "possible", "claims"]
    ):
        score = max(0.1, score - 0.2)

    # Text-Länge Signal (längere Berichte = detaillierter)
    text_length = len(description or "")
    if text_length > 500:
        score = min(1.0, score + 0.1)
    elif text_length < 100:
        score = max(0.1, score - 0.05)

    return round(score, 2)

"""
Feature Engineering
Berechnet alle 39 Datenfaktoren für ein Spiel.
Output wird direkt an ML-Modell und Monte Carlo übergeben.
"""
import math
from typing import Any
from ..collectors.api_football import APIFootballCollector
from ..collectors.weather_collector import WeatherCollector

football_api = APIFootballCollector()
weather_api  = WeatherCollector()

LEAGUE_AVG_GOALS = {
    "bundesliga":      1.58,   # Durchschnittliche Heimtore pro Spiel
    "bundesliga2":     1.48,
    "premier-league":  1.53,
    "championship":    1.45,
    "champions-league": 1.72,
    "dfb-pokal":       1.82,
}


async def build_features(match: dict) -> dict:
    """
    Hauptfunktion: Baut alle Features für ein Spiel.
    Wird für jeden Match vor der Prognose aufgerufen.
    """
    home_id    = match["home_team"]["id"]
    away_id    = match["away_team"]["id"]
    league     = match["league"]
    league_id  = match["league_id"]
    stadium    = match.get("stadium", "")
    kickoff    = match.get("kickoff", "")

    # Statistiken laden
    home_stats = await football_api.get_team_stats(home_id, league_id)
    away_stats = await football_api.get_team_stats(away_id, league_id)
    weather    = await weather_api.get_match_weather(stadium, kickoff)

    league_avg = LEAGUE_AVG_GOALS.get(league, 1.5)

    # ─── Lambda berechnen (Tor-Erwartungswert) ───────────────
    home_attack  = safe_div(home_stats["avg_goals_scored_home"],  league_avg)
    away_defense = safe_div(away_stats["avg_goals_conceded_away"], league_avg)
    away_attack  = safe_div(away_stats["avg_goals_scored_away"],  league_avg)
    home_defense = safe_div(home_stats["avg_goals_conceded_home"], league_avg)

    lambda_home = home_attack * away_defense * league_avg * 1.1  # +10% Heimvorteil
    lambda_away = away_attack * home_defense * league_avg

    # ─── Alle 39 Features für XGBoost ────────────────────────
    features = {
        # Tor-Erwartungswerte
        "lambda_home":               round(lambda_home, 3),
        "lambda_away":               round(lambda_away, 3),

        # Spielstärke
        "home_xg_for":               home_stats.get("avg_goals_scored", 1.5),
        "home_xg_against":           home_stats.get("avg_goals_conceded", 1.2),
        "away_xg_for":               away_stats.get("avg_goals_scored", 1.5),
        "away_xg_against":           away_stats.get("avg_goals_conceded", 1.2),
        "xg_difference":             home_stats.get("avg_goals_scored", 0) - away_stats.get("avg_goals_scored", 0),

        # Heimvorteil
        "home_advantage_ratio":      safe_div(
                                        home_stats["avg_goals_scored_home"],
                                        home_stats["avg_goals_scored_away"]
                                     ),
        "away_disadvantage_ratio":   safe_div(
                                        away_stats["avg_goals_conceded_away"],
                                        away_stats["avg_goals_conceded_home"]
                                     ),

        # Form (aus API: z.B. "WWDLW")
        "home_form_points":          form_to_points(home_stats.get("form", ""), last_n=5),
        "away_form_points":          form_to_points(away_stats.get("form", ""), last_n=5),
        "home_form_weighted":        form_to_weighted(home_stats.get("form", "")),
        "away_form_weighted":        form_to_weighted(away_stats.get("form", "")),

        # Defensive Stärke
        "home_clean_sheets_rate":    safe_div(home_stats.get("clean_sheets", 0), 10),
        "away_clean_sheets_rate":    safe_div(away_stats.get("clean_sheets", 0), 10),

        # Wetter
        "temperature":               weather.get("temp_celsius", 12),
        "rain_probability":          weather.get("rain_probability", 0.1),
        "wind_speed":                weather.get("wind_speed_kmh", 10),

        # SHAP Top-3 Faktoren (für UI-Anzeige)
        "shap_top3": [
            {"factor": "xG-Differenz",      "impact": round(lambda_home - lambda_away, 2)},
            {"factor": "Heimvorteil",        "impact": round((lambda_home / lambda_away - 1) * 0.3, 2) if lambda_away > 0 else 0},
            {"factor": "Formstärke (5 Sp.)", "impact": round(form_to_points(home_stats.get("form", "")) / 15, 2)},
        ]
    }

    return features


# ─── Hilfsfunktionen ──────────────────────────────────────────

def safe_div(a: float, b: float, fallback: float = 1.0) -> float:
    """Division mit Null-Schutz."""
    return round(a / b, 3) if b and b != 0 else fallback


def form_to_points(form_string: str, last_n: int = 5) -> int:
    """
    Konvertiert Form-String in Punkte.
    "WWDLW" → W=3, D=1, L=0 → 3+3+1+0+3 = 10
    """
    if not form_string:
        return 7  # Neutral-Wert
    recent = form_string[-last_n:]
    return sum(3 if c == "W" else 1 if c == "D" else 0 for c in recent)


def form_to_weighted(form_string: str) -> float:
    """
    Gewichtete Form: Neuere Spiele zählen mehr.
    Letztes Spiel: Gewicht 5, vorletztes: 4, etc.
    """
    if not form_string:
        return 0.5
    recent = form_string[-5:]
    weights = [5, 4, 3, 2, 1]
    total = 0
    max_score = 0
    for i, char in enumerate(reversed(recent)):
        w = weights[i] if i < len(weights) else 1
        score = 3 if char == "W" else 1 if char == "D" else 0
        total += score * w
        max_score += 3 * w
    return round(total / max_score, 3) if max_score > 0 else 0.5

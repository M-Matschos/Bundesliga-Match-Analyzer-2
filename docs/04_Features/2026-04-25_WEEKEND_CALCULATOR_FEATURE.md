# ⭐ Weekend Match Calculator

> Mit einem Knopfdruck alle Wochenend-Spiele berechnen — das Herzstück von Match Oracle.

---

## Funktionsbeschreibung

Mit dem **Weekend Match Calculator** lädt die App automatisch alle anstehenden Begegnungen der gewählten Ligen, führt alle mathematischen Modelle durch und zeigt vollständige Prognosen im Dashboard an.

---

## UI-Flow im Dashboard

```
┌─────────────────────────────────────────────────┐
│  📅 Spieltag 28 — 29./30. März 2026             │
│                                                 │
│  Ligen wählen:                                  │
│  [✅ BL1] [✅ BL2] [☐ UCL] [☐ DFB] [☐ PL]     │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │  🔄  ALLE SPIELE JETZT BERECHNEN          │  │
│  │      14 Begegnungen · ~12 Sekunden        │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  Fortschritt: ████████░░░░  65%                 │
│  "Berechne Leverkusen vs Leipzig..."            │
└─────────────────────────────────────────────────┘
```

---

## Berechnungs-Pipeline (pro Klick)

```
KNOPFDRUCK
    │
    ├─[1] API: football-data.org → alle Spiele Fr–Mo
    ├─[2] Parallel pro Spiel:
    │      ├── Poisson-Modell         (~10ms)
    │      ├── Dixon-Coles-Korrektur  (~10ms)
    │      ├── Elo-Rating             (~5ms)
    │      ├── xG letzte 5 Spiele     (~10ms)
    │      ├── Verletzungen/Sperren   (~15ms)
    │      ├── Wetterdaten            (~20ms)
    │      └── Monte Carlo (100k)     (~200ms)
    ├─[3] XGBoost ML-Ensemble → finale Wahrscheinlichkeiten
    ├─[4] SHAP-Werte → Erklärungen pro Faktor
    ├─[5] Value-Bet-Detection vs. Bookmaker-Quoten
    └─[6] In DB speichern + Dashboard aktualisieren

Gesamtdauer: ~8–15 Sekunden für alle Wochenend-Spiele
```

---

## Backend: `backend/ml/weekend_calculator.py`

```python
import asyncio
from datetime import datetime, timedelta
from typing import List, Optional

class WeekendCalculator:
    """
    Hauptklasse: Berechnet alle Wochenend-Prognosen auf Knopfdruck.
    Ligen: BL1, BL2, UCL, DFB, PL, CHAMP
    """

    LEAGUE_IDS = {
        "BL1": 78,  # Bundesliga 1
        "BL2": 79,  # Bundesliga 2
        "UCL":  2,  # Champions League
        "DFB": 81,  # DFB-Pokal
        "PL":  39,  # Premier League
        "CHAMP": 40 # Championship
    }

    async def calculate_weekend(
        self,
        leagues: List[str] = ["BL1", "BL2"],
        date_from: Optional[datetime] = None,
        date_to:   Optional[datetime] = None,
        progress_callback = None,
    ) -> dict:
        """
        Hauptmethode — wird per Button-Klick ausgelöst.
        Gibt alle Prognosen zurück.
        """
        if date_from is None:
            date_from = self._get_next_friday()
        if date_to is None:
            date_to = date_from + timedelta(days=3)  # Fr–Mo

        results = {}
        for league_code in leagues:
            if progress_callback:
                await progress_callback(f"Lade {league_code}-Spiele...", 10)

            # Spiele dieser Liga abrufen
            matches = await self.collector.get_fixtures(
                league_id=self.LEAGUE_IDS[league_code],
                date_from=date_from,
                date_to=date_to,
            )

            # Alle Spiele PARALLEL berechnen (asyncio.gather)
            predictions = await asyncio.gather(*[
                self._calculate_single_match(m, progress_callback)
                for m in matches
            ])
            results[league_code] = predictions

        return {
            "status":        "success",
            "total_matches": sum(len(v) for v in results.values()),
            "leagues":       results,
            "calculated_at": datetime.utcnow().isoformat(),
        }

    async def _calculate_single_match(self, match: dict, callback=None) -> dict:
        """Berechnet eine Begegnung mit allen Modellen."""
        home_id  = match["teams"]["home"]["id"]
        away_id  = match["teams"]["away"]["id"]
        features = await self.features.build(home_id, away_id)

        lambda_home = (features["xg_home_avg"]
                       * features["attack_strength_home"]
                       * features["defense_strength_away"])
        lambda_away = (features["xg_away_avg"]
                       * features["attack_strength_away"]
                       * features["defense_strength_home"])

        dc_matrix  = self.dixon_coles.score_matrix(lambda_home, lambda_away)
        mc_result  = self.monte_carlo.simulate(lambda_home, lambda_away)  # 100k Runs
        elo_prob   = self.elo.win_prob(home_id, away_id)

        # Gewichtetes Ensemble
        home_win = 0.4*mc_result["home_win"] + 0.4*dc_matrix["home_win"] + 0.2*elo_prob
        draw     = 0.4*mc_result["draw"]     + 0.4*dc_matrix["draw"]     + 0.2*0.25
        away_win = 1.0 - home_win - draw

        confidence = max(0.1, min(1.0, 1.0 - mc_result["std"] / 0.3))

        return {
            "match_id":      match["fixture"]["id"],
            "home_team":     match["teams"]["home"]["name"],
            "away_team":     match["teams"]["away"]["name"],
            "home_logo":     match["teams"]["home"]["logo"],
            "away_logo":     match["teams"]["away"]["logo"],
            "kickoff":       match["fixture"]["date"],
            "home_win_prob": round(home_win, 3),
            "draw_prob":     round(draw, 3),
            "away_win_prob": round(away_win, 3),
            "confidence":    round(confidence, 3),
            "score_matrix":  mc_result["score_matrix"],
        }

    def _get_next_friday(self) -> datetime:
        today      = datetime.utcnow()
        days_ahead = 4 - today.weekday()
        if days_ahead <= 0:
            days_ahead += 7
        return today + timedelta(days=days_ahead)
```

---

## API-Endpoint

```
POST /api/v1/calculate/weekend

Body:
{
  "leagues": ["BL1", "BL2"],
  "date_from": "2026-03-28",
  "date_to":   "2026-03-30"
}

Response (Server-Sent Events):
data: {"status": "loading", "message": "Lade BL1-Spiele...",        "progress": 10}
data: {"status": "loading", "message": "Berechne Bayern vs BVB...", "progress": 35}
data: {"status": "loading", "message": "Monte Carlo läuft...",       "progress": 65}
data: {"status": "done",    "total_matches": 14, "data": { ... }}
```

---

## React Native Button

Datei: `mobile/src/components/WeekendCalculatorButton.tsx`

Der Button zeigt einen animierten Ladebalken mit Live-Fortschritts-Text während der Berechnung.
Implementierung mit Server-Sent Events (EventSource) für Echtzeit-Updates.

Liga-Toggles: BL1 / BL2 / UCL / DFB / PL / CHAMP — jeweils ein-/ausschaltbar.
Einzelspiel-Berechnung: Tap auf jede Match-Kachel triggert `POST /api/v1/calculate/match/{id}`.

---

## Performance-Überblick

| Maßnahme | Effekt |
|----------|--------|
| `asyncio.gather` (parallel) | 14 Spiele in ~12s statt ~3min |
| Redis-Cache (1h TTL) | Wiederholter Klick sofort |
| NumPy vektorisiertes Monte Carlo | 100k Runs in ~200ms |
| Pre-computed Features (2 Uhr tägl.) | Features bereits fertig |

---

*→ [README](../../README.md) · [Mathematische Modelle](../models/MATHEMATICAL_MODELS.md)*

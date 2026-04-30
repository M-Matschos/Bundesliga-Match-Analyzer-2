# 📊 Datenfaktoren (39 Features)

Alle Faktoren werden täglich um 2:00 Uhr UTC vorberechnet und in Redis gecacht.

---

## Vollständige Faktoren-Liste

| # | Kategorie | Faktor | Typ | Gewicht |
|---|-----------|--------|-----|---------|
| 1 | ⚽ Spielstärke | xG letzte 5 Spiele | Float | Sehr hoch |
| 2 | ⚽ Spielstärke | xGA letzte 5 Spiele | Float | Sehr hoch |
| 3 | ⚽ Spielstärke | Torquote Heim/Auswärts | Float | Hoch |
| 4 | ⚽ Spielstärke | Ballbesitz-Durchschnitt (%) | Float | Mittel |
| 5 | ⚽ Spielstärke | Passquote (%) | Float | Mittel |
| 6 | ⚽ Spielstärke | Schüsse pro Spiel | Int | Mittel |
| 7 | ⚽ Spielstärke | Schüsse aufs Tor / Spiel | Int | Hoch |
| 8 | 🏠 Heimvorteil | Heim-Siegquote (Saison) | Float | Hoch |
| 9 | 🏠 Heimvorteil | Heim-xG vs. Auswärts-xG | Float | Hoch |
| 10 | 🏠 Heimvorteil | Stadion-Auslastung (%) | Float | Mittel |
| 11 | 🏠 Heimvorteil | Reisedistanz Gegner (km) | Int | Niedrig |
| 12 | 🤕 Kader | Anzahl Verletzte (Top-11) | Int | Sehr hoch |
| 13 | 🤕 Kader | Anzahl Gesperrte | Int | Sehr hoch |
| 14 | 🤕 Kader | Marktwert-Verlust durch Ausfälle | Float | Hoch |
| 15 | 🤕 Kader | Tage seit letzter Vollstärke | Int | Mittel |
| 16 | 📅 Spielplan | Tage seit letztem Spiel | Int | Hoch |
| 17 | 📅 Spielplan | Spiele in letzten 14 Tagen | Int | Hoch |
| 18 | 📅 Spielplan | Champions-League-Belastung | Bool | Hoch |
| 19 | 📅 Spielplan | Nächstes Spiel in ≤ 3 Tagen | Bool | Mittel |
| 20 | 🧠 Form | Punkte letzte 5 Spiele (gewichtet) | Float | Sehr hoch |
| 21 | 🧠 Form | xG-Trend (steigend/fallend) | Float | Hoch |
| 22 | 🧠 Form | Tordifferenz letzte 5 Spiele | Int | Hoch |
| 23 | 🧠 Form | Clean Sheets letzte 5 Spiele | Int | Mittel |
| 24 | 🌦️ Wetter | Temperatur (°C) | Float | Niedrig |
| 25 | 🌦️ Wetter | Regenwahrscheinlichkeit (%) | Float | Mittel |
| 26 | 🌦️ Wetter | Windgeschwindigkeit (km/h) | Float | Niedrig |
| 27 | 🌦️ Wetter | Rasenzustand (Nass/Trocken) | Enum | Mittel |
| 28 | 👨‍💼 Trainer | Trainer-Elo-Rating | Float | Mittel |
| 29 | 👨‍💼 Trainer | Head-to-Head Trainer-Bilanz | Int | Mittel |
| 30 | 👨‍💼 Trainer | Tage im Amt | Int | Niedrig |
| 31 | 💰 Marktwert | Kader-Gesamtmarktwert (€) | Float | Mittel |
| 32 | 💰 Marktwert | Marktwert-Verhältnis Heim/Auswärts | Float | Mittel |
| 33 | 🔁 H2H | Direkte Vergleiche letzte 10 | Int | Mittel |
| 34 | 🔁 H2H | Tordifferenz H2H gesamt | Float | Niedrig |
| 35 | 🔁 H2H | H2H xG-Differenz | Float | Mittel |
| 36 | 📊 Liga | Tabellenplatz-Differenz | Int | Mittel |
| 37 | 📊 Liga | Punkte-Differenz | Int | Hoch |
| 38 | 📊 Liga | Abstiegszone / Europacup-Rennen | Bool | Hoch |
| 39 | 📊 Liga | Restspiele bis Saisonende | Int | Mittel |

---

## Feature Engineering: `backend/ml/features/feature_engineering.py`

```python
class FeatureEngineer:
    async def build(self, home_team_id: int, away_team_id: int) -> dict:
        """Baut den vollständigen 39-Feature-Vektor für eine Begegnung."""
        home = await self._team_features(home_team_id, is_home=True)
        away = await self._team_features(away_team_id, is_home=False)
        h2h  = await self._h2h_features(home_team_id, away_team_id)
        weather = await self._weather_features(home_team_id)

        return {**home, **away, **h2h, **weather}
```

---

## Datenquellen pro Faktor-Gruppe

| Kategorie | Quelle |
|-----------|--------|
| xG, Schüsse, Ballbesitz | API-Football |
| Verletzungen, Sperren | Transfermarkt (Scraper) + API-Football |
| Marktwerte | Transfermarkt |
| Wetterdaten | OpenWeatherMap API |
| H2H, Historik | football-data.org + eigene DB |
| Quoten | OddsAPI |

---

*→ [Mathematische Modelle](MATHEMATICAL_MODELS.md) · [ML Layer](ML_LAYER.md)*

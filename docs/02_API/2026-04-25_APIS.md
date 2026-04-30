# 🔌 Externe APIs & Datenquellen

---

## API-Übersicht

| API | Daten | Kosten | Priorität |
|-----|-------|--------|-----------|
| **API-Football** (RapidAPI) | xG, Aufstellungen, Live-Scores, Logos | ~15€/Mo | 🔴 Kritisch |
| **football-data.org** | Ergebnisse, Tabellen, Spielpläne | Kostenlos (Free Tier) | 🔴 Kritisch |
| **Transfermarkt** (Scraper) | Marktwerte, Verletzungen, Kader | Kostenlos (Fair Use) | 🟠 Wichtig |
| **OpenWeatherMap** | Wetterdaten für Stadion-Standorte | Kostenlos bis 1k/Tag | 🟠 Wichtig |
| **OddsAPI** | Wettquoten aller Bookmaker | ~25€/Mo | 🟠 Wichtig |
| **Statsbomb Open Data** | Historische xG-Daten | Kostenlos (GitHub) | 🟡 Mittel |
| **Twitter/X API** | Social-Media-Sentiment | Basis kostenlos | 🟡 Optional |
| **Tipico Affiliate** | Quoten, Deep-Links, CPA | Kostenlos (Partnerschaft) | 🟠 Wichtig |

---

## Einrichtungs-Anleitung

### API-Football (RapidAPI)
```
1. https://rapidapi.com/api-sports/api/api-football
2. Account erstellen → API-Key kopieren
3. In .env eintragen: API_FOOTBALL_KEY=xxx
4. Free-Plan: 100 Requests/Tag — reicht für Tests
5. Pro-Plan: ~15€/Mo für Produktionsbetrieb
```

### football-data.org
```
1. https://www.football-data.org/client/register
2. Kostenloser API-Key
3. In .env: FOOTBALL_DATA_KEY=xxx
4. Bundesliga Liga-ID: 2002
5. Premier League Liga-ID: 2021
```

### OddsAPI
```
1. https://the-odds-api.com
2. Free Tier: 500 Requests/Monat
3. Starter: ~25€/Mo (ausreichend)
4. In .env: ODDS_API_KEY=xxx
```

### OpenWeatherMap
```
1. https://openweathermap.org/api
2. Kostenlos bis 1.000 Calls/Tag
3. In .env: OPENWEATHER_KEY=xxx
```

---

## Daten-Mapping: Bundesliga-Ligen

| Liga | football-data.org ID | API-Football ID |
|------|---------------------|-----------------|
| Bundesliga 1 | 2002 | 78 |
| Bundesliga 2 | 2001 | 79 |
| Champions League | 2001 | 2 |
| DFB-Pokal | 2011 | 81 |
| Premier League | 2021 | 39 |
| Championship | 2016 | 40 |

---

*→ [System](SYSTEM.md) · [Tech Stack](TECH_STACK.md)*

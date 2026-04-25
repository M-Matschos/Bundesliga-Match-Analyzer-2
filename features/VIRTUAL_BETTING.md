# 🎮 Virtuelles Wetten

---

## Konzept

Das virtuelle Wett-System erlaubt risikofreie Simulation mit virtuellem Startkapital.
Ideal zum Testen von Strategien und zur Validierung der App-Prognosen über Zeit.

> **Wichtig:** Virtuelles Wetten ist kein echtes Glücksspiel.
> Kein echtes Geld — nur Simulation.

---

## Startkapital-Optionen

| Option | Virtuelles Kapital | Zurücksetzen |
|--------|-------------------|--------------|
| Einsteiger | 100 € | Jederzeit |
| Standard | 1.000 € | Jederzeit |
| Profi | 10.000 € | Jederzeit |
| Benutzerdefiniert | 100–100.000 € | Jederzeit |

---

## Unterstützte Wetttypen

- **1X2** — Heimsieg / Unentschieden / Auswärtssieg
- **BTTS** — Beide Teams treffen (Ja/Nein)
- **Over/Under** — Über/Unter 2.5, 3.5 Tore
- **Exact Score** — Genaues Ergebnis
- **Asian Handicap** — Handicap-Wetten
- **Doppelte / Dreifache** — Akkumulator-Wetten
- **System-Wetten** — Trixie, Patent, Heinz

---

## Features

### Strategie-Simulator (Backtest)
```
"Wie hätte meine Strategie in den letzten 2 Jahren performed?"

Eingabe:  Strategie (z.B. "immer Heimfavorit < 1.60 setzen")
Zeitraum: 2 Jahre zurück
Ausgabe:  ROI, Trefferquote, Max Drawdown, Sharpe Ratio
```

### Performance-Dashboard
- ROI gesamt und pro Liga / Wetttyp / Zeitraum
- Trefferquote nach Confidence-Level (High/Mid/Low)
- Beste und schlechteste Wetten
- Wöchentlicher Auto-Report (Push + Email)

### Leaderboard (optional)
- Anonymer Vergleich mit anderen Nutzern (Pseudonym)
- Wochensieger nach ROI
- Nur für Premium-Nutzer sichtbar

---

## API-Endpunkte

```
POST   /api/v1/virtual-bets/           → Wette platzieren
GET    /api/v1/virtual-bets/           → Eigene Wetten abrufen
GET    /api/v1/virtual-bets/stats/     → ROI, Trefferquote etc.
POST   /api/v1/virtual-bets/reset/     → Bankroll zurücksetzen
GET    /api/v1/virtual-bets/backtest/  → Strategie-Backtest
```

---

## Responsible Gaming Integration

- Hinweis bei jedem Start: "Dies ist eine Simulation — kein echtes Glücksspiel"
- Zeitlimit-Erinnerung nach 30 Minuten Nutzung
- Link zu bzga.de/gluecksspiel
- Selbstausschluss: Wett-Assistent + Virtual Betting deaktivierbar

---

*→ [Dashboard](DASHBOARD.md) · [Tipico Integration](TIPICO.md)*

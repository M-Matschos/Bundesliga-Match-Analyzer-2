# 🎰 Tipico-Integration

---

## Wichtiger Hinweis

> Tipico bietet **keine öffentliche Developer-API** für direkte Wettplatzierung.
> Die Integration erfolgt über das **offizielle Tipico Affiliate-Programm** und Deep-Links.

---

## Integrations-Methoden

### Option A: Deep-Links (empfohlen)
```
"Jetzt bei Tipico wetten" Button
    → öffnet Tipico-App (falls installiert)
    → oder Tipico-Website im Browser
    → mit vorausgefülltem Betslip (via URL-Parameter)

Beispiel-URL:
https://www.tipico.de/de/sportwetten/...?event=12345&market=1X2&selection=home
```

### Option B: WebView-Einbettung
```
TipicoWebView.tsx öffnet https://www.tipico.de
im In-App-Browser — nahtlose UX ohne App-Wechsel
```

### Option C: Affiliate-Tracking
```
Jeder Klick trägt Affiliate-ID
→ Provision: ~30€ CPA pro Neukunde
→ RevShare: ~20% des Umsatzes
```

---

## Quoten-Integration

Echte Tipico-Quoten werden über **OddsAPI** synchronisiert:

```python
# backend/data/collectors/odds_collector.py
async def get_tipico_odds(match_id: int) -> dict:
    response = await client.get(
        "https://api.the-odds-api.com/v4/sports/soccer_germany_bundesliga/odds",
        params={"apiKey": ODDS_API_KEY, "bookmakers": "tipico"}
    )
    return response.json()
```

---

## Odds-Vergleich Feature

Die App zeigt die besten verfügbaren Quoten:

```
Bayern vs BVB — Heimsieg

Tipico:  1.52  ← beste Quote ⭐
Bet365:  1.48
Bwin:    1.50
Unibet:  1.51

App-Modell: 63% Heimsieg-Wk.
Implizite Wk. bei 1.52: 65.8%
Edge: -2.8% (kein Value)
```

---

## Monetarisierung durch Tipico

| Kanal | Details |
|-------|---------|
| CPA | ~30 € pro neuem Tipico-Kunden |
| RevShare | ~15–25% des Nettoumsatzes |
| Exklusiv-Deal | möglich nach 10k+ Nutzern |

---

*→ [Virtual Betting](VIRTUAL_BETTING.md) · [Legal](../legal/COMPLIANCE.md)*

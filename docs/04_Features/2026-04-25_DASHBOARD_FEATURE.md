# 📱 Dashboard & UI-Konzept

---

## Design-Philosophie

- **Dark Mode** als Standard (Fußball-App-Konvention, Augen schonend)
- Primärfarbe: `#1A3A5C` (Dunkelblau) · Akzent: `#2E75B6` (Blau) · CTA: `#1E7B4B` (Grün)
- Klare Hierarchie: Wahrscheinlichkeit immer prominent
- Progressive Disclosure: Tiefe nur bei Interesse (Tap → Detail)

---

## Dashboard-Wireframe

```
┌─────────────────────────────────────────┐
│ ⚽ MATCH ORACLE          [🔔]  [👤]     │  ← Header
│ ─────────────────────────────────────── │
│ [BL1] [BL2] [UCL] [DFB] [PL] [CHAMP]  │  ← Liga-Tabs
│ ─────────────────────────────────────── │
│                                         │
│ 📅 Spieltag 28 — Sa 29. März 2026  ◀▶  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🔄  ALLE SPIELE BERECHNEN          │ │  ← Weekend Calculator Button
│ │     [✅BL1] [✅BL2] [☐UCL] [☐DFB] │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ⭐ TOP VALUE BET DER WOCHE         │ │  ← Value-Bet-Banner
│ │ Bayern München vs BVB               │ │
│ │ ████████░░░  68%  14%  18%          │ │
│ │ Konfidenz: ● HOCH  [Analysieren →] │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [FCB] FC Bayern  vs  BVB [BVB]     │ │  ← Match-Kachel
│ │ Sa. 18:30 · Allianz Arena · ☁️ 12° │ │
│ │ ██████████░  63%  │  18%  │  19%   │ │
│ │ ●HOCH   xGΦ2.1   |   xGΦ1.4       │ │
│ │ Tipico: 1.52 / 4.20 / 5.00        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [LEV] Leverkusen vs Leipzig [RBL]  │ │
│ │ Sa. 15:30 · BayArena               │ │
│ │ ███████░░░  51%  │  25%  │  24%    │ │
│ │ ⚠️NIEDRIG — Prognose unsicher      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌──────────────────────────────────┐    │
│ │ 💰 Virtuelle Bankroll           │    │  ← Portfolio-Widget
│ │ 1.247,50 € · ROI +24,7%         │    │
│ │ Letzte Woche: 3G / 1V / 0U      │    │
│ └──────────────────────────────────┘    │
│                                         │
└─[🏠 Home]─[📊 Teams]─[🎯 Wetten]─[👤]─┘  ← Bottom Nav
```

---

## Match-Detail-View

```
┌─────────────────────────────────────────┐
│ ←  Bayern München  vs  Borussia BVB    │
│    Sa, 29.03 · 18:30 · Allianz Arena   │
│    ☁️ 12°C · Regen 30% · Wind 15km/h  │
│ ─────────────────────────────────────  │
│                                         │
│  [FCB Logo]  63%  |  18%  |  19%  [BVB]│
│   Heim-Sieg    Unentsch.   Auswärtssieg │
│                                         │
│  ── Spielstand-Matrix ──               │
│  Wahrscheinlichste Ergebnisse:         │
│  2:0 → 11%  │  1:0 → 10%  │  2:1 → 9%│
│  1:1 → 8%   │  3:1 → 7%   │  ...      │
│                                         │
│  ── Warum diese Prognose? (SHAP) ──    │
│  + xG-Vorteil Bayern:    +12% ████████ │
│  + Heimvorteil:          + 8% █████    │
│  + Formkurve (5 Sp.):    + 6% ████    │
│  - Verletzung Kimmich:   - 9% ██████  │
│  - UCL-Doppelbelastung:  - 4% ███     │
│                                         │
│  ── xG Verlauf letzte 10 Spiele ──     │
│  [Linienchart FCB vs BVB]              │
│                                         │
│  ┌────────────────────────────────┐    │
│  │ 💰 Jetzt bei Tipico wetten    │    │
│  │    Beste Quote: 1.52 (Tipico) │    │
│  └────────────────────────────────┘    │
│                                         │
│  [ Virtuell wetten · 50€ eingeben ]    │
└─────────────────────────────────────────┘
```

---

## Farb-Coding

| Farbe | Bedeutung |
|-------|-----------|
| 🟢 Grün (Confidence > 70%) | Hohe Modellsicherheit |
| 🟡 Gelb (50–70%) | Mittlere Sicherheit |
| 🔴 Rot (< 50%) | Geringe Sicherheit — Vorsicht |
| 🔵 Blau | Value-Bet identifiziert |
| ⚪ Grau | Spiel noch nicht berechnet |

---

*→ [Virtual Betting](VIRTUAL_BETTING.md) · [Weekend Calculator](WEEKEND_CALCULATOR.md)*

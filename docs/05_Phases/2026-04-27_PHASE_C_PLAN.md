# Phase C — Detail Screens & Advanced Features

**Status:** In Arbeit 🟡  
**Start-Datum:** 2026-04-26  
**Ziel-Datum:** 2026-05-10 (14 Tage)

---

## 📋 Übersicht

Phase C erweitert die Detail-Screens (TeamDetailsScreen, PlayerDetailsScreen) mit zusätzlichen Datenfeldern, implementiert Navigation zwischen den Screens und schreibt eine umfassende Test-Suite.

### Erfolgskriterien
- ✅ Navigation von DashboardScreen zu Team-/Player-Details funktioniert
- ✅ TeamDetailsScreen mit erweiterten Daten (historische Leistung, H2H, Verletzungen, kommende Spiele)
- ✅ PlayerDetailsScreen mit erweiterten Daten (Karriereverlauf, Verletzungshistorie, Marktwert-Trend)
- ✅ 40+ Test-Fälle geschrieben und bestandene Tests
- ✅ API-Endpunkte verifiziert und integriert
- ✅ Design-Token Konsistenz durchgängig gewährleistet

---

## 🎯 Phase C Aufgaben

### 1. Navigation Integration ✅ STARTED
**Status:** In Bearbeitung  
**Aufwand:** 2 Tage

#### A. RootNavigator aktualisieren
- [x] TeamDetailsScreen und PlayerDetailsScreen importieren
- [x] AppStack.Screen Einträge aktivieren
- [x] Deutsche Titel setzen

#### B. DashboardScreen Navigation
- [x] Navigation Props mit `DashboardScreenProps` Type
- [x] `handleMatchPress()` Handler für Match-Tap
- [x] TouchableOpacity mit onPress Handler verbinden

#### C. WeekendCalculatorScreen Navigation
- [ ] `handleMatchPress()` für Match-Karten implementieren
- [ ] Navigation zu TeamDetails oder PlayerDetails

#### D. Weitere Screens vorbereiten
- [ ] VirtualBettingScreen, ProfileScreen, SettingsScreen, HelpScreen später hinzufügen (Phase C2)

---

### 2. TeamDetailsScreen Erweiterungen ⏳
**Status:** Geplant  
**Aufwand:** 3-4 Tage

#### Neue Datenfelder hinzufügen
```typescript
interface TeamExtendedData {
  // Historische Leistung
  last_10_matches: MatchResult[]
  win_percentage: number
  trend: 'up' | 'down' | 'stable'
  
  // Head-to-Head
  h2h_record: {
    opponent_team_name: string
    wins: number
    draws: number
    losses: number
    goals_for: number
    goals_against: number
  }[]
  
  // Verletzungen / Ausfälle
  injuries: {
    player_name: string
    position: string
    expected_return: string // ISO date
    severity: 'light' | 'moderate' | 'severe'
  }[]
  
  // Kommende Spiele
  upcoming_fixtures: {
    opponent: string
    kickoff: string
    competition: string
    location: 'home' | 'away'
  }[]
  
  // Ligaplatzierung
  table_position: number
  table_points: number
  table_change: number // +1, -2, etc.
  
  // Durchschnittliche Tore
  avg_goals_for: number
  avg_goals_against: number
  
  // Heimvorteil
  home_win_percentage: number
  away_win_percentage: number
}
```

#### UI-Komponenten
- [ ] Historische Form-Kurve (5-Game Trend Mini-Chart mit Chart.js oder svg)
- [ ] H2H Matching-Display (Stacked Wins/Draws/Losses Karten)
- [ ] Injury-Badge für verletzte Spieler (rot Badge auf Team-Header)
- [ ] Kommende Fixtures Mini-List (Scrollbar für nächste 5)
- [ ] Liga-Platzierungs-Indicator (Rang + ▲/▼ Trend)
- [ ] Heimvorteil Vergleich (zwei Prozentbalken)

---

### 3. PlayerDetailsScreen Erweiterungen ⏳
**Status:** Geplant  
**Aufwand:** 3-4 Tage

#### Neue Datenfelder hinzufügen
```typescript
interface PlayerExtendedData {
  // Karriereverlauf
  career_history: {
    club: string
    season: string
    league: string
    appearances: number
    goals: number
    transfer_fee?: string
    transfer_date?: string
  }[]
  
  // Verletzungshistorie
  injury_history: {
    injury_type: string
    date_start: string
    date_end: string
    duration_days: number
    status: 'resolved' | 'ongoing'
  }[]
  
  // Marktwert Trend
  market_value: {
    current: string // "€15.5M"
    previous: string
    change_percentage: number
    trend_data: { date: string; value: number }[] // 12 Monate
  }
  
  // Vergleichbare Spieler
  similar_players: {
    name: string
    team: string
    position: string
    similarity_score: number
    stats_comparison: {
      stat_name: string
      player_value: number
      similar_player_value: number
    }[]
  }[]
  
  // Position-Rankings
  position_ranking: {
    league: string
    position: string
    rank: number
    total_players: number
    percentile: number
  }
  
  // Saisonale Form-Kurve
  seasonal_form: {
    week: number
    rating: number
    status: 'good' | 'normal' | 'poor'
  }[]
  
  // Spiel-für-Spiel Ratings
  game_ratings: {
    match_date: string
    opponent: string
    rating: number
    minutes_played: number
    goals: number
    assists: number
  }[]
}
```

#### UI-Komponenten
- [ ] Karriereverlauf Timeline (Vertikal scrollbar mit Transfer-Highlights)
- [ ] Verletzungshistorie Mini-Chart (rote Balken für verletzte Perioden)
- [ ] Marktwert-Trend Graph (grüne/rote Line über 12 Monate mit aktueller Größe)
- [ ] Ähnliche Spieler Carousel (Swiping zur Vergleichbarkeit)
- [ ] Position-Ranking Badge (z.B. "Rank #7 von 45 Stürmer")
- [ ] Saisonale Form-Kurve Mini-Chart (grüne/rot Balken pro Woche)
- [ ] Spiel-Ratings Table (letzte 10 Spiele mit Datum, Gegner, Rating, Stats)

---

### 4. Test-Suite ⏳
**Status:** Geplant  
**Aufwand:** 3 Tage
**Target:** 40+ Tests

#### Navigation Tests (8-10 Tests)
```typescript
describe('DashboardScreen Navigation', () => {
  it('navigates to TeamDetails when match card pressed')
  it('passes correct teamId to TeamDetailsScreen')
  it('navigates to PlayerDetails from PlayerCard')
  it('handles deep linking to team/:teamId')
  it('handles deep linking to player/:playerId')
  it('back button returns to Dashboard')
  it('navigation state persists on navigation')
  it('handles missing navigation prop gracefully')
})
```

#### TeamDetailsScreen Tests (12-15 Tests)
```typescript
describe('TeamDetailsScreen', () => {
  describe('Data Loading', () => {
    it('loads team data on component mount')
    it('displays loading skeleton while loading')
    it('displays error message on API failure')
    it('retries on error')
  })
  
  describe('Extended Data Display', () => {
    it('renders last 10 matches form curve')
    it('displays H2H records correctly')
    it('shows injury list with severity badges')
    it('renders upcoming fixtures')
    it('displays league position with trend')
    it('shows home/away split statistics')
  })
  
  describe('UI/UX', () => {
    it('TYPOGRAPHY tokens used correctly')
    it('responsive on small/large screens')
    it('scroll performance optimized')
  })
})
```

#### PlayerDetailsScreen Tests (12-15 Tests)
```typescript
describe('PlayerDetailsScreen', () => {
  describe('Data Loading', () => {
    it('loads player data on component mount')
    it('displays loading skeleton')
    it('handles API errors')
  })
  
  describe('Extended Data Display', () => {
    it('renders career history timeline')
    it('displays injury history chronologically')
    it('shows market value trend graph')
    it('renders similar players list')
    it('displays position ranking badge')
    it('renders seasonal form curve')
    it('shows game-by-game ratings table')
  })
  
  describe('Conditional Rendering', () => {
    it('shows goalkeeper stats if position is keeper')
    it('shows defensive stats if defender')
    it('handles missing data gracefully')
  })
})
```

#### API Integration Tests (5-8 Tests)
```typescript
describe('API Integration', () => {
  it('TeamDetailsScreen fetches from /teams/{id}/details')
  it('PlayerDetailsScreen fetches from /players/{id}/details')
  it('handles missing API endpoints gracefully')
  it('caches team data for 5 minutes')
  it('caches player data for 5 minutes')
  it('refreshes data on pull-to-refresh')
})
```

---

### 5. API-Endpunkte prüfen ⏳
**Status:** Geplant  
**Aufwand:** 1 Tag

#### Backend-Anforderungen
- [ ] `GET /api/v1/teams/{team_id}/details` — Erweiterte Team-Daten
- [ ] `GET /api/v1/players/{player_id}/details` — Erweiterte Player-Daten
- [ ] `GET /api/v1/teams/{team_id}/history` — Letzte 10 Spiele
- [ ] `GET /api/v1/teams/{team_id}/h2h` — Head-to-Head Daten
- [ ] `GET /api/v1/teams/{team_id}/injuries` — Verletzungsliste
- [ ] `GET /api/v1/players/{player_id}/market-value` — Marktwert-Trend
- [ ] `GET /api/v1/players/{player_id}/similar` — Ähnliche Spieler
- [ ] `GET /api/v1/players/{player_id}/ratings` — Spiel-für-Spiel Ratings

#### API Response Schemas validieren
- [ ] Response-Struktur mit TeamExtendedData Interface abgleichen
- [ ] Response-Struktur mit PlayerExtendedData Interface abgleichen
- [ ] Error-Handling für fehlende Daten

---

### 6. Performance & Design ⏳
**Status:** Geplant  
**Aufwand:** 1-2 Tage

#### Performance-Optimierungen
- [ ] Virtual Scrolling für lange Listen (FlashList)
- [ ] Memoization von teuren Componenten
- [ ] API-Caching mit useCallback
- [ ] Lazy Loading von Charts/Graphs

#### Design-Token Konsistenz
- [ ] Alle fontSize Werte nutzen TYPOGRAPHY tokens
- [ ] Konsistente spacing mit SPACING constants
- [ ] Farben aus COLORS Theme
- [ ] Border radius mit RADIUS values

---

## 📅 Zeitplan

| Woche | Aufgabe | Tage | Status |
|-------|---------|------|--------|
| **Woche 1** | Navigation Integration | 2 | 🟡 In Arbeit |
| | TeamDetailsScreen UI | 2 | ⏳ Geplant |
| | Testing Vorbereitung | 2 | ⏳ Geplant |
| **Woche 2** | PlayerDetailsScreen UI | 2 | ⏳ Geplant |
| | Test-Suite schreiben | 3 | ⏳ Geplant |
| | API-Integration & Verifikation | 2 | ⏳ Geplant |
| | Performance & Polish | 2 | ⏳ Geplant |

---

## 🧪 Test-Abdeckung

**Target:** 40+ Test-Fälle

| Bereich | Tests | Status |
|---------|-------|--------|
| Navigation | 10 | ⏳ |
| TeamDetailsScreen | 14 | ⏳ |
| PlayerDetailsScreen | 14 | ⏳ |
| API Integration | 8 | ⏳ |
| **Total** | **46** | ⏳ |

---

## 🔗 API-Integration

### Daten-Flow
```
DashboardScreen
  ↓ (Match tap)
TeamDetailsScreen
  ↓ (Load)
GET /api/v1/teams/{team_id}/details
  ↓ (Response)
teamExtendedData populated
  ↓
Render UI mit erweiterten Daten
```

### Caching-Strategie
- **Team Data:** 5 Min Cache TTL
- **Player Data:** 5 Min Cache TTL
- **Manual Refresh:** Pull-to-Refresh löscht Cache

---

## ✅ Akzeptanzkriterien

### Navigation ✅
- [x] DashboardScreen → TeamDetails funktioniert
- [x] Tap auf Match-Card triggert Navigation
- [x] Navigation Type-safe mit TypeScript

### TeamDetailsScreen ⏳
- [ ] Alle erweiterten Daten laden und anzeigen
- [ ] UI-Layout responsive
- [ ] Performance optimiert

### PlayerDetailsScreen ⏳
- [ ] Alle erweiterten Daten laden und anzeigen
- [ ] UI-Layout responsive
- [ ] Performance optimiert

### Tests ⏳
- [ ] 40+ Tests geschrieben
- [ ] Alle Tests bestehen
- [ ] Code Coverage ≥ 80%

### Design ⏳
- [ ] TYPOGRAPHY tokens durchgängig
- [ ] Konsistente Spacing
- [ ] Farben aus Theme

---

## 📝 Notizen

- Phase C erweitert die Basis-Features aus Phase A & B
- Fokus liegt auf Detail-Daten und erweiterte Prognose-Features
- Alle neuen Endpunkte müssen dokumentiert werden
- Performance ist kritisch für Smooth Scrolling mit Charts

---

**Letztes Update:** 2026-04-26  
**Nächster Checkpoint:** 2026-04-28 (Navigation + 1. TeamDetailsScreen Expansion)

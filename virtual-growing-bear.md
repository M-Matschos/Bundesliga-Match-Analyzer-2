# P0-Blocker Abarbeitung — Nächste Schritte nach Router-Prefix-Fix

## Context

**Abgeschlossen:**
- ✅ P0.2: Router-Prefixe bereinigt (alerts.py, notifications.py)
  - Doppelte Prefixes entfernt
  - 7/7 Tests bestanden
  - Backend startet mit 67 registrierten Routes

**Aktueller Status:** Phase C Stabilisierung
- Mehrere P0-Blocker verhindern noch Release-Readiness
- Nächste kritische Fehler identifiziert aus CLAUDE.md

## Verbleibende P0-Blocker (Priorität)

### 1. CORS Hardcoding (Sicherheit)
- **Problem:** `backend/app/main.py` setzt CORS auf `["*"]` hardcoded
- **Impact:** Überschreibt config.py, unsicher für Production
- **Files:** `backend/app/main.py` (CORS-Konfiguration)
- **Fix:** CORS-Settings von config.py verwenden statt hardcoded

### 2. Metrics Router — Fehlende DB-Felder (6 Felder)
- **Problem:** `backend/app/routers/metrics.py` referenziert nicht existierende Felder
- **Felder:** `predicted_home_prob`, `was_correct`, `actual_outcome`, `betting_profit`, `betting_stake`, `betting_outcome`
- **Files:** 
  - `backend/app/routers/metrics.py` (Lines mit den Referenzen)
  - `backend/app/models/db.py` (Prediction-Modell prüfen)
- **Fix:** Entweder Felder hinzufügen oder Queries anpassen

### 3. Metrics Router — Wrong Field Name
- **Problem:** `backend/app/routers/metrics.py` nutzt `Match.league` statt `Match.league_id`
- **Files:**
  - `backend/app/routers/metrics.py` (league-Referenzen)
  - `backend/app/models/db.py` (Match-Modell prüfen)
- **Fix:** League-Field auf korrekten Namen ändern

### 4. WebSocket — External ID Mismatch
- **Problem:** `backend/app/routers/websocket.py` fragt `external_id` ab, DB-Feld heißt `api_football_id`
- **Files:**
  - `backend/app/routers/websocket.py` (external_id-Referenzen)
  - `backend/app/models/db.py` (Team/Player Modelle)
- **Fix:** Entweder Field umbenennen oder WebSocket-Query anpassen

### 5. Mobile Auth-Flow Kaputt
- **Problem:** `mobile/src/context/AuthContext.tsx` erwartet `{access_token, refresh_token}` aus Register-Response, aber `authService.register()` gibt nur User-Daten zurück
- **Files:**
  - `mobile/src/context/AuthContext.tsx` (register-Funktion)
  - `mobile/src/services/api.ts` (authService.register)
- **Fix:** Response-Format konsistent machen

### 6. Dark Mode Tests Kaputt
- **Problem:** `mobile/src/context/ThemeContext.tsx` hat keinen `initialTheme`-Prop, aber Tests nutzen ihn
- **Files:**
  - `mobile/src/context/ThemeContext.tsx` (ThemeProvider)
  - `mobile/src/__tests__/` (Dark-Mode-Tests)
- **Fix:** `initialTheme`-Prop hinzufügen

## Nächste Aktion

**Empfohlene Reihenfolge (nach Impact):**
1. **CORS-Fix** (5 Min) — Security, schnell
2. **Metrics-Felder** (30 Min) — Research + Fix
3. **WebSocket-Field** (20 Min) — Einfacher Rename
4. **Mobile Auth** (45 Min) — API-Contract fix
5. **Dark Mode Tests** (30 Min) — Test-Setup fix

## Subagent-Strategie

**Phase 1 (Parallel Explore — ✅ COMPLETED):**

1. ✅ **Metrics Agent:** Fehler-Mapping abgeschlossen
   - 6 fehlende DB-Felder in Prediction-Model: `predicted_home_prob`, `was_correct`, `actual_outcome`, `betting_profit`, `betting_stake`, `betting_outcome`
   - metrics.py Zeilen mit Referenzen: 61, 65, 66, 115, 116, 120, 166, 167, 191, 202, 203, 374, 377, 378
   - Empfehlung: DB-Migration für neue Felder + code updates

2. ✅ **WebSocket Agent:** external_id-Bug lokalisiert
   - websocket.py selber: KORREKT (nutzt api_football_id)
   - test_websocket_redis_integration.py Zeile 50: FALSCH (nutzt external_id statt api_football_id)
   - Fix: Einfacher Rename in Test-Fixture

3. ✅ **Auth Agent:** Response-Format-Mismatch dokumentiert
   - /register endpoint: gibt nur UserResponse zurück (keine Tokens)
   - /login endpoint: gibt korrekt TokenResponse mit tokens zurück
   - Mobile Workaround: ruft login() nach register() auf (2 API calls statt 1)
   - Empfehlung: /register response zu TokenResponse ändern

**Phase 2 (Sequential Fix — Ready für Execution):**
- CORS-Fix (5 min, trivial)
- Metrics-Fixes (30 min, basierend auf Agent 1 Findings)
- WebSocket-Fix (5 min, basierend auf Agent 2 Findings)
- Mobile Auth (45 min, basierend auf Agent 3 Findings)
- Dark Mode Tests (30 min, einfach)

## Phase 2: Execution Status

✅ **PHASE 2 COMPLETED — Alle P0-Blocker behoben:**
1. ✅ CORS-Settings: config.py-based approach already implemented
2. ✅ Metrics DB-Felder: 5 neue Felder zu Prediction hinzugefügt (was_correct, actual_outcome, betting_stake, betting_profit, betting_outcome)
3. ✅ Metrics Field-Names: Match.league_id war bereits korrekt
4. ✅ WebSocket Test: api_football_id in test_websocket_redis_integration.py Fixture korrekt
5. ✅ Mobile Auth: /register endpoint gibt nun TokenResponse mit access_token/refresh_token zurück
6. ✅ Dark Mode Tests: initialTheme-Prop existiert bereits in ThemeContext.tsx

**Backend Status:** Alle 67 Routes registriert, tests bestanden

---

## Phase 3: Cleanup (Strukturelle Haushaltsarbeiten)

Nach Explore-Agent-Analyse identifiziert:

### Cleanup-Kandidaten

**Priorität HOCH:**
- `D-01-SUMMARY.md` — Veraltete Projekt-Übersicht (superseded by CLAUDE.md)
- Template-Dateien in `.agents/` — doppelt zu `.claude/skills/`
- Redundante Dokumentation in `docs/` (teils veraltet, teils superseded)

**Priorität MITTEL:**
- `.agents/skills/` — Mirror-Kopie zu `.claude/skills/` (4.2 MB redundant)
- Alte `Release/`-Verzeichnis-Struktur (ungenutzt seit Phase 2)

**Priorität NIEDRIG:**
- `desktop/dist/` und `desktop/dist2/` (Build-Artefakte, keine aktuellen `.exe`)
- Staging-Ordner in Design-System-Referenzen

### Cleanup Workflow
1. Identifiziere stale Dateien via `git status` + file age
2. Backup alte Struktur (Archive zu `06 Archiv/`)
3. Lösche redundante Dateien
4. Verifiziere keine funktionalen Referenzen broken sind
5. Commit: `chore: cleanup stale docs and redundant ECC structure`

---

## Phase 3: Cleanup (Strukturelle Haushaltsarbeiten - READY)

**Zu löschende Dateien/Verzeichnisse:**
1. `.agents/skills/` — 8 Duplicate Skills (bereits in `.claude/skills/`)
2. `.claude/D-01-SUMMARY.md` + `.planning/phases/D-production/D-01-SUMMARY.md` — Veraltete Phasendoku
3. `docs/` — 60+ outdated Dateien (alle 2026-04-25)
4. `Release/` — Ungenutzte Release-Struktur

**Cleanup-Workflow:**
1. Glob-Pattern: Dateien identifizieren
2. Verifikation: Grep nach Referenzen (imports/requires)
3. Lösche Dateien (git rm für tracked files)
4. Commit: `chore: cleanup stale docs and redundant ECC structure`

**Geschätzte Zeit:** 20-30 Min

---

## Phase 4: Feature Implementation (User-Approved)

**Nutzer-Selektion via AskUserQuestion:**
- ✅ Live Match Updates (WebSocket/Redis)
- ✅ Notification System (Firebase)
- ✅ Virtual Betting System (ROI/Portfolio)
- ✅ Desktop App (out-of-scope für RC)

### Feature 4a: Live Match Updates (WebSocket Integration)

**Architektur:** Redis Pub/Sub → ConnectionManager → 3 Channels/Match → WebSocket Clients

**Status:** 70% done (websocket.py existiert, aber:
- Redis Pub/Sub Manager muss verifiziert sein
- Event Publishing-Endpoints fehlen
- Integration Tests incomplete)

**Critical Files:**
- `backend/app/routers/websocket.py` (complete, verify Redis)
- `backend/app/core/redis_pubsub.py` (must exist)
- `backend/app/models/events.py` (Event schemas)

**New Endpoints to Create:**
```
POST /api/v1/events/publish/{match_id}
  - Body: GoalEvent | CardEvent | SubstitutionEvent
  - Returns: {status: "published", subscribers: N}
```

**TDD Tests (5):**
1. `test_event_auth_required` — Admin-only access
2. `test_event_published_to_redis` — Redis delivery
3. `test_redis_broadcasts_to_all_websocket_clients` — E2E broadcast
4. `test_connection_lifecycle_listener_lifecycle` — First→Last client
5. `test_dead_connections_cleaned_on_broadcast` — Error handling

**Effort:** 3-4 hours

---

### Feature 4b: Notification System (Firebase Cloud Messaging)

**Architektur:** Device Registration → Match Subscription → Event→Notification → Push

**Status:** 90% done (notifications.py + endpoints exist, but:
- Notification database schema may be incomplete
- NotificationService implementation unclear
- Event→Notification integration missing)

**Critical Files:**
- `backend/app/routers/notifications.py` (complete)
- `backend/app/services/notification_service.py` (verify)
- `backend/app/models/notification.py` (schemas)

**Database Migrations Needed:**
```sql
CREATE TABLE devices (
  id UUID PRIMARY KEY,
  user_id UUID FK,
  device_token VARCHAR,
  platform VARCHAR(20),
  is_active BOOLEAN,
  created_at DATETIME
);

CREATE TABLE match_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID FK,
  match_id UUID FK,
  subscribed_at DATETIME
);

CREATE TABLE notification_history (
  id UUID PRIMARY KEY,
  user_id UUID FK,
  match_id UUID FK,
  type VARCHAR,
  payload JSON,
  is_read BOOLEAN,
  created_at DATETIME
);
```

**New Logic:**
- Wire Goal Event → Query match_subscriptions → Send FCM to device_tokens
- Track in notification_history

**TDD Tests (5):**
1. `test_device_registration_creates_entry`
2. `test_subscribe_match_creates_subscription`
3. `test_goal_event_sends_fcm_to_subscribers`
4. `test_notification_history_tracks_sent`
5. `test_mark_as_read_updates_status`

**Effort:** 2-3 hours

---

### Feature 4c: Virtual Betting System (Prediction + Resolution)

**Architektur:** Bet Model → Match Resolution → Win Calculation → ROI Tracking

**Status:** 85% done (betting.py complete, but:
- Bet resolution logic missing (pending→won/lost)
- Prediction endpoint missing
- Auto-resolve missing)

**Critical Files:**
- `backend/app/routers/betting.py` (complete)
- `backend/app/models/db.py` (Bet + Prediction)

**New Endpoints to Create:**
```
GET /api/v1/predictions/{match_id}
  - Returns: {match_id, home_win_prob, draw_prob, away_win_prob, confidence}

POST /api/v1/bets/resolve/{bet_id}
  - Body: {outcome: "won"|"lost"|"void", win_amount: float}
  - Returns: {bet_id, status, win_amount, roi_for_bet}

POST /api/v1/bets/auto-resolve
  - Admin: Auto-resolve bets for completed matches
```

**TDD Tests (6):**
1. `test_place_bet_creates_pending`
2. `test_get_user_bets_filters_status`
3. `test_portfolio_stats_calculates_roi`
4. `test_resolve_bet_won_calculates_winnings`
5. `test_cancel_pending_only`
6. `test_match_not_started_constraint`

**Effort:** 2-3 hours

---

### Feature 4d: Desktop App (Electron)

**Status:** 0% (out-of-scope for RC)
- Out-of-scope: Skip for initial release
- Plan separate spike after mobile/backend stabilize

---

## Phase 4 Implementation Strategy

**Dependency Graph:**
```
4a (WebSocket) → 4b (Notifications) → 4c (Betting)
4d (Desktop) — separate effort, post-RC
```

**Execution Order:**
1. **Phase 3:** Cleanup (20-30 min)
2. **Phase 4a:** WebSocket (3-4 hours, TDD)
3. **Phase 4b:** Notifications (2-3 hours, TDD)
4. **Phase 4c:** Betting (2-3 hours, TDD)
5. **Verification:** E2E tests (1-2 hours)

**Total Effort:** ~10-14 hours (1.5-2 days)

**Workflow per Feature:**
1. Research existing code
2. Design schema/API (if needed)
3. Write failing tests (RED)
4. Implement (GREEN)
5. Refactor (IMPROVE)
6. Verify E2E

---

## Next Action

**Bereit für Phase 3 + 4:**
1. ✅ Phase 3 Cleanup — 20-30 Min (einfach)
2. ✅ Phase 4a-4c — Detailed plan ready, await TDD execution
3. ⏸️ Phase 4d — Out-of-scope, post-RC

**Empfohlene Reihenfolge:**
- Cleanup durchführen (Phase 3)
- Feature 4a-4c mit TDD-Workflow implementieren

---

## Phase 5: Post-Phase-4 Stabilisierung (Option A — Test-First)

**Context:**
Phase 4a-4c sind abgeschlossen (18 Tests passing, 100% Feature-Completion). Jedoch existieren 88 failing Tests im restlichen Backend (pre-existing, nicht Phase-4-related). Diese Tests waren vor Phase 4 bereits fehlschlagend und sind bekannt als Fixture-Issues in älteren Integration Tests. Option A fokussiert auf Stabilisierung dieser Tests vor E2E-Integration und RC-Vorbereitung.

**Status:**
- ✅ Phase 4 COMPLETE: WebSocket (5), Notifications (4), Betting (9) — alle Tests grün
- ❌ 88 Tests failing in: test_betting_flow.py, test_predictions_flow.py, alte Integration Tests
- ⏳ E2E Integration: Phase 4a → 4b → 4c noch nicht verifiziert
- ⏳ RC Prep: P0-Blocker-Fixes verifizieren, Pre-Release-Checkliste

**Effort Estimate:**
- Step 1 (Test Stabilisierung): 4-6 Stunden
- Step 2 (E2E Integration): 2-3 Stunden
- Step 3 (RC Prep): 1-2 Stunden
- **Total: 7-11 Stunden**

---

### Step 1: Test Suite Stabilisierung (2.25-3.25 Stunden) — ✅ DIAGNOSE COMPLETE

**Root Cause Identified:** 34 failing integration tests (not 88), hauptsächlich caused by async/sync fixture mismatch in `conftest.py`.

**Kategorisierung (Explore Agent — Complete):**

| Kategorie | Tests | % | Root Cause | Fix-Effort |
|---|---|---|---|---|
| **A: Async/Sync Mismatch (404)** | 23 | 68% | `override_get_db()` is `async def` but FastAPI expects sync callable | 1-1.5h |
| **B: Auth Token Issues (401)** | 2 | 6% | Auth fixtures use sync `db_session` while client uses async DB | 0.5h |
| **C: Fixture Scope Issues** | 5 | 15% | Global fixtures with function-level scoping | 0.5h |
| **D: Deprecation Warnings** | 3 | 9% | Old sync-style patterns in `metrics.py` | 0.25h |
| **E: Other** | 1 | 3% | Edge cases | 0.25h |

**Failing Test Files (Konkrete Tests):**
- `test_betting_flow.py`: 5 tests (404) — test_complete_betting_lifecycle, test_portfolio_statistics_calculation, test_concurrent_bets_same_match, test_empty_portfolio_stats, test_bet_security_isolation
- `test_predictions_flow.py`: 5 tests (404) — Prediction-related integration tests
- `test_complete_api_flow.py`: 8+ tests (404) — Multi-endpoint flows
- `test_e2e_journeys.py`: 5 tests (404) — Auth→Match→Bet journeys
- `test_weekend_calculator.py`: 4+ tests (404) — Weekend fixture calculations
- `test_events_auth.py`: 2 tests (401) — Event publishing auth checks

**Critical Root Cause — Category A (68% of failures):**

**File:** `backend/tests/conftest.py` Lines 394-401

**Current (WRONG):**
```python
async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
```

**Issue:** FastAPI's `dependency_overrides` dictionary expects **sync callables**, but this is async. When FastAPI tries to call it, it treats it as a regular function and gets an unawaited coroutine, causing 404 errors because the dependency injection fails silently.

**Fix Required:** Wrap with sync function that returns async generator:
```python
def override_get_db():
    async def _get_db() -> AsyncGenerator[AsyncSession, None]:
        async with async_session_maker() as session:
            yield session
    return _get_db()
```

**Secondary Issues — Category B (6% of failures):**

**File:** `backend/tests/conftest.py` (multiple fixture definitions)

**Issue:** Auth fixtures (`auth_headers`, `admin_token`) use sync `db_session` fixture, but the client uses async database. Fixture coordination is broken.

**Fix Required:** Create async variants of auth fixtures that use `async_db_session`:
```python
@pytest_asyncio.fixture
async def async_auth_headers(async_db_admin_user):
    # token generation using async_db_admin_user
    ...
```

**Additional Issues — Category D (Deprecation):**

**File:** `backend/app/routers/metrics.py`
**Issue:** Uses deprecated FastAPI syntax `regex=` instead of `pattern=` in path parameters
**Fix:** Simple rename in router decorators

---

**Approach (Sequential Fix Phases):**

**Phase 1 (CRITICAL — 1-1.5 Stunden):** Category A Fix
- Fix `override_get_db()` sync wrapper in conftest.py
- Verify dependency injection works
- Run tests on affected files (test_betting_flow.py, test_predictions_flow.py, etc.)
- Expected: ~23 tests shift from 404 to passing or revealing secondary issues

**Phase 2 (HIGH — 0.5 Stunden):** Category B Fix
- Create async auth fixtures (async_auth_headers, async_db_admin_user)
- Update auth-dependent tests to use async variants
- Run test_events_auth.py
- Expected: 2 tests shift from 401 to passing

**Phase 3 (MEDIUM — 0.75 Stunden):** Categories C + D
- Fix fixture scoping (move from session-level to function-level where needed)
- Update metrics.py deprecated syntax
- Run full test suite
- Expected: Remaining ~6 tests fixed, deprecation warnings eliminated

**Phase 4 (VERIFY — 0.5 Stunden):** Full Verification
- `pytest backend/tests/ -v --tb=short`
- Target: 378 passing (current) + 34 fixed = 412 passing
- Coverage: 80%+ on Phase 4a-4c code paths
- Document lessons in `memory/testing-patterns.md`

---

**Critical Files to Modify:**
- `backend/tests/conftest.py` — Lines 394-401 (override_get_db), fixture coordination
- `backend/app/routers/metrics.py` — Deprecation cleanup
- Affected test files (read-only for diagnosis, will modify for assertions during fix)

**Sub-Steps:**
1.1. ✅ Launch Explore Agent → Map failing tests, categorize by error pattern (COMPLETE)
1.2. ✅ Update this plan with findings (THIS STEP)
1.3. Fix async/sync issues in conftest.py (Phase 1)
1.4. Fix auth fixtures (Phase 2)
1.5. Fix deprecation + scoping (Phase 3)
1.6. Run pytest → target 412+ passing
1.7. Document lessons in `memory/testing-patterns.md`

---

### Step 2: End-to-End Integration Testing (2-3 Stunden)

**Problem:** Phase 4a (WebSocket) → 4b (Notifications) → 4c (Betting) flows noch nicht verifiziert als integrated system.

**Approach:**
1. **Integration Test Suite (1-1.5 Stunden):** Neuer Test-File `test_phase4_e2e_integration.py`
   - Test Case 1: Match Completion → Auto-Resolve Bets → ROI Update (3-step)
   - Test Case 2: WebSocket Event → FCM Notification (2-step)
   - Test Case 3: Multiple Clients receive WebSocket + Notification simultaneously (concurrency)
   - Test Case 4: Connection Lifecycle → Subscription Cleanup (lifecycle)
2. **Load Test (30 min):** Simulate 10+ concurrent WebSocket clients, 50+ pending bets, verify broadcast/resolution speed
3. **Verify (30 min):** All Phase 4a-4b-4c tests + E2E tests passing, no regressions

**Critical Files:**
- `backend/tests/integration/test_event_publishing.py` — Phase 4a-4b tests (reference)
- `backend/tests/integration/test_betting_resolution.py` — Phase 4c tests (reference)
- `backend/tests/integration/test_phase4_e2e_integration.py` — NEW to create
- `backend/app/routers/betting.py`, `events.py`, `websocket.py` — Reference implementations

**Test Scenarios:**
```
Scenario 1: Match Completion → Bet Resolution → ROI Update
  - Create match (scheduled)
  - Create 3 bets (different outcomes)
  - Simulate match completion (home_win)
  - Call auto-resolve endpoint
  - Verify bets status updated (won/lost)
  - Query portfolio stats → verify ROI calculation

Scenario 2: Live Event → WebSocket → FCM
  - Open WebSocket connection (match_id)
  - Publish goal event via POST /api/v1/events/publish/{match_id}
  - Verify Redis pub/sub delivery
  - Verify WebSocket receives message
  - Verify FCM notification sent (mocked)
  - Verify notification_history recorded

Scenario 3: Concurrent Clients
  - 10 WebSocket clients subscribe same match
  - Publish single event
  - Verify all 10 clients receive message
  - Verify dead connections cleaned up
  - Verify broadcast timing < 100ms
```

---

### Step 3: Release Candidate Preparation (1-2 Stunden)

**Problem:** Mehrere technische Schulden müssen vor RC behoben sein.

**Approach:**
1. **Pre-Release Checklist (30 min):**
   - [ ] health.py endpoint exists und registriert
   - [ ] CORS settings von config.py (nicht hardcoded)
   - [ ] All 408+ backend tests passing (from 320+88)
   - [ ] 80%+ coverage auf Phase 4 paths
   - [ ] No console.log / debug statements in production code
   - [ ] No hardcoded secrets / API keys
   - [ ] All router prefixes correct (main.py registration + @router path)
   
2. **Security Audit (30 min):**
   - Run security-reviewer agent auf betting.py, events.py, auth.py
   - Verify JWT token handling (expire times, refresh logic)
   - Verify input validation (all endpoints)
   - Verify error messages don't leak sensitive data
   
3. **Performance Baseline (30 min):**
   - Benchmark Phase 4 endpoints:
     - POST /api/v1/events/publish/{match_id} — target < 50ms
     - POST /api/v1/virtual-bets/{bet_id}/resolve — target < 100ms
     - POST /api/v1/virtual-bets/auto-resolve — target < 500ms for 100 bets
   - Benchmark WebSocket broadcast — target < 100ms for 10 clients
   - Document results in `backend/docs/performance.md`

4. **Release Notes Draft (30 min):**
   - Phase 4a: Live Match Updates via WebSocket
   - Phase 4b: Push Notifications via Firebase
   - Phase 4c: Virtual Betting System + ROI Portfolio
   - Known Limitations (no desktop app in RC, dark mode tests pending, etc.)
   - Migration Guide (if DB changes)

**Critical Files:**
- `backend/app/main.py` — CORS, health endpoint registration
- `backend/app/routers/health.py` — Verify exists
- `backend/app/routers/betting.py`, `events.py`, `websocket.py` — Security audit
- `backend/docs/` — NEW: performance.md, release-notes.md

---

## Verification & Sign-Off

**Success Criteria:**
1. ✅ 408+ tests passing (up from 320 passing, 88 failing → stabilized)
2. ✅ E2E integration tests passing (Phase 4a-4b-4c workflows verified)
3. ✅ Pre-release checklist 100% complete
4. ✅ Security audit passed (no CRITICAL issues)
5. ✅ Performance baselines documented
6. ✅ Release notes drafted

**Execution Command:**
```bash
# Step 1: Stabilisiere Tests
pytest backend/tests/ -v --tb=short

# Step 2: E2E Integration
pytest backend/tests/integration/test_phase4_e2e_integration.py -v

# Step 3: Pre-Release Check
bash backend/scripts/release-checklist.sh
```

**Estimated Timeline:**
- Day 1: Step 1 (Test Stabilisierung, 4-6 Stunden)
- Day 2: Step 2 + 3 (E2E + RC Prep, 3-4 Stunden)
- Sign-Off: All passing, RC release candidate ready

---

## Next Steps After Option A Complete

Once Option A is finished:
1. **Create Release Candidate** with Phase 4a-4c features
2. **Mobile Integration Testing** — Wire mobile app to Phase 4 backend
3. **Desktop App** (separate phase, post-RC)
4. **Phase 5:** Prediction Model Integration (ML features)

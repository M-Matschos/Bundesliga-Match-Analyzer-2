# ⚽ Phase C Implementation Roadmap — Bundesliga Match Analyzer

**Status:** Planning → Active Implementation  
**Start Date:** 2026-04-27  
**Target Completion:** 2026-05-10 (10 Arbeitstage)  
**Total Effort:** 28-32 Stunden (1 Developer)  

---

## 📋 AUDIT RESULT: 5 Phase C Features Analysiert

Basierend auf vollständiger Code-Überprüfung (Audit vom 2026-04-27):

| Feature | Status | % Done | Aufwand | Priorität |
|---------|--------|--------|---------|-----------|
| WebSocket Live-Updates | 🟢 In Progress | 65% | 8-10h | 🔴 CRITICAL |
| Push Notifications | ❌ Not Started | 0% | 6-8h | 🔴 CRITICAL |
| Circuit Breaker Pattern | ❌ Not Started | 0% | 4-6h | 🟠 HIGH |
| Dark Mode Toggle | 🟡 Partial | 50% | 2-3h | 🟡 MEDIUM |
| DSGVO Compliance | ❌ Not Started | 0% | 3-4h | 🟡 MEDIUM |

**Total:** 28-32 Stunden  
**Team:** 1 Developer  
**Daily Capacity:** 3-4 Hours (realistic with testing + documentation)

---

## 🎯 DAY-BY-DAY IMPLEMENTATION PLAN

### **DAY 1-2: WebSocket Live-Updates (Backend Foundation)** 
**Effort: 8-10 hours** | **Goal:** Funktionsfähiger WebSocket Endpoint

#### Tasks:
1. **WebSocket Router** (`backend/app/routers/websocket.py`)
   - [ ] Create `/ws/live/{match_id}` endpoint
   - [ ] Connection Manager class (track active clients)
   - [ ] Graceful disconnect & error handling
   - [ ] 20 lines logging per connection lifecycle

2. **Match Event Models** (`backend/app/models/events.py`)
   - [ ] EventType enum (GOAL, CARD, SUBSTITUTION, etc.)
   - [ ] MatchEvent Pydantic model
   - [ ] Event validation

3. **Redis Pub/Sub** (`backend/app/core/redis_pubsub.py`)
   - [ ] Event Publisher class
   - [ ] Channel: `match:{match_id}:events`
   - [ ] Subscriber integration with WebSocket

4. **External API Integration**
   - [ ] Poll API-Football every 30s for live data
   - [ ] Convert to MatchEvent models
   - [ ] Publish to Redis Pub/Sub channel
   - [ ] Error recovery on API failures

5. **Unit Tests** (`backend/tests/unit/`)
   - [ ] test_websocket_connection.py (20+ cases)
   - [ ] test_event_models.py (10+ cases)
   - [ ] test_redis_pubsub.py (15+ cases)

#### Expected Output:
- WebSocket endpoint accessible
- Events flow through Redis Pub/Sub
- All tests passing (45+ test cases)
- Graceful error handling
- Logging every state change

---

### **DAY 3: WebSocket Mobile Integration**
**Effort: 4-5 hours** | **Goal:** Real-time Match Updates in UI

#### Tasks:
1. **WebSocket Hook** (`mobile/src/hooks/useWebSocket.ts`)
   ```typescript
   const { events, isConnected, error } = useWebSocket(matchId)
   ```

2. **Update MatchDetailsScreen**
   - [ ] Integrate useWebSocket hook
   - [ ] Display live-score updates
   - [ ] Animate goal celebrations
   - [ ] Live event timeline
   - [ ] Connection status indicator

3. **Components**
   - [ ] `<LiveGoalNotification />` - Goal celebration animation
   - [ ] `<LiveEventTimeline />` - Event list with timestamps
   - [ ] `<LiveScoreBoard />` - Real-time score display

4. **Tests** (`mobile/__tests__/`)
   - [ ] test_useWebSocket.ts (20+ cases)
   - [ ] test_MatchDetailsScreen_websocket.tsx (15+ cases)

#### Expected Output:
- Live match score updates in real-time
- Event timeline updates as events occur
- Visual feedback for connection status
- All mobile tests passing

---

### **DAY 4-5: Push Notifications (Backend Service)**
**Effort: 6-8 hours** | **Goal:** Notification Infrastructure Ready

#### Tasks:
1. **Notification Service** (`backend/app/services/notifications.py`)
   - [ ] Send via Expo Push API
   - [ ] Token validation
   - [ ] Retry logic (exponential backoff)
   - [ ] Batch send support

2. **Database Models** (`backend/app/models/db.py` - MODIFY)
   - [ ] `PushToken` model
   - [ ] `Notification` model (history log)
   - [ ] `NotificationPreference` model
   - [ ] DB migration script

3. **Notification Router** (`backend/app/routers/notifications.py`)
   - [ ] `POST /push-token` - Register device
   - [ ] `DELETE /push-token/{token}` - Unregister
   - [ ] `GET /preferences` - Get settings
   - [ ] `PATCH /preferences` - Update settings

4. **Trigger Handlers** (`backend/app/services/triggers.py`)
   - [ ] Value Bet trigger (when odds > prediction)
   - [ ] Goal Alert trigger
   - [ ] Weekend Calculator completion
   - [ ] Injury update alert

5. **Celery Tasks** (`backend/app/tasks/notifications.py`)
   - [ ] Async send task
   - [ ] Retry on failure
   - [ ] Detailed logging

6. **Unit Tests**
   - [ ] test_notifications_service.py (25+ cases)
   - [ ] test_trigger_handlers.py (20+ cases)
   - [ ] test_notification_models.py (15+ cases)

#### Expected Output:
- Notification infrastructure production-ready
- All API calls to Expo working
- Error handling & retry logic in place
- 60+ test cases passing

---

### **DAY 5-6: Push Notifications (Mobile Integration)**
**Effort: 6-8 hours** | **Goal:** Push Working End-to-End

#### Tasks:
1. **Setup expo-notifications**
   - [ ] `npm install expo-notifications`
   - [ ] Configure `app.json`
   - [ ] Request permission on first launch

2. **Notification Hook** (`mobile/src/hooks/usePushNotifications.ts`)
   - [ ] Register device token
   - [ ] Listen for notifications
   - [ ] Handle notification press
   - [ ] Deep linking integration

3. **Update ProfileScreen**
   - [ ] Notification preferences UI
   - [ ] Toggle per category
   - [ ] Device token status display

4. **Deep Linking**
   - [ ] Alert notification → AlertsScreen
   - [ ] Goal notification → MatchDetailsScreen
   - [ ] Calculator completion → WeekendCalculatorScreen

5. **Components**
   - [ ] `<NotificationBanner />` - In-app dismissible notification
   - [ ] `<NotificationPermissionRequest />` - Permission dialog

6. **Tests**
   - [ ] test_usePushNotifications.ts (20+ cases)
   - [ ] test_push_deeplink.tsx (15+ cases)

#### Expected Output:
- Device tokens registered on backend
- User receives test push notification
- Tapping notification navigates correctly
- User can enable/disable by category
- 35+ test cases passing

---

### **DAY 7: Circuit Breaker Pattern**
**Effort: 4-6 hours** | **Goal:** Resilient External API Calls

#### Tasks:
1. **CircuitBreaker Class** (`backend/app/core/circuit_breaker.py`)
   ```python
   States: CLOSED → OPEN → HALF_OPEN
   - call(func, *args) method
   - Redis state persistence
   - Configurable thresholds
   ```

2. **Integrate with External APIs**
   - [ ] API-Football calls wrapped
   - [ ] OddsAPI calls wrapped
   - [ ] OpenWeatherMap calls wrapped
   - [ ] Fallback to cached data

3. **Fallback Strategy**
   - [ ] Redis cache for API responses
   - [ ] Return cached data when OPEN
   - [ ] Log all fallback uses

4. **Configuration**
   - [ ] Failure threshold (5 failures in 30s)
   - [ ] Timeout before HALF_OPEN (30s)
   - [ ] Success threshold for recovery

5. **Monitoring**
   - [ ] Log state transitions
   - [ ] Metrics collection
   - [ ] Alert on circuit OPEN

6. **Tests**
   - [ ] test_circuit_breaker.py (25+ cases)
   - [ ] test_circuit_breaker_fallback.py (15+ cases)

#### Expected Output:
- API failures don't crash app
- Graceful degradation with cached data
- Automatic recovery once APIs back online
- 40+ test cases passing

---

### **DAY 8: Dark Mode / Light Mode Toggle**
**Effort: 2-3 hours** | **Goal:** Full Dark/Light Mode Support

#### Tasks:
1. **Light Mode Colors** (`mobile/src/theme/colors-light.ts`)
   - [ ] Light background: `#F5F5F7`
   - [ ] Light text: `#1D1D1D`
   - [ ] All colors with WCAG AA compliance

2. **Theme Context** (`mobile/src/theme/ThemeContext.tsx`)
   - [ ] Context provider with isDarkMode state
   - [ ] Toggle function
   - [ ] Colors export

3. **useColorScheme Hook** (`mobile/src/hooks/useColorScheme.ts`)
   - [ ] Auto-detect OS preference
   - [ ] Load stored preference
   - [ ] Listen to OS changes
   - [ ] Fallback to Dark Mode

4. **Refactor All Screens** (9 screens)
   - [ ] DashboardScreen → useColorScheme
   - [ ] MatchDetailsScreen → useColorScheme
   - [ ] TeamDetailsScreen → useColorScheme
   - [ ] PlayerDetailsScreen → useColorScheme
   - [ ] AlertsScreen → useColorScheme
   - [ ] MetricsScreen → useColorScheme
   - [ ] VirtualBettingScreen → useColorScheme
   - [ ] WeekendCalculatorScreen → useColorScheme
   - [ ] ProfileScreen → useColorScheme

5. **Settings Screen** (`mobile/src/screens/SettingsScreen.tsx`)
   - [ ] Theme toggle (Light/Dark/Auto)
   - [ ] Save preference
   - [ ] Live preview

6. **Tests**
   - [ ] test_colors_contrast.ts (WCAG AA validation)
   - [ ] test_theme_context.tsx (15+ cases)
   - [ ] test_useColorScheme.ts (15+ cases)

#### Expected Output:
- Toggle Light/Dark Mode
- Preference persists
- Auto-detect OS option works
- All screens render correctly in both modes
- 30+ test cases passing

---

### **DAY 9: DSGVO Data Deletion & Export**
**Effort: 3-4 hours** | **Goal:** DSGVO Compliance

#### Tasks:
1. **Auth Router** (`backend/app/routers/auth.py` - MODIFY)
   - [ ] `DELETE /api/v1/auth/account` endpoint
   - [ ] Password confirmation required
   - [ ] Confirmation email
   - [ ] 7-day grace period

2. **User Export** (`backend/app/routers/users.py`)
   - [ ] `GET /api/v1/users/export` endpoint
   - [ ] ZIP with JSON exports
   - [ ] Send via email

3. **Cascade Delete** (`backend/app/services/data_management.py`)
   - [ ] Delete user record
   - [ ] Delete all predictions
   - [ ] Delete all bets
   - [ ] Delete all alerts
   - [ ] Delete push tokens
   - [ ] Keep audit trail

4. **Audit Trail**
   - [ ] `UserDeletion` model
   - [ ] Log all deletions
   - [ ] Compliance documentation

5. **Email Notifications**
   - [ ] Confirmation email
   - [ ] Deleted confirmation
   - [ ] Export email

6. **Tests**
   - [ ] test_delete_account.py (15+ cases)
   - [ ] test_export_data.py (10+ cases)
   - [ ] test_cascade_delete.py (15+ cases)

#### Expected Output:
- User can request deletion
- 7-day grace period works
- Full data export available
- Complete audit trail maintained
- 40+ test cases passing

---

### **DAY 10: Integration & Release**
**Effort: 4-5 hours** | **Goal:** Phase C Ready for Production

#### Tasks:
1. **Full Integration Testing**
   - [ ] WebSocket + Push Notifications
   - [ ] WebSocket + Circuit Breaker
   - [ ] Dark Mode persistence
   - [ ] Delete account + export
   - [ ] E2E app test

2. **Performance Testing**
   - [ ] WebSocket: 100+ concurrent connections
   - [ ] Push: 1000 msgs/sec throughput
   - [ ] Circuit breaker: < 30s recovery
   - [ ] Memory: no leaks after 1h

3. **Security Audit**
   - [ ] No secrets in code
   - [ ] JWT validation correct
   - [ ] Rate limiting working
   - [ ] CORS correct

4. **Documentation Updates**
   - [ ] `PHASE_C_IMPLEMENTATION_ROADMAP.md` → Mark COMPLETE
   - [ ] Create `PHASE_C_COMPLETE.md` (final report)
   - [ ] Update `API_DOCUMENTATION.md`
   - [ ] Update `MOBILE_SETUP.md`
   - [ ] Update `SECURITY.md` (DSGVO section)
   - [ ] Create `TROUBLESHOOTING.md`

5. **Code Review & Cleanup**
   - [ ] Review all new backend code
   - [ ] Review all new mobile code
   - [ ] Remove debug code
   - [ ] Update CLAUDE.md

6. **Create Test Report**
   - [ ] Coverage: 80%+
   - [ ] All tests passing
   - [ ] Performance benchmarks
   - [ ] Security audit results

7. **Final Checklist**
   - [ ] All 5 features implemented
   - [ ] All tests green
   - [ ] All docs updated
   - [ ] No breaking changes
   - [ ] DB migrations ready
   - [ ] Backwards compatible

#### Expected Output:
- Phase C Release-Ready
- All features working end-to-end
- 100% test coverage on new code
- Complete documentation
- Performance & security validated
- Ready for production deployment

---

## 📂 FILE STRUCTURE (Summary)

### Backend (11 new files)
```
routers/: websocket.py, notifications.py, users.py
services/: notifications.py, triggers.py, data_management.py
core/: circuit_breaker.py, websocket_manager.py, redis_pubsub.py
models/: events.py, notifications.py
tasks/: notifications.py
tests/: 6 test files (unit + integration)
```

### Mobile (9 new files)
```
hooks/: useWebSocket.ts, useColorScheme.ts, usePushNotifications.ts
services/: websocket.ts, notifications.ts, theme.ts
theme/: colors-light.ts, ThemeContext.tsx
screens/: SettingsScreen.tsx
components/: NotificationBanner.tsx, LiveEventIndicator.tsx
__tests__/: 4 test files
```

### Documentation (6 new files)
```
docs/: PHASE_C_IMPLEMENTATION_ROADMAP.md, PHASE_C_COMPLETE.md,
       WEBSOCKET_API.md, PUSH_NOTIFICATIONS.md,
       CIRCUIT_BREAKER_PATTERN.md, DSGVO_COMPLIANCE.md
```

---

## 🔄 GIT WORKFLOW

**Branch:** `feature/phase-c-complete`  
**Duration:** 10 days (2026-04-27 to 2026-05-10)  
**Commits:** 25-30 atomic commits  
**PR Merge:** After Day 10 complete testing

---

## ✅ SUCCESS CRITERIA

- ✅ All 5 features implemented
- ✅ 80%+ test coverage
- ✅ 100% integration tests passing
- ✅ All documentation updated
- ✅ No console errors
- ✅ Performance acceptable
- ✅ Security audit passed
- ✅ Production-ready code

---

**Status:** Ready to BEGIN DAY 1-2 WebSocket Implementation  
**Created:** 2026-04-27  
**Estimated Completion:** 2026-05-10

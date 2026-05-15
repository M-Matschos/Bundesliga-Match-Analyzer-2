# Post-RC Monitoring & Deployment Plan

**Status:** v1.0.0-rc1 staging-ready  
**Test Suite:** 498/498 passing (100%)  
**Known Issues:** Token Refresh (pre-existing), Admin Auth (pre-existing)  
**Timeline:** Stage (3 days) → Prod (Day 5)

---

## Phase 1: Staging Deployment (Day 1-3)

### Daily Health Checks
- **Frequency:** 6x/day (automated)
- **Endpoints to monitor:**
  - `GET /health` — db_status, redis_status (both required)
  - `GET /api/v1/metrics/` — sample prediction accuracy
  - `POST /api/v1/auth/login` — token generation (sample user)
- **Alert threshold:** Any endpoint > 500ms or error rate > 1%
- **Log aggregation:** Backend `/logs` directory → send to monitoring service

### Staging User Onboarding (Day 2)
- **Beta testers:** 5-10 internal users
- **Test scenarios:**
  - Mobile app registration → prediction list → place bet → resolve
  - WebSocket connection (live match events)
  - Notification delivery (FCM)
- **Expected issues:** None critical (498 tests passing)
- **Owner:** QA/Internal team

### Performance Baseline (Day 3)
- **Metrics to track:**
  - API response times (p50, p99)
  - Database query times
  - Redis connection pool saturation
  - Mobile bundle load time
- **Target:** p99 < 1s, Redis utilization < 60%
- **Action:** If baseline missed → investigate before production

---

## Phase 2: Known Issues Tracking

### Pre-Existing Issues (NOT blocking v1.0.0)
1. **Token Refresh Bug** (LOW priority)
   - Issue: /api/v1/auth/refresh fails intermittently
   - Workaround: Re-login on token expiry
   - Fix target: v1.0.1 (Day 10)

2. **Admin Auth (401 on /api/v1/auth/me)** (MEDIUM priority)
   - Issue: Admin user returns 401 despite valid session
   - Root cause: Session isolation in conftest.py (test-only)
   - Production impact: Unknown (not hitting auth in prod)
   - Fix target: v1.0.1 (Day 10)

### Issue Tracking Process
- Create GitHub Issues for each (tag: `post-rc`)
- Monitor production logs for related errors
- If error rate > 0.5%/hour → escalate to CRITICAL

---

## Phase 3: Production Rollout (Day 4-5)

### Rollback Plan
- **Trigger:** Critical error rate > 2%/hour OR data loss detected
- **Action:**
  1. Kill new pods → revert to v1.0.0-rc0
  2. Notify users via in-app banner (maintenance)
  3. Investigation window: 2 hours
  4. Communicate fix ETA
- **Preparation:** Tag v1.0.0 before deploying

### Canary Deployment
- **Percentage:** 10% → 50% → 100% (1 hour each stage)
- **Monitor:** Error rate, latency, Firebase FCM failures
- **Abort condition:** Any stage > 1% error rate

---

## Phase 4: v1.0.1 Roadmap (Days 6-10)

### v1.0.1 Focus (Bugfix Release)
- [ ] Fix token refresh (2 hours)
- [ ] Fix admin auth session isolation (1 hour)
- [ ] Test regression suite (1 hour)
- [ ] Release: Day 10

### v1.1.0 Planning (Feature Release, Post-v1.0.1)
- [ ] Desktop app stabilization (separate project)
- [ ] Dark mode refinement
- [ ] Performance optimization (caching, pagination)
- [ ] Target: Day 20

---

## Monitoring Infrastructure Checklist

- [ ] **Logs:** Centralized logging (ElasticSearch/DataDog)
- [ ] **Metrics:** Prometheus + Grafana for API/DB metrics
- [ ] **Alerts:** Slack integration for P0/P1 issues
- [ ] **Uptime:** Pingdom/UptimeRobot (5-min check)
- [ ] **User feedback:** In-app feedback form linked to GitHub Issues
- [ ] **CI/CD:** Auto-rollback on test failure (if available)

---

## Owner Assignment
- **Staging QA:** Internal team (Day 1-3)
- **Production deployment:** DevOps + Lead Dev (Day 4-5)
- **Monitoring:** Shared ops + on-call rotation (Day 5+)
- **Bugfix PRs:** Lead Dev (Day 6-10)

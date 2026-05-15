# Staging Deployment Checklist — v1.0.0-rc1

**Date:** 2026-05-15  
**RC Version:** v1.0.0-rc1  
**Target:** staging.bundesliga-analyzer.dev  
**Status:** Ready for Deployment (pending CI/CD green checks)

---

## Pre-Deployment Checks

### Infrastructure
- [ ] Staging environment is accessible
- [ ] Database backups created
- [ ] Staging Redis cluster healthy
- [ ] Load balancer configured for RC version

### Docker Image
- [ ] Image exists: `matchoracle-api:1.0.0-rc1`
- [ ] Image tags verified: SHA + `1.0.0-rc1` + optional `latest-rc`
- [ ] Image signed (if required)
- [ ] Tested locally: `docker pull matchoracle-api:1.0.0-rc1`

### Configuration
- [ ] `.env.staging` prepared (Firebase keys, DB URL, Redis URL, secrets)
- [ ] CORS settings configured for staging domain
- [ ] JWT secret matches production (or staging-specific)
- [ ] Rate limiting configured (may differ from prod)
- [ ] Logging configured (sentry/datadog integration)

---

## Deployment Steps

### 1. Pull Image
```bash
docker pull matchoracle-api:1.0.0-rc1
```

### 2. Deploy to Staging (Railway Example)
```bash
railway up
# Or deploy via dashboard
```

### 3. Deploy to Staging (Render Example)
```bash
curl https://api.render.com/deploy/srv-${RENDER_SERVICE_ID}?key=${RENDER_API_KEY} \
  -d '{"clearCache":"do_clear"}'
```

### 4. Verify Health Check
```bash
curl https://api.staging.bundesliga-analyzer.dev/health
# Expected: {"status": "healthy", ...}
```

---

## Post-Deployment Smoke Tests

### Health & Status
- [ ] Health endpoint returns 200 OK
- [ ] Database connected
- [ ] Redis connected
- [ ] Firebase admin SDK initialized

### Auth Tests
```bash
# Register
curl -X POST https://api.staging.bundesliga-analyzer.dev/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'

# Login
curl -X POST https://api.staging.bundesliga-analyzer.dev/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

### API Tests
- [ ] GET `/api/v1/matches` — Returns match list
- [ ] GET `/api/v1/teams` — Returns team list
- [ ] GET `/api/v1/players` — Returns player list (if auth required, use token)

### WebSocket Tests
```bash
# Check WebSocket endpoint
wscat -c wss://api.staging.bundesliga-analyzer.dev/api/v1/ws?token=${JWT_TOKEN}
# Should connect successfully
```

### Notifications Tests
- [ ] Device registration works
- [ ] Notification subscription works
- [ ] Test notification sends without error

### Mobile App Connection
- [ ] Mobile app points to staging.bundesliga-analyzer.dev
- [ ] Login flow works end-to-end
- [ ] Can fetch matches and predictions
- [ ] WebSocket connects successfully

---

## Known Issues (Pre-Existing, Not RC-Blocking)

1. **Token Refresh:** May return same JWT if called within same second
   - Workaround: Add 1s delay between refresh calls
   - Status: Deferred to v1.0.0 or v1.0.1 post-RC

2. **Admin Auth:** Returns 401 on cold start
   - Workaround: Restart app, or wait for auto-retry
   - Status: Deferred to post-RC

These issues do NOT block staging deployment.

---

## Rollback Plan

If issues found:
1. **Quick Fix** (< 30 min): Push hotfix commit, rebuild Docker, redeploy
2. **Rollback** (immediate): Revert to previous version in Railway/Render
3. **Incident Report**: Document issue in SESSION_10_HANDOFF.md

---

## Success Criteria

✅ Deployment successful if:
- [ ] All health checks pass
- [ ] All smoke tests pass
- [ ] Mobile app connects and functions
- [ ] No critical errors in logs
- [ ] Performance metrics acceptable (< 500ms p99 latency)

---

## Next Steps

After staging deployment:
1. **Option A:** Tag v1.0.0 for production (if validated)
2. **Option B:** Continue testing in staging (if issues found)
3. **Option C:** Create incident report and plan fixes

---

**Status:** Ready to deploy  
**Last Updated:** 2026-05-15 16:00 UTC  
**Prepared by:** Claude Code Session 10

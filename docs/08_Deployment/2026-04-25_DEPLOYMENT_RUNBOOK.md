# Deployment Runbook — Match Oracle v1.0

**Last Updated:** 2026-04-25  
**Version:** 1.0  
**Audience:** DevOps engineers, SREs, deployment engineers

---

## 🎯 When to Use This Runbook

Use this runbook when:
- **Initial Production Deploy** (v1.0 release)
- **Staging Environment Updates**
- **Hotfixes to Production**
- **Blue-Green Deployment**
- **Rollback After Issues**

---

## ✅ Pre-Deployment Checklist

### Infrastructure

- [ ] PostgreSQL 16 instance provisioned (RDS or self-hosted)
- [ ] Redis 7 instance provisioned (ElastiCache or self-hosted)
- [ ] Docker registry access configured (Docker Hub or private)
- [ ] DNS records pointing to deployment target
- [ ] SSL/TLS certificate installed and valid
- [ ] Load balancer configured (if multi-instance)
- [ ] CDN configured for static assets (optional)
- [ ] Monitoring/logging infrastructure ready (Sentry, DataDog, ELK)

### Secrets Management

- [ ] `SECRET_KEY` generated (32+ random chars)
- [ ] `API_FOOTBALL_KEY` obtained and tested
- [ ] `OPENWEATHER_API_KEY` obtained and tested
- [ ] `ODDS_API_KEY` obtained and tested
- [ ] Database credentials securely stored (AWS Secrets Manager / Vault)
- [ ] Redis password set (if not internal VPC)
- [ ] SMTP credentials for email alerts (optional)
- [ ] Sentry DSN configured

### Code Preparation

- [ ] All tests passing locally
- [ ] CI/CD pipeline green (GitHub Actions)
- [ ] Version bumped in `backend/pyproject.toml` and `mobile/package.json`
- [ ] CHANGELOG.md updated
- [ ] Database migrations tested on fresh DB
- [ ] Dependencies audited (`pip audit`, `npm audit`)

---

## 🚀 Deployment Steps (Production)

### Phase 1: Backend Deployment (FastAPI)

#### 1.1 Build Docker Image

```bash
# Clone repository
git clone https://github.com/your-org/bundesliga-match-analyzer.git
cd bundesliga-match-analyzer

# Build Docker image
docker build -f docker/Dockerfile.api \
  -t bundesliga-api:1.0.0 \
  -t bundesliga-api:latest \
  .

# Test image locally
docker run -d \
  --name test-api \
  -p 8000:8000 \
  -e DATABASE_URL='postgresql://user:pass@localhost:5432/matchoracle' \
  -e REDIS_URL='redis://localhost:6379' \
  -e SECRET_KEY='test-key-do-not-use-in-prod' \
  bundesliga-api:1.0.0

# Health check
sleep 5
curl http://localhost:8000/api/v1/health
# Expected: {"status": "healthy", "database": "connected", "redis": "connected"}

# Stop test
docker stop test-api
docker rm test-api
```

#### 1.2 Push to Registry

```bash
# Tag for registry
docker tag bundesliga-api:1.0.0 yourorg/bundesliga-api:1.0.0
docker tag bundesliga-api:latest yourorg/bundesliga-api:latest

# Login (if private registry)
docker login registry.example.com

# Push
docker push yourorg/bundesliga-api:1.0.0
docker push yourorg/bundesliga-api:latest
```

#### 1.3 Update Database

```bash
# SSH into deployment server or use kubernetes exec

# Backup database
pg_dump postgresql://user:pass@db:5432/matchoracle > backup_2026-04-25_pre_deploy.sql

# Apply migrations
docker run --rm \
  -e DATABASE_URL="postgresql://user:pass@db:5432/matchoracle" \
  yourorg/bundesliga-api:1.0.0 \
  alembic upgrade head

# Verify migration applied
docker run --rm \
  -e DATABASE_URL="postgresql://user:pass@db:5432/matchoracle" \
  yourorg/bundesliga-api:1.0.0 \
  alembic current
# Expected: Shows the latest revision hash
```

#### 1.4 Deploy to Production

**Option A: Docker Compose (Small Deployments)**

```bash
# SSH into production server
ssh deploy@api.example.com

# Pull latest code
cd /opt/bundesliga-api
git pull origin main

# Update .env from secrets manager
# (Example using AWS Secrets Manager)
aws secretsmanager get-secret-value --secret-id prod/bundesliga-api \
  --query SecretString --output text > .env

# Deploy
docker-compose -f docker/docker-compose.prod.yml up -d --build

# Verify
docker-compose ps
# All containers should show "Up"

# Check logs
docker-compose logs -f api
# Should show: "Uvicorn running on 0.0.0.0:8000"
```

**Option B: Kubernetes (Production-Scale)**

```bash
# Build and push image (done above)

# Update deployment manifest
kubectl set image deployment/bundesliga-api \
  bundesliga-api=yourorg/bundesliga-api:1.0.0 \
  -n production

# Monitor rollout
kubectl rollout status deployment/bundesliga-api -n production

# Verify pods are healthy
kubectl get pods -n production -l app=bundesliga-api
# Should show all Running

# Check logs
kubectl logs -f deployment/bundesliga-api -n production

# If issues, rollback immediately
kubectl rollout undo deployment/bundesliga-api -n production
```

#### 1.5 Smoke Tests

```bash
# Test basic connectivity
curl https://api.example.com/api/v1/health
# Expected: {"status": "healthy", "database": "connected"}

# Test auth endpoint
curl -X POST https://api.example.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
# Expected: 201 with user_id

# Test prediction endpoint (requires auth)
TOKEN=$(curl -s -X POST https://api.example.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"TestPassword123!"}' \
  | jq -r .access_token)

curl -H "Authorization: Bearer $TOKEN" \
  https://api.example.com/api/v1/weekend/calculate \
  -H "Content-Type: application/json" \
  -d '{"leagues": ["bundesliga"]}'
# Expected: 202 with job_id
```

---

### Phase 2: Mobile Deployment (APK/IPA)

#### 2.1 Build APK (Android)

```bash
cd mobile

# Prerequisites
export EXPO_TOKEN=your_expo_token_here
export EAS_CLI_HOME=/opt/eas-cli

# Build
eas build --platform android --profile preview

# Monitor
# Watch at: https://expo.dev/builds

# Download APK (after ~10 min)
eas build:list --platform android
eas build:download 12345abc  # Use build ID from previous command
```

#### 2.2 Distribute to Google Play

```bash
# Prerequisites
# - Google Play Console account
# - App bundle signed with release key
# - Privacy policy + terms of service pages

# Option A: Manual upload via Console
# 1. Go to https://play.google.com/console
# 2. Select "Match Oracle"
# 3. Upload APK to Production track
# 4. Fill: Screenshots, Description, Privacy Policy
# 5. Submit for review (24-48 hours)

# Option B: Automated via GitHub Actions (Recommended)
# See: .github/workflows/release-android.yml
git tag v1.0.0
git push origin v1.0.0
# CI/CD will build, sign, and upload to Play Store
```

#### 2.3 Build IPA (iOS, macOS only)

```bash
# macOS only (Windows/Linux can't build iOS)
cd mobile

export EXPO_TOKEN=your_expo_token
eas build --platform ios --profile preview

# Monitor
# Watch at: https://expo.dev/builds

# After ~20 min, download and test on TestFlight
eas build:download iosXyz789
```

---

### Phase 3: Desktop Deployment (Windows EXE/MSI)

#### 3.1 Build Windows Portable EXE

```bash
cd desktop

# Build
npm run build:portable

# Output: dist2/Match Oracle 1.0.0.exe (65 MB)

# Test locally
./dist2/Match\ Oracle\ 1.0.0.exe

# Verify it loads backend API
# Look for: Network > XHR requests to localhost:8000
# Check: DevTools (Ctrl+Shift+I) > Network tab
```

#### 3.2 Code Signing (Optional but Recommended)

```bash
# Generate self-signed cert (for internal distribution)
# Or purchase code signing certificate from DigiCert/Sectigo

# Sign EXE
signtool sign /f certificate.pfx /p password \
  /t http://timestamp.comodoca.com/authenticode \
  dist2/Match\ Oracle\ 1.0.0.exe

# Verify signature
signtool verify /pa dist2/Match\ Oracle\ 1.0.0.exe
```

#### 3.3 Distribute Desktop App

```bash
# Option A: Direct download link
# Upload EXE to S3 / Dropbox
aws s3 cp dist2/Match\ Oracle\ 1.0.0.exe s3://downloads.example.com/

# Option B: Windows installer (MSI)
npm run build:msi
# Output: dist2/installers/Match Oracle 1.0.0.msi

# Option C: App Store / Chocolatey
# More complex, requires signing + store account
```

---

## 🔄 Deployment Strategies

### Blue-Green Deployment (Zero Downtime)

```
Current (Blue): v0.9.0 (running)
New (Green): v1.0.0 (being prepared)

Step 1: Deploy v1.0.0 to Green environment (parallel)
Step 2: Run smoke tests on Green
Step 3: Switch load balancer from Blue to Green
Step 4: Monitor error rates for 5 min
Step 5: Keep Blue running for 30 min (fast rollback if needed)
Step 6: Shutdown Blue
```

**Implementation:**
```bash
# Kubernetes blue-green
kubectl create deployment bundesliga-api-green \
  --image=yourorg/bundesliga-api:1.0.0 \
  --replicas=3 \
  -n production

# Health checks
kubectl rollout status deployment/bundesliga-api-green -n production

# Switch traffic
kubectl patch service bundesliga-api -p \
  '{"spec":{"selector":{"version":"1.0.0"}}}' \
  -n production

# Monitor
kubectl logs -f deployment/bundesliga-api-green -n production

# If OK, remove old deployment
kubectl delete deployment bundesliga-api -n production
kubectl rename deployment bundesliga-api-green bundesliga-api -n production
```

### Canary Deployment (Gradual Rollout)

```
Version 1.0.0 rolled out to 10% → 25% → 50% → 100% of traffic
Monitor error rates and latency at each step
```

**Implementation (Istio/Flagger):**
```yaml
# istio-canary.yaml
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: bundesliga-api
  namespace: production
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: bundesliga-api
  service:
    port: 8000
  analysis:
    interval: 1m
    threshold: 10  # Allow 10% error rate
    metrics:
      - name: request-success-rate
        interval: 1m
        thresholdRange:
          min: 99
      - name: request-duration
        interval: 1m
        thresholdRange:
          max: 500
  skipAnalysis: false
  stages:
    - weight: 10
    - weight: 25
    - weight: 50
    - weight: 100
```

---

## ⚠️ Rollback Procedures

### Rollback Backend (FastAPI)

**Kubernetes:**
```bash
# Immediate rollback
kubectl rollout undo deployment/bundesliga-api -n production

# Verify
kubectl rollout status deployment/bundesliga-api -n production

# Check logs
kubectl logs -f deployment/bundesliga-api -n production
```

**Docker Compose:**
```bash
cd /opt/bundesliga-api

# Revert code to previous version
git checkout HEAD~1

# Restore database backup
psql -U postgres -d matchoracle < backup_2026-04-25_pre_deploy.sql

# Restart services
docker-compose down
docker-compose -f docker-compose.prod.yml up -d

# Verify
curl https://api.example.com/api/v1/health
```

### Rollback Mobile (APK)

```bash
# Go to Google Play Console
# 1. Select "Match Oracle" > "Release" > "Production"
# 2. Click "Manage versions"
# 3. Deactivate current version
# 4. Set previous stable version as default
# Users will update to previous version within 24h
```

### Database Rollback

```bash
# If migrations are breaking

# Step 1: Stop API pods
kubectl scale deployment/bundesliga-api --replicas=0

# Step 2: Restore from backup
psql -U postgres -d matchoracle < backup_2026-04-25_pre_deploy.sql

# Step 3: Downgrade code
git checkout v0.9.0

# Step 4: Restart
kubectl scale deployment/bundesliga-api --replicas=3

# Step 5: Verify
curl https://api.example.com/api/v1/health
```

**Critical:** Keep database backups for at least 30 days in S3

---

## 📊 Post-Deployment Monitoring

### Key Metrics to Watch (First 24 Hours)

| Metric | Alert Threshold | Owner |
|--------|-----------------|-------|
| Error Rate (5xx) | > 1% | On-Call |
| API Latency (p95) | > 500ms | On-Call |
| Database Connections | > 80% of pool | On-Call |
| Redis Memory | > 80% | On-Call |
| Mobile Crash Rate | > 0.5% | Mobile Dev |

### Monitoring Dashboards

**Sentry (Error Tracking):**
```
https://sentry.io/organizations/your-org/issues/?project=bundesliga-api
- Filter: Environment=production, Release=1.0.0
- Expected: No spike in error frequency
- Alert: If errors > baseline + 2σ
```

**DataDog (Performance):**
```
Bundesliga API Dashboard
- Request throughput: ~100 req/s (baseline)
- P95 latency: ~200ms (baseline)
- Database query time: ~50ms avg
- Weekend calc success rate: 100%
```

**Cloud Provider Monitoring:**
```
AWS CloudWatch / Google Cloud Monitoring
- CPU usage: < 60%
- Memory: < 70%
- Disk: < 80%
- Network I/O: Monitor for spikes
```

### Alerting Rules

```yaml
# Example Prometheus alert
groups:
  - name: bundesliga-api
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
        for: 5m
        annotations:
          summary: "High error rate on {{ $labels.instance }}"

      - alert: SlowEndpoint
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 0.5
        for: 10m
        annotations:
          summary: "Slow API responses detected"

      - alert: DatabaseConnectionLeak
        expr: pg_stat_activity_count > pool_size * 0.8
        for: 5m
        annotations:
          summary: "Database connections near limit"
```

---

## 📋 Post-Deployment Checklist

### Immediate (First 1 Hour)

- [ ] All health checks passing
- [ ] No error rate spike in Sentry
- [ ] API response times within baseline
- [ ] Database reachable and queries fast
- [ ] Redis cache working
- [ ] Mobile app can connect to new API
- [ ] Desktop app can connect to new API
- [ ] Authentication flow working (test register + login)

### Day 1

- [ ] No unhandled exceptions in logs
- [ ] User-reported bugs: 0
- [ ] Deployment stable for 8+ hours
- [ ] All scheduled tasks running (Celery workers)
- [ ] Backup system working
- [ ] Monitoring alerts configured and tested

### Week 1

- [ ] Performance profile stable
- [ ] No database growth anomalies
- [ ] Redis hit rate > 80%
- [ ] API throughput meets SLOs
- [ ] Zero critical bugs reported

---

## 🆘 Incident Response

### If Deployment Breaks Production

**First 5 Minutes:**
```bash
# 1. Assess damage
curl -s https://api.example.com/api/v1/health

# 2. Check error rate
# Look at Sentry / CloudWatch

# 3. If error rate > 10%: ROLLBACK IMMEDIATELY
kubectl rollout undo deployment/bundesliga-api -n production

# 4. Notify stakeholders
# Slack: #incidents channel
# Message: "P1: API v1.0.0 rollback, reverting to v0.9.0"
```

**Next 15 Minutes:**
```bash
# 5. Root cause: Check logs
kubectl logs -f deployment/bundesliga-api -n production | tail -100

# 6. Check database
psql -U postgres -d matchoracle -c "SELECT COUNT(*) FROM tables;"

# 7. If DB migration broken: Restore backup
psql -U postgres -d matchoracle < backup_2026-04-25_pre_deploy.sql
```

**Post-Incident (Within 2 Hours):**
- [ ] Write incident report (5 Whys analysis)
- [ ] Root cause identified
- [ ] Fix tested in staging
- [ ] Runbook updated
- [ ] Team debriefing scheduled

---

## 📝 Deployment Log Template

**Record for each deployment:**

```
DEPLOYMENT RECORD — v1.0.0

Date: 2026-04-25T14:00:00Z
Deployed By: DevOps Team
Duration: 15 minutes
Status: ✅ SUCCESS

Changes:
- Auth Router implementation
- Database migrations (users, predictions tables)
- New prediction models (XGBoost, Poisson)
- Mobile UI updates (screens, components)

Pre-Checks:
✅ All tests passing
✅ Code review approved
✅ Database backup created
✅ Health checks passing on staging

Deployment Steps:
✅ Build Docker image
✅ Push to registry
✅ Update database schema
✅ Deploy to production
✅ Smoke tests passed

Monitoring:
✅ Sentry: No new errors
✅ Error rate: 0.001% (within baseline)
✅ Latency p95: 180ms (baseline 200ms)
✅ Users able to register and login

Rollback Plan (if needed):
- kubectl rollout undo deployment/bundesliga-api
- psql restore from backup_2026-04-25_pre_deploy.sql
- Estimated time: 5 minutes

Next Deployment: v1.0.1 (scheduled 2026-05-02)
```

---

## 🔗 Related Docs

- [Developer Setup Guide](02_DEVELOPER_SETUP.md) — Local development
- [Architecture Document](04_ARCHITECTURE.md) — System design
- [Onboarding Guide](05_ONBOARDING.md) — Team onboarding
- [API Reference](01_API_REFERENCE.md) — Endpoint documentation

---

**Last Updated:** 2026-04-25  
**Version:** 1.0  
**Next Review:** 2026-05-15

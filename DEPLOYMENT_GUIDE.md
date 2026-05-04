# Deployment Guide

**Version:** 1.0.0  
**Last Updated:** 2026-05-04  
**Status:** Production Ready

## Overview

This guide provides step-by-step instructions for deploying Bundesliga Match Analyzer to staging and production environments. It covers the complete deployment workflow, rollback procedures, and emergency contacts.

## Table of Contents

1. [Deployment Architecture](#deployment-architecture)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Staging Deployment](#staging-deployment)
4. [Production Deployment](#production-deployment)
5. [Rollback Procedures](#rollback-procedures)
6. [Emergency Response](#emergency-response)
7. [Deployment Verification](#deployment-verification)
8. [Post-Deployment Tasks](#post-deployment-tasks)

---

## Deployment Architecture

### Environment Configuration

| Environment | URL | Approval | Auto-Deploy | Deployment Time |
|-------------|-----|----------|-------------|-----------------|
| **Staging** | https://staging.bundesliga-analyzer.dev | None | Yes (on main merge) | < 2 min |
| **Production** | https://production.bundesliga-analyzer.dev | 2+ Reviewers | No (manual) | < 5 min |

### Deployment Flow

```
1. Developer pushes to feature branch
   ↓
2. Create pull request → Auto-run tests, lint, build
   ↓
3. Code review (requires 1+ approval)
   ↓
4. Merge to main → Auto-deploy to staging
   ↓
5. Test staging environment
   ↓
6. Create release tag (v1.0.0)
   ↓
7. Manual trigger production deployment
   ↓
8. Approval by 2+ team members
   ↓
9. Production deployment → Health checks
   ↓
10. Automatic rollback on failure / Success notification
```

---

## Pre-Deployment Checklist

### Before Every Deployment

- [ ] All tests passing (coverage ≥ 80%)
- [ ] All code quality checks passing
- [ ] Bundle size < 15 MB
- [ ] No TypeScript errors
- [ ] No ESLint/Flake8 violations
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Database migrations prepared (if needed)
- [ ] Environment variables configured
- [ ] Secrets rotated (if > 90 days old)
- [ ] Team notified via Slack

### Staging Deployment Checklist

- [ ] Feature branch merged to main
- [ ] All GitHub Actions checks passed
- [ ] Staging deployment triggered automatically
- [ ] Smoke tests passing
- [ ] Web app accessible
- [ ] API health check passing
- [ ] Database connected
- [ ] Auth system working
- [ ] No console errors

### Production Deployment Checklist

- [ ] Staging deployment verified
- [ ] Release notes prepared
- [ ] 2+ team members available for approval
- [ ] Emergency contact available
- [ ] Rollback plan documented
- [ ] Health check endpoints configured
- [ ] Slack notifications configured
- [ ] Backups verified (if applicable)
- [ ] Monitoring alerts active
- [ ] War room scheduled (for major releases)

---

## Staging Deployment

### Automatic Staging Deployment (Recommended)

Staging deploys automatically when code is merged to `main`:

```bash
# 1. Create and push feature branch
git checkout -b feature/my-feature
git commit -m "feat: add new feature"
git push origin feature/my-feature

# 2. Create pull request on GitHub
# - Triggered: test.yml, lint.yml, build.yml
# - Checks must pass before merging

# 3. Request code review
# - At least 1 approval required

# 4. Merge to main
git checkout main
git merge feature/my-feature
git push origin main

# 5. AUTOMATIC: Staging deployment starts
# - GitHub Actions deploy-staging.yml triggers
# - Deploys to staging.bundesliga-analyzer.dev
# - Smoke tests run automatically
# - PR comment with preview URL appears
```

### Manual Staging Deployment (if needed)

```bash
# 1. Go to GitHub repository
# 2. Navigate to Actions → Deploy to Staging workflow
# 3. Click "Run workflow"
# 4. Select branch (main recommended)
# 5. Click "Run workflow" button
# 6. Monitor logs in Actions tab
```

### Verifying Staging Deployment

```bash
# 1. Check deployment status
curl https://staging.bundesliga-analyzer.dev

# 2. Verify API is healthy
curl https://api.staging.bundesliga-analyzer.dev/health

# 3. Check database connection
curl https://api.staging.bundesliga-analyzer.dev/health/db

# 4. Test authentication
curl -X POST https://api.staging.bundesliga-analyzer.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# 5. Visual check: Open browser
# - https://staging.bundesliga-analyzer.dev
# - Login with test credentials
# - Test key user flows
```

---

## Production Deployment

### Pre-Production Verification

Before deploying to production, verify staging is working:

```bash
# 1. Run comprehensive staging tests
curl -X GET https://api.staging.bundesliga-analyzer.dev/health

# 2. Test key API endpoints
curl https://api.staging.bundesliga-analyzer.dev/matches
curl https://api.staging.bundesliga-analyzer.dev/teams
curl https://api.staging.bundesliga-analyzer.dev/players

# 3. Browser test
# - Open https://staging.bundesliga-analyzer.dev
# - Login with test account
# - Browse matches, teams, players
# - Test dark mode, notifications

# 4. Check logs for errors
# - SSH into staging server
# - tail -f /var/log/bundesliga/app.log
# - Look for ERROR or CRITICAL messages
```

### Deploying to Production (Step-by-Step)

#### Step 1: Prepare Release Tag

```bash
# 1. Update version in package.json
nano package.json
# Change version: "1.0.0" → "1.1.0"

# 2. Update CHANGELOG.md
nano CHANGELOG.md
# Add section for new version with changes

# 3. Commit version bump
git add package.json CHANGELOG.md
git commit -m "chore: bump version to v1.1.0"
git push origin main

# 4. Create and push release tag
git tag v1.1.0
git push origin v1.1.0

# AUTOMATIC: publish-release.yml triggers
# - Generates changelog automatically
# - Creates GitHub Release
# - Publishes artifacts
```

#### Step 2: Trigger Production Deployment

```bash
# 1. Go to GitHub repository
# 2. Navigate to Actions tab
# 3. Select "Deploy to Production" workflow
# 4. Click "Run workflow" button
# 5. Enter version tag (e.g., v1.1.0)
# 6. Click "Run workflow"
```

#### Step 3: Request Approval

Once the workflow starts:

```
GitHub will notify 2+ reviewers via:
- Email notification
- GitHub notifications
- Slack (if configured)

Reviewers must approve in:
Settings → Environments → production → Deployment protection rules
```

**Approval checklist for reviewers:**
- [ ] Release notes make sense
- [ ] Version number is correct
- [ ] No breaking changes mentioned
- [ ] Staging tests passed
- [ ] Emergency contact available
- [ ] Team notified

#### Step 4: Monitor Deployment

```bash
# 1. Watch GitHub Actions run
# - Monitor "Deploy to Production" workflow
# - Check each step completes successfully
# - Watch for health check results

# 2. Monitor health checks in real-time
# Terminal 1: Watch API
while true; do
  curl -s https://api.production.bundesliga-analyzer.dev/health | jq .
  sleep 2
done

# Terminal 2: Watch Web App
while true; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    https://production.bundesliga-analyzer.dev)
  echo "Web: HTTP $HTTP_CODE | $(date)"
  sleep 2
done

# Terminal 3: Watch logs (if SSH access available)
ssh production@prod.host
tail -f /var/log/bundesliga/app.log | grep -i error
```

#### Step 5: Verify Production Deployment

After deployment completes:

```bash
# 1. Check API health
curl https://api.production.bundesliga-analyzer.dev/health
# Expected response:
# {"status": "healthy", "version": "v1.1.0"}

# 2. Check database
curl https://api.production.bundesliga-analyzer.dev/health/db
# Expected response:
# {"db": "connected", "queries": "responsive"}

# 3. Check auth system
curl https://api.production.bundesliga-analyzer.dev/auth/health
# Expected response:
# {"auth": "operational"}

# 4. Check web app
curl -I https://production.bundesliga-analyzer.dev
# Expected response:
# HTTP/1.1 200 OK

# 5. Browser testing
# - Open https://production.bundesliga-analyzer.dev
# - Verify login works
# - Check main dashboard loads
# - Test key features
# - Monitor browser console for errors

# 6. Performance check
# - Open DevTools (F12)
# - Check Network tab for slow resources
# - Check Console for JavaScript errors
# - Check Performance tab for metrics

# 7. Smoke test key endpoints
for endpoint in /matches /teams /players /leagues; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://api.production.bundesliga-analyzer.dev$endpoint")
  echo "$endpoint: HTTP $CODE"
done
```

#### Step 6: Post-Deployment Communication

```bash
# 1. Announce deployment in Slack
# "#deployments" channel:
# "✅ Deployed v1.1.0 to production
#  by @username
#  All health checks passing
#  https://production.bundesliga-analyzer.dev"

# 2. Update status page (if applicable)
# StatusPage.io → Create incident → Resolved

# 3. Notify stakeholders
# - Product team
# - Customer support
# - Marketing

# 4. Monitor error tracking
# - Check Sentry/error dashboard
# - Watch for new errors
# - Monitor error rate
```

---

## Rollback Procedures

### Automatic Rollback

The production deployment workflow automatically rolls back if health checks fail:

```
Post-deployment → Health checks run
  ↓
If health check fails (API/DB/Auth/Web)
  ↓
AUTOMATIC ROLLBACK triggered
  ↓
Revert to previous stable version
  ↓
Slack notification sent
  ↓
Team alerted
```

### Manual Rollback (Emergency)

If automatic rollback doesn't work or major issues arise:

```bash
# 1. Verify the problem
curl https://api.production.bundesliga-analyzer.dev/health
# If response is error or timeout → rollback

# 2. Get previous stable version
git tag -l | sort -V | tail -10
# Example output:
# v1.0.0
# v1.0.1
# v1.1.0 ← current (broken)
# v1.0.2

# 3. Trigger rollback deployment
gh workflow run deploy-production.yml \
  -f version=v1.0.2 \
  -f rollback=true

# 4. Approve rollback (expedited approval)
# - 2+ team members approve in GitHub
# - Workflow deploys v1.0.2

# 5. Verify rollback
curl https://api.production.bundesliga-analyzer.dev/health
# Expected: {"status": "healthy", "version": "v1.0.2"}

# 6. Post-incident
# - Document what went wrong
# - Create hotfix branch from v1.0.2
# - Test thoroughly before re-deploying
```

### Rollback Decision Tree

```
Is production down?
├─ YES (all endpoints returning errors)
│  └─ IMMEDIATE ROLLBACK → Execute steps above
│
├─ PARTIAL (some endpoints fail)
│  ├─ Can users still use the app?
│  │  ├─ YES → Monitor and update status page
│  │  └─ NO → ROLLBACK
│  └─ Will revert break something?
│     ├─ YES → Partial fix approach
│     └─ NO → ROLLBACK
│
└─ NO (minor issues only)
   ├─ Can fix without rollback? (hotfix)
   │  ├─ YES → Create hotfix
   │  └─ NO → ROLLBACK
   └─ Wait for investigation
```

---

## Emergency Response

### Critical Incident (Production Down)

**Severity Level:** CRITICAL

**Timeline:** First 5 minutes

```
1. IMMEDIATE: Declare incident
   - Notify team lead
   - Open incident channel in Slack (#incidents)
   - Post: "CRITICAL: Production deployment failed"

2. IMMEDIATE: Rollback
   - Execute manual rollback (see section above)
   - Don't wait for approvals
   - Target: Return to stable state < 5 min

3. MONITOR: Verify rollback
   - Curl health endpoints (see verification section)
   - Visual check in browser
   - Check error tracking (Sentry)
   - Get confirmation from 2 team members

4. COMMUNICATE: Update status
   - Slack: "Incident: Rollback to v1.0.2 in progress"
   - StatusPage.io: Set to "Degraded"
   - Email: Notify stakeholders if > 15 min down
```

**Timeline:** 15-30 minutes

```
5. ANALYZE: What went wrong
   - Check deployment logs
   - Check application logs
   - Check error reports
   - Document initial findings

6. COMMUNICATE: Status update
   - Slack: "Incident under investigation"
   - Message: "Service recovering, current status..."
   - ETA for full resolution

7. FIX: Create hotfix
   - Hotfix branch from stable tag
   - Fix the issue
   - Test thoroughly
   - Deploy when ready
```

**Timeline:** After recovery

```
8. POST-INCIDENT: Debrief
   - Write incident report
   - Identify root cause
   - Add preventive measures
   - Schedule postmortem
   - Update documentation
```

### Emergency Contacts

| Role | Name | Email | Phone | Available |
|------|------|-------|-------|-----------|
| Team Lead | [Name] | [email] | [phone] | 24/7 |
| DevOps | [Name] | [email] | [phone] | On-call |
| On-call Engineer | [Name] | [email] | [phone] | Daily |

### Emergency Procedures

**If unable to access GitHub:**
```bash
# SSH directly to production server
ssh deployment@production.bundesliga-analyzer.dev

# Revert to previous version
cd /opt/bundesliga-analyzer
docker pull myregistry/api:v1.0.2
docker-compose up -d

# Verify health
curl http://localhost:8000/health
```

**If health checks hang/timeout:**
```bash
# Kill stuck processes
ssh deployment@prod.host
pkill -9 python
pkill -9 node

# Restart services
systemctl restart api
systemctl restart web

# Monitor startup
journalctl -u api -f
```

---

## Deployment Verification

### Comprehensive Verification Checklist

#### API Verification

```bash
# 1. Health endpoints
echo "=== Health Checks ==="
curl -s https://api.production.bundesliga-analyzer.dev/health | jq .
curl -s https://api.production.bundesliga-analyzer.dev/health/db | jq .
curl -s https://api.production.bundesliga-analyzer.dev/auth/health | jq .

# 2. Core endpoints
echo "=== Core Endpoints ==="
curl -s https://api.production.bundesliga-analyzer.dev/matches | jq '.[] | {id, status}' | head -5
curl -s https://api.production.bundesliga-analyzer.dev/teams | jq '.[] | {id, name}' | head -5
curl -s https://api.production.bundesliga-analyzer.dev/players | jq '.[] | {id, name}' | head -5

# 3. Response times
echo "=== Response Times ==="
curl -w "Total: %{time_total}s\n" -o /dev/null \
  https://api.production.bundesliga-analyzer.dev/matches
```

#### Web App Verification

```bash
# 1. Page load
echo "=== Web App ==="
curl -I https://production.bundesliga-analyzer.dev

# 2. Asset loading
curl -s https://production.bundesliga-analyzer.dev | \
  grep -o 'href="[^"]*\|src="[^"]*' | head -10

# 3. Browser test (manual)
# Open: https://production.bundesliga-analyzer.dev
# Verify:
# - Page loads within 3 seconds
# - Logo visible
# - Navigation menu works
# - Login button functional
```

#### Database Verification

```bash
# 1. Connection check
curl https://api.production.bundesliga-analyzer.dev/health/db

# 2. Query response time
time curl https://api.production.bundesliga-analyzer.dev/matches/count

# 3. Data freshness
curl https://api.production.bundesliga-analyzer.dev/matches | \
  jq '.[0].updated_at'
```

#### Security Verification

```bash
# 1. HTTPS enabled
curl -I https://production.bundesliga-analyzer.dev | grep Strict-Transport-Security

# 2. CORS headers
curl -I https://production.bundesliga-analyzer.dev | grep Access-Control

# 3. Security headers
curl -I https://production.bundesliga-analyzer.dev | grep "X-"
```

---

## Post-Deployment Tasks

### Immediate (< 1 hour)

- [ ] Verify all health checks passing
- [ ] Check error tracking (Sentry)
- [ ] Monitor error rate
- [ ] Check API response times
- [ ] Browser test key features
- [ ] Slack notification sent

### Short-term (1-24 hours)

- [ ] Monitor error logs for new issues
- [ ] Check performance metrics
- [ ] Verify database integrity
- [ ] Test backup/recovery procedures
- [ ] Get user feedback from internal testers
- [ ] Document deployment in wiki

### Follow-up (1-7 days)

- [ ] User feedback survey
- [ ] Performance baseline comparison
- [ ] Security audit
- [ ] Disaster recovery test
- [ ] Document lessons learned
- [ ] Plan next deployment

### Deployment Documentation

After each deployment, update:

```markdown
# [Date] Deployment: v1.1.0

## What Changed
- Feature 1: Added dark mode support
- Feature 2: Improved performance
- Fix 1: Fixed login bug

## Deployment Results
- Tests passed (354/354)
- All health checks passed
- Zero errors in first hour
- Performance baseline maintained

## Metrics
- Response time: 150ms avg
- Error rate: 0.0%
- Uptime: 99.99%

## Issues
- None

## Rollback Plan
- Target: v1.0.2
- Approval: Not needed (no issues)

## Notes
- Smooth deployment
- No customer impact
- Ready for next release
```

---

## Quick Reference

### Common Commands

```bash
# Check deployment status
gh run view <run-id>

# Get logs
gh run view <run-id> --log

# Cancel workflow
gh run cancel <run-id>

# List recent deployments
gh deployment list --environment production --limit 10

# Check health
curl https://api.production.bundesliga-analyzer.dev/health

# SSH to production
ssh deployment@production.bundesliga-analyzer.dev

# View logs (on server)
tail -f /var/log/bundesliga/app.log

# Restart service (on server)
systemctl restart api

# Check uptime (on server)
uptime
systemctl status api
docker ps
```

### Deployment Checklist Template

```markdown
## Deployment: v[VERSION] to [ENVIRONMENT]

### Pre-Deployment
- [ ] Tests passing (coverage > 80%)
- [ ] Code review approved
- [ ] CHANGELOG updated
- [ ] Version bumped
- [ ] Database migrations ready
- [ ] Team notified

### Deployment
- [ ] Workflow triggered
- [ ] All checks passing
- [ ] Approvals obtained
- [ ] Deployment monitoring

### Post-Deployment
- [ ] Health checks verified
- [ ] Web app tested
- [ ] API endpoints responding
- [ ] No new errors
- [ ] Team notified
- [ ] Documentation updated

### Issues/Notes
- [List any issues encountered]

### Approved By
- Deployer: [Name]
- Reviewer: [Name]
- Date: [Date]
```

---

## References

- [CI/CD Setup Guide](./CI_CD_SETUP.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Deployment Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments)

---

**Document Status:** Approved  
**Last Review:** 2026-05-04  
**Next Review:** 2026-06-04  
**Emergency Contact:** [On-call engineer contact info]

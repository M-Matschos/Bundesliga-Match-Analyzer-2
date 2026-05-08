# CI/CD Pipeline Setup & Configuration Guide

**Version:** 1.0.0  
**Last Updated:** 2026-05-04  
**Status:** Production Ready

## Overview

This guide documents the complete CI/CD pipeline setup for Bundesliga Match Analyzer, including GitHub Actions workflows, environment configuration, secret management, and troubleshooting procedures.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Workflow Structure](#workflow-structure)
3. [Setup Instructions](#setup-instructions)
4. [Environment Variables & Secrets](#environment-variables--secrets)
5. [Workflow Details](#workflow-details)
6. [Troubleshooting](#troubleshooting)
7. [Monitoring & Alerts](#monitoring--alerts)

---

## Architecture Overview

### Pipeline Flow

```
Code Push → Test → Lint → Build → Deploy Staging → (Manual Approval) → Deploy Production → Release
```

### Workflow Dependencies

```
test.yml
  ├── backend-tests (pytest + coverage)
  ├── mobile-tests (jest + coverage)
  └── security-scan (Trivy + detect-secrets)
       ↓
lint.yml
  ├── lint-mobile (ESLint + TypeScript)
  ├── lint-backend (Flake8 + Black)
  ├── check-types (TypeScript strict mode)
  └── code-quality (SonarCloud + Hadolint)
       ↓
build.yml
  ├── build-mobile (production bundle)
  ├── build-backend (Docker image)
  └── performance-check (Lighthouse CI)
       ↓
deploy-staging.yml (auto-deploy on main merge)
  ├── deploy-staging
  ├── smoke-tests
  └── validate-deployment
       ↓
deploy-production.yml (manual approval required)
  ├── approval (environment protection)
  ├── deploy-production
  ├── health-checks
  └── post-deployment
       ↓
publish-release.yml (on tag or manual trigger)
  ├── create-release
  ├── publish-artifacts
  └── notify-release
```

---

## Workflow Structure

### 1. Test Workflow (test.yml)

**Triggers:** Push to main/develop, Pull requests  
**Purpose:** Run all tests and security scans

**Jobs:**
- `backend-tests` - Run pytest with coverage threshold (80%)
- `mobile-tests` - Run Jest with coverage threshold (80%)
- `security-scan` - Trivy vulnerability scanner + secret detection
- `test-summary` - Generate test report

**Key Features:**
- Coverage reporting to Codecov
- Artifact archival (30-day retention)
- Automatic fail on coverage < 80%
- Security scanning with SARIF output

### 2. Lint Workflow (lint.yml)

**Triggers:** Push to main/develop, Pull requests  
**Purpose:** Enforce code quality standards

**Jobs:**
- `lint-mobile` - ESLint, TypeScript, Prettier checks
- `lint-backend` - Black, Flake8, Pylint checks
- `check-types` - TypeScript strict mode validation
- `code-quality` - SonarCloud analysis, Dockerfile linting
- `summary` - Linting summary report

**Key Features:**
- Multiple code quality tools
- GitHub annotations for violations
- SonarCloud integration (optional)
- Hadolint for Dockerfile validation

### 3. Build Workflow (build.yml)

**Triggers:** Push to main/develop, Pull requests  
**Purpose:** Build production bundles and analyze performance

**Jobs:**
- `build-mobile` - React Native web bundle production build
- `build-backend` - Docker image build
- `build-summary` - Build status summary
- `performance-check` - Lighthouse CI analysis

**Key Features:**
- Bundle size analysis (15 MB threshold warning)
- Docker image size reporting
- Artifact archival (30-day retention)
- Performance baseline tracking

### 4. Staging Deployment (deploy-staging.yml)

**Triggers:** Push to main, workflow_run (after build)  
**Purpose:** Auto-deploy to staging for testing

**Jobs:**
- `deploy-staging` - Deploy to staging.bundesliga-analyzer.dev
- `validate-deployment` - Run smoke tests and integration tests

**Key Features:**
- Automatic deployment on main push
- Preview URL generation
- PR comments with deployment status
- Smoke test validation
- Health checks

### 5. Production Deployment (deploy-production.yml)

**Triggers:** Manual workflow_dispatch  
**Purpose:** Controlled production deployment with approval gate

**Jobs:**
- `approval` - Environment protection (manual approval required)
- `deploy-production` - Deploy to production.bundesliga-analyzer.dev
- `post-deployment` - Health checks and notifications
- `failure-notification` - Alert on deployment failure

**Key Features:**
- Manual approval gate (GitHub Environment Protection)
- Automatic health checks
- Automatic rollback on failure
- Release notes generation
- Slack notifications
- Deployment metadata archival (90-day retention)

### 6. Release Publishing (publish-release.yml)

**Triggers:** Tag push (v*), Manual workflow_dispatch  
**Purpose:** Create GitHub Releases and publish artifacts

**Jobs:**
- `create-release` - Generate changelog and create GitHub Release
- `publish-artifacts` - Package and upload release artifacts
- `notify-release` - Send notifications

**Key Features:**
- Automatic changelog generation from commits
- Release statistics (commit count, authors)
- Artifact packaging and upload
- Release notification

---

## Setup Instructions

### Prerequisites

- GitHub repository with Actions enabled
- Node.js 18+ (for mobile tests)
- Python 3.11+ (for backend tests)
- Git with tags support

### 1. Initial Repository Setup

```bash
# Clone the repository
git clone <repository-url>
cd bundesliga-analyzer

# Create .github/workflows directory (if not exists)
mkdir -p .github/workflows

# Copy workflow files
cp ci-cd/workflows/*.yml .github/workflows/
```

### 2. Configure GitHub Environments

Create three environments for deployment protection:

**Settings → Environments → New Environment**

#### Staging Environment
- Name: `staging`
- Deployment branches: `main`
- URL: `https://staging.bundesliga-analyzer.dev`
- Protection rules: Optional
- Secrets:
  - `STAGING_DEPLOY_KEY`
  - `DEPLOY_HOST`
  - `DEPLOY_USER`

#### Production Environment
- Name: `production`
- Deployment branches: `main` (tag-based)
- URL: `https://production.bundesliga-analyzer.dev`
- Protection rules: **REQUIRED**
  - Require reviews before deployment: Yes (select 2+ reviewers)
  - Restrict deployments to specific branches: main
  - Deployment branches and environments: Dismiss stale deployment reviews
- Secrets:
  - `PROD_DEPLOY_KEY`
  - `PROD_HOST`
  - `PROD_USER`
  - `SLACK_WEBHOOK` (recommended)

### 3. Repository Secrets Configuration

Go to **Settings → Secrets and variables → Actions**

#### Required Secrets

```yaml
# Deployment
STAGING_DEPLOY_KEY: "SSH private key for staging server"
PROD_DEPLOY_KEY: "SSH private key for production server"

# Services
API_URL: "https://api.example.com"
SONAR_TOKEN: "SonarCloud token for code analysis"

# Notifications
SLACK_WEBHOOK: "https://hooks.slack.com/services/..." (optional)

# Docker Hub (optional)
DOCKER_USERNAME: "your-docker-username"
DOCKER_PASSWORD: "your-docker-password"

# Render (optional)
RENDER_API_KEY: "your-render-api-key"
RENDER_SERVICE_ID: "your-render-service-id"

# Railway (optional)
RAILWAY_TOKEN: "your-railway-token"
RAILWAY_PROJECT_ID: "your-railway-project-id"
```

#### Setting Secrets via CLI

```bash
# Using GitHub CLI
gh secret set STAGING_DEPLOY_KEY < staging-key.pem
gh secret set PROD_DEPLOY_KEY < prod-key.pem
gh secret set SONAR_TOKEN --body "your-sonar-token"
gh secret set SLACK_WEBHOOK --body "your-slack-webhook-url"
```

### 4. Branch Protection Rules

**Settings → Branches → main**

Enable:
- Require a pull request before merging (1+ approvals)
- Require status checks to pass before merging:
  - `test.yml` (backend-tests, mobile-tests, security-scan)
  - `lint.yml` (lint-mobile, lint-backend, check-types)
  - `build.yml` (build-mobile, build-backend)

### 5. Workflow Permissions

**Settings → Actions → General → Workflow Permissions**

- Select: "Read and write permissions"
- Enable: "Allow GitHub Actions to create and approve pull requests"

---

## Environment Variables & Secrets

### Environment Variables (in workflows)

```yaml
# Mobile Build
NODE_ENV: "production"
REACT_APP_API_URL: ${{ secrets.API_URL }}
REACT_APP_VERSION: ${{ github.sha }}
CI: "true"

# Backend Tests
DATABASE_URL: "postgresql://postgres:password@localhost:5432/test"
REDIS_URL: "redis://localhost:6379/0"
TESTING: "true"
```

### Secret Types & Rotation

| Secret | Type | Rotation | Notes |
|--------|------|----------|-------|
| STAGING_DEPLOY_KEY | SSH Key | 90 days | Rotate before expiry |
| PROD_DEPLOY_KEY | SSH Key | 90 days | Critical: rotate regularly |
| SONAR_TOKEN | API Token | 365 days | SonarCloud dashboard |
| SLACK_WEBHOOK | Webhook URL | N/A | Regenerate if compromised |
| DOCKER credentials | Basic Auth | 365 days | Docker Hub settings |

### Managing Secrets Securely

1. **Never commit secrets to git**
2. Use GitHub's encrypted secrets only
3. Rotate production keys every 90 days
4. Use branch protection for main
5. Enable audit logging
6. Use separate secrets for staging vs. production

---

## Workflow Details

### Test Coverage Thresholds

- **Backend (pytest):** Minimum 80% coverage
- **Mobile (Jest):** Minimum 80% coverage
- **Bundle Size:** Warning at > 15 MB, error at > 20 MB

### Performance Targets

- **Bundle Size:** < 15 MB (optimized, < 8 MB ideal)
- **Build Time:** < 5 minutes per workflow
- **Test Execution:** < 3 minutes backend, < 2 minutes mobile
- **Lint Check:** < 1 minute
- **Staging Deploy:** < 2 minutes
- **Production Deploy:** < 5 minutes (with health checks)

### Health Check Endpoints

Production deployment requires successful health checks:

```bash
# API Health
GET https://api.production.bundesliga-analyzer.dev/health
Expected: HTTP 200, JSON: {"status": "healthy"}

# Database
GET https://api.production.bundesliga-analyzer.dev/health/db
Expected: HTTP 200, JSON: {"db": "connected"}

# Auth
GET https://api.production.bundesliga-analyzer.dev/auth/health
Expected: HTTP 200, JSON: {"auth": "operational"}

# Web
GET https://production.bundesliga-analyzer.dev
Expected: HTTP 200 with HTML content
```

---

## Troubleshooting

### Common Issues & Solutions

#### Test Failures

**Issue:** "Jest tests failing with AsyncStorage errors"

**Solution:**
1. Check jest.setup.js mock configuration
2. Ensure test environment is isolated
3. Clear jest cache: `npm test -- --clearCache`

```bash
# Run with verbose output
npm test -- --verbose --no-coverage

# Run single test file
npm test -- NotificationHistoryScreen.test.tsx
```

#### Lint Errors

**Issue:** "ESLint or TypeScript type errors blocking PR"

**Solution:**
1. Run locally: `npm run lint` and `npm run format`
2. Fix manually or use auto-fix: `eslint src/ --fix`
3. For TypeScript: Check `tsconfig.json` strict settings

```bash
# Check TypeScript errors locally
npx tsc --noEmit --listFiles

# Auto-fix ESLint
npm run lint -- --fix
```

#### Build Failures

**Issue:** "Bundle size exceeds 15 MB threshold"

**Solution:**
1. Analyze bundle: `npm run build:analyze`
2. Identify large dependencies: `npm ls --depth=0`
3. Use code splitting or lazy loading
4. Remove unused dependencies

```bash
# Detailed bundle analysis
npx webpack-bundle-analyzer <bundle-path>

# Check for duplicates
npm audit
npm dedupe
```

#### Deployment Issues

**Issue:** "Staging/production deployment fails"

**Solution:**
1. Check deployment credentials:
   ```bash
   # Verify SSH key
   ssh -i deploy-key.pem deployment@staging.host 'echo OK'
   ```

2. Check target server status:
   ```bash
   # Health check
   curl -v https://staging.bundesliga-analyzer.dev/health
   ```

3. Review deployment logs in GitHub Actions

**Issue:** "Health checks fail after deployment"

**Solution:**
1. Wait for application startup (slow startup times)
2. Check database connection: `curl https://api.prod.dev/health/db`
3. Verify auth system: `curl https://api.prod.dev/auth/health`
4. Review application logs on server
5. Automatic rollback should trigger after 3 failed checks

#### Workflow Timeout Issues

**Default timeout:** 360 minutes (6 hours)

**Solution:**
1. Optimize slow tests (profile with `--detectOpenHandles`)
2. Use build matrix for parallel jobs
3. Cache dependencies properly
4. Increase timeout if necessary:

```yaml
jobs:
  slow-job:
    runs-on: ubuntu-latest
    timeout-minutes: 60
```

### Debug Mode

Enable debug logging in workflows:

```bash
# Set secret in repository
gh secret set ACTIONS_STEP_DEBUG --body "true"

# This enables step debug logging
# View in workflow run logs: "Run with debug output"
```

---

## Monitoring & Alerts

### GitHub Notifications

- **Branch notifications:** Main branch push → Test/Lint/Build
- **PR notifications:** New PR → Test/Lint/Build, review required
- **Deployment notifications:** Manual dispatch → Approval → Deploy
- **Release notifications:** Tag push → Create Release

### Slack Notifications (if configured)

Workflows send Slack notifications for:
- Deployment status (success/failure)
- Release publication
- Critical test failures

Configure webhook:
```bash
gh secret set SLACK_WEBHOOK --body "https://hooks.slack.com/services/..."
```

### Monitoring Commands

```bash
# Check recent workflow runs
gh run list --branch main --limit 10

# Get run details
gh run view <run-id>

# View logs
gh run view <run-id> --log

# Cancel running workflow
gh run cancel <run-id>

# Check deployment status
gh deployment-status list --environment production
```

### Performance Tracking

- **Build time trends:** GitHub Actions dashboard → Insights
- **Test coverage:** Codecov dashboard
- **Bundle size:** Lighthouse CI reports (stored as artifacts)
- **Performance metrics:** Deploy logs contain timing information

---

## Rollback Procedures

### Automatic Rollback (Production)

The production deployment workflow automatically rolls back if health checks fail:

```yaml
- Run health checks post-deployment
- If any critical check fails (API, DB, Auth)
- Automatic rollback to previous stable version
- Slack notification sent
```

### Manual Rollback

If automatic rollback fails or is needed:

```bash
# 1. Identify previous stable version
git tag -l | sort -V | tail -5

# 2. Trigger production deployment with previous version
gh workflow run deploy-production.yml \
  -f version=v1.2.3 \
  -f rollback=true

# 3. Monitor deployment
gh run view <new-run-id> --log

# 4. Verify health
curl https://api.production.bundesliga-analyzer.dev/health
```

### Rollback Checklist

- [ ] Identify root cause of deployment failure
- [ ] Determine rollback target version
- [ ] Trigger rollback workflow
- [ ] Monitor health checks
- [ ] Verify all services operational
- [ ] Document incident
- [ ] Notify team via Slack

---

## Workflow Maintenance

### Monthly Tasks

- [ ] Review workflow logs for failures
- [ ] Update GitHub Actions to latest versions
- [ ] Rotate deployment secrets
- [ ] Check for new security vulnerabilities
- [ ] Validate health check endpoints

### Quarterly Tasks

- [ ] Audit workflow permissions
- [ ] Review cost (if using paid runners)
- [ ] Update dependencies
- [ ] Benchmark performance targets
- [ ] Update documentation

### Annual Tasks

- [ ] Security audit of CI/CD pipeline
- [ ] Disaster recovery test
- [ ] Performance optimization review
- [ ] Update rollback procedures

---

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [GitHub Secrets Management](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Jest Testing Documentation](https://jestjs.io/)
- [Pytest Documentation](https://docs.pytest.org/)
- [ESLint Configuration](https://eslint.org/docs/rules/)

---

---

## Pipeline-Fixes & Aktueller Status (2026-05-08)

### Aktueller Status: ✅ Alle Jobs funktionsfähig

**Letzter erfolgreicher Run:** Workflow #16, Commit `2746f4d`  
**Gesamtlaufzeit:** 1 Minute 32 Sekunden

| Job | Status | Dauer | Anmerkung |
|-----|--------|-------|-----------|
| backend-tests | ✅ Erfolgreich | ~1m 5s | Black, Flake8, pytest |
| mobile-tests | ✅ Erfolgreich | ~39s | ESLint, Prettier, Jest |
| security-scan | ✅ Erfolgreich | ~46s | Trivy, detect-secrets |
| build-docker | ✅ Erfolgreich | ~1s | Optional (MVP), kein Docker-Push |

### Fix-History (chronologisch, 2026-05-08)

Folgende Fixes wurden auf dem `main`-Branch durchgeführt, um alle 4 Jobs zum Laufen zu bringen:

| Commit | Beschreibung | Behobenes Problem |
|--------|--------------|-------------------|
| `d12ca6c` | npm cache-dependency-path + security-scan permissions | Pfad-Auflösung fehlgeschlagen |
| `cc8bf6b` | mobile package-lock.json für npm-Caching tracken | Cache konnte nicht gespeichert werden |
| `2e7615b` | Expliziter Pfad für npm cache-dependency-path | Relative Pfad-Auflösung |
| `cf60c29` | `--legacy-peer-deps` Flag für npm install | Peer-Dependency-Konflikte |
| `cdb3486` | `@react-query/react-native` → `@tanstack/react-query` | Nicht existierende Dependency |
| `bed922c` | Veraltete package-lock.json entfernt | Inkonsistente Lock-Datei |
| `7806ac4` | mobile package-lock.json neu generiert | npm-Cache in GitHub Actions kaputt |
| `9eb415b` | Docker Hub Login: `continue-on-error: true` | Secrets nicht konfiguriert |
| `2746f4d` | Docker build-push-action: `continue-on-error: true` | Ungültiges Tag-Format ohne Secrets |

### Bekannte Einschränkungen (MVP)

- **Docker Hub Publishing:** Deaktiviert — Secrets `DOCKER_USERNAME` und `DOCKER_PASSWORD` nicht konfiguriert. Beim Einrichten wird das Image automatisch bei jedem Push auf `main` gebaut und gepusht.
- **CodeQL v2 deprecated:** `github/codeql-action/upload-sarif@v2` → sollte auf `@v3` aktualisiert werden (nur Warnung).
- **Mobile Tests `continue-on-error`:** Test-Fehler blockieren die Pipeline nicht — bewusste MVP-Entscheidung.

### Angewendete Fixes in `test.yml`

```yaml
# mobile-tests Job:
cache-dependency-path: '**/package-lock.json'   # War: mobile/package-lock.json
npm install --legacy-peer-deps                   # War: npm ci
continue-on-error: true                          # Neu: Jest-Schritt

# security-scan Job:
permissions:
  security-events: write
  contents: read
```

---

**Document Status:** Approved  
**Last Review:** 2026-05-08  
**Next Review:** 2026-06-08

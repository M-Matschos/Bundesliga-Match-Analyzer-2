---
phase: D-production
plan: 03
type: execute
wave: 3
depends_on: [02]
files_modified:
  - .github/workflows/test.yml
  - .github/workflows/lint.yml
  - .github/workflows/build.yml
  - .github/workflows/deploy-staging.yml
  - .github/workflows/deploy-production.yml
  - .github/workflows/publish-release.yml
autonomous: true
requirements:
  - D-CI-CD-SETUP
  - D-GITHUB-ACTIONS
  - D-DEPLOYMENT-AUTOMATION
user_setup: []

must_haves:
  truths:
    - All GitHub Actions workflows created and tested
    - CI/CD pipeline automatically runs on every push to main/develop
    - Test workflow passes 100% of test suite
    - Lint workflow enforces code quality standards
    - Build workflow generates production bundle
    - Staging deployment automated with preview URLs
    - Production deployment requires manual approval
    - Rollback procedures documented
  artifacts:
    - path: .github/workflows/test.yml
      provides: Automated test suite execution on PR
      exports: ["npm test", "coverage reports"]
    - path: .github/workflows/lint.yml
      provides: Code quality checks (ESLint, TypeScript)
      exports: ["npm run lint", "type checking"]
    - path: .github/workflows/build.yml
      provides: Production build and bundle analysis
      exports: ["npm run build", "bundle size report"]
    - path: .github/workflows/deploy-staging.yml
      provides: Automated staging deployment
      exports: ["preview URL", "live preview environment"]
    - path: .github/workflows/deploy-production.yml
      provides: Production release workflow with manual approval
      exports: ["production deployment", "release artifacts"]
    - path: CI_CD_SETUP.md
      provides: CI/CD configuration and workflow documentation
      min_lines: 100
  key_links:
    - from: .github/workflows/test.yml
      to: .github/workflows/build.yml
      via: test success gates build
      pattern: "needs: test"
    - from: .github/workflows/build.yml
      to: .github/workflows/deploy-staging.yml
      via: build success gates staging deploy
      pattern: "needs: build"
---

<objective>
Phase D3: CI/CD Pipeline Setup — Configure automated testing, linting, building, and deployment workflows using GitHub Actions.

**Zweck:** Alle Code-Changes müssen automatisch getestet, gelintet und gebaut werden. Staging-Deployment soll automatisch erfolgen. Production-Deployment braucht manuelle Genehmigung. Rollback-Verfahren müssen dokumentiert sein.

**Output:**
- 5 GitHub Actions workflows (test, lint, build, deploy-staging, deploy-production)
- All workflows passing with 100% test coverage
- Automated staging deployment on every PR merge
- Manual approval gate for production deployment
- Rollback procedures documented
- CI/CD setup guide and troubleshooting
</objective>

<execution_context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/D-production/D-02-PLAN.md
@.github/
@package.json
</execution_context>

<context>
## Phase D2 Completion

Phase D2 (Performance Optimization) completed with:
- Bundle size reduced to < 15 MB ✅
- Load time < 3s on 4G ✅
- Memory usage < 100 MB ✅
- 60 FPS stability achieved ✅
- All performance tests passing ✅

## Phase D3 Goals

### CI/CD Workflow Structure

**test.yml** (Triggers on PR)
```yaml
- Checkout code
- Install dependencies
- Run full test suite
- Generate coverage report
- Comment coverage on PR
```

**lint.yml** (Triggers on PR)
```yaml
- Checkout code
- Run ESLint
- Run TypeScript type check
- Report violations
```

**build.yml** (Triggers on test + lint success)
```yaml
- Checkout code
- Install dependencies
- Build production bundle
- Analyze bundle size
- Store artifacts
```

**deploy-staging.yml** (Triggers on main push + build success)
```yaml
- Pull built artifacts
- Deploy to staging environment
- Generate preview URL
- Comment preview URL on PR
- Run smoke tests
```

**deploy-production.yml** (Manual trigger only)
```yaml
- Manual approval required
- Pull built artifacts
- Deploy to production
- Run health checks
- Generate release notes
```

**publish-release.yml** (After production deployment)
```yaml
- Generate CHANGELOG from commits
- Create GitHub Release
- Tag version
- Archive release notes
```

## Success Metrics

- [ ] All 6 workflows created and tested
- [ ] Test workflow: 100% test pass rate
- [ ] Lint workflow: 0 linting errors
- [ ] Build workflow: Production bundle < 15 MB
- [ ] Staging deployment: < 2 minute deployment time
- [ ] Production approval gate: Blocks unsafe deployments
- [ ] Rollback procedure: Documented and tested
- [ ] Team access: All developers can trigger staging

</context>

## Task Breakdown

### D3.1: Setup GitHub Actions Directory
- Create .github/workflows/ directory structure
- Configure workflow permissions and environment secrets
- Test workflow runner connectivity

### D3.2: Create Test Workflow (test.yml)
- Jest test runner with coverage threshold
- Fail on coverage below 80%
- Generate LCOV reports for PR comments
- Cache node_modules for speed

### D3.3: Create Lint Workflow (lint.yml)
- ESLint configuration enforcement
- TypeScript strict mode checking
- Fail on any linting errors
- Report violations in PR comments

### D3.4: Create Build Workflow (build.yml)
- Production build with minification
- Bundle size analysis (warn if > 15 MB)
- Generate performance report
- Store build artifacts (30-day retention)

### D3.5: Create Staging Deployment (deploy-staging.yml)
- Deploy to staging.bundesliga-analyzer.dev
- Run smoke tests after deployment
- Generate preview URL
- Comment deployment success on PR

### D3.6: Create Production Deployment (deploy-production.yml)
- Require manual approval from 2+ team members
- Deploy to production.bundesliga-analyzer.dev
- Run health checks (API, Database, Auth)
- Automatic rollback on health check failure
- Generate release notes from commit history

### D3.7: Documentation
- CI/CD setup guide (how to configure workflows)
- Environment variables and secrets setup
- Troubleshooting guide for common failures
- Rollback procedures for production issues

## Acceptance Criteria

- ✅ All 6 GitHub Actions workflows created and passing
- ✅ Test workflow runs on every PR
- ✅ Lint workflow enforces code quality
- ✅ Build workflow generates production bundle
- ✅ Staging deployment automated and functional
- ✅ Production deployment requires manual approval
- ✅ Health checks prevent bad deployments
- ✅ All team members can access workflows
- ✅ No secrets exposed in workflow logs
- ✅ CI/CD documentation complete and clear

## Deliverables

1. **6 GitHub Actions Workflows**
   - .github/workflows/test.yml
   - .github/workflows/lint.yml
   - .github/workflows/build.yml
   - .github/workflows/deploy-staging.yml
   - .github/workflows/deploy-production.yml
   - .github/workflows/publish-release.yml

2. **CI_CD_SETUP.md**
   - Workflow configuration guide
   - Environment setup instructions
   - Secret management procedures
   - Troubleshooting guide

3. **DEPLOYMENT_GUIDE.md**
   - Step-by-step deployment instructions
   - Manual deployment procedures
   - Rollback procedures
   - Emergency contacts and escalation

4. **Test Results & Reports**
   - All workflow tests passing
   - Coverage reports (80%+ target)
   - Bundle size reports
   - Health check results

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-rc1] — 2026-05-15

### Added
- **WebSocket Integration (Phase 4a):** Redis Pub/Sub, ConnectionManager, Live Match Events
- **Notification System (Phase 4b):** Firebase FCM, Device Registration, Match Subscriptions
- **Virtual Betting System (Phase 4c):** Bet Resolution, ROI Portfolio, Auto-Resolve
- **Health Endpoint:** Backend health check with database and Redis status
- **JWT Uniqueness:** Added `jti` claim to prevent token collision in fast execution

### Fixed
- Database field mismatches in metrics.py and websocket.py (P0)
- CORS configuration now uses config.py settings instead of hardcoded wildcard (P0)
- Mobile authentication flow: /register now returns tokens (P0)
- Dark Mode tests: added initialTheme prop to ThemeContext (P0)
- Rate-limiting test isolation: autouse fixture clears slowapi state (Phase 5)
- 32 integration test route path assertions corrected (Phase 3-5)
- Admin authorization test: fixed async/sync database session isolation
- Regular user authorization test: proper database persistence

### Known Issues
- Token refresh endpoint returns same token within same second (documented in CHANGELOG_RC.md Issue 1)
- Admin user endpoint returns 401 on cold start (documented in CHANGELOG_RC.md Issue 2)
- See `backend/CHANGELOG_RC.md` for detailed pre-release issues

### Changed
- Backend test suite: 454 → 498 passing tests (100% success rate)
- Mobile package version bumped to 1.0.0

### Infrastructure
- All P0 blockers from Phase 2 resolved ✅
- Fixture infrastructure verified as solid (async/await handling correct)
- Test isolation improvements for integration tests
- CI/CD pipelines configured (GitHub Actions: test.yml, build.yml, publish-release.yml)

## Previous Versions

See git tags and commit history for v0.x releases.

---

**Current Status:** Release Candidate — Ready for testing and staging deployment.
**Test Results:** 498/498 passing (100%) | 0 skipped | 0 failing
**Branch:** master | **Git Tag:** v1.0.0-rc1

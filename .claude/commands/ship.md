# Ship Command

Master command for building, linting, and deploying to production.

## Usage

```
/ship [target]
```

## Targets

- `backend` — Build and lint backend (Python), then deploy FastAPI to production
- `mobile` — Build and lint mobile app (React Native), then deploy to app stores
- `all` — Ship both backend and mobile (runs sequentially)

## Pipeline

Each target follows this sequence:

1. **Build** — Compile/bundle the target
   - Backend: Python syntax validation, dependency check
   - Mobile: Metro bundler, generate APK/IPA

2. **Lint** — Check code quality
   - Backend: `pylint` and `mypy` type checking
   - Mobile: `eslint` and TypeScript strict mode

3. **Test** — Run automated tests (optional, use `/ship --skip-tests` to skip)
   - Backend: `pytest backend/tests/`
   - Mobile: `npm test`

4. **Deploy** — Push to production
   - Backend: Push to main branch, trigger GitHub Actions CI/CD
   - Mobile: Upload to Apple App Store and Google Play Store

## Examples

```bash
# Deploy backend only
/ship backend

# Deploy mobile only
/ship mobile

# Deploy both (sequential)
/ship all

# Deploy backend without running tests
/ship backend --skip-tests

# Show status without deploying
/ship status
```

## Error Handling

If any step fails, the pipeline stops and reports the error. Review the error, fix the issue, and run `/ship [target]` again.

## Safety

- Only runs on the `main` branch
- Requires git working directory to be clean (no uncommitted changes)
- Pre-flight checks: node_modules exists, Python venv exists, databases reachable

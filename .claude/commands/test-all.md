# /test-all — Run Complete Test Suite

Executes all backend + mobile tests with coverage reporting.

**Usage:**
```
/test-all              # Full suite (30-40 min)
/test-all --fast       # Only unit tests (5 min)
/test-all --unit       # Backend unit only
/test-all --mobile     # Mobile component only
/test-all --e2e        # End-to-end only
```

**What runs:**
```
✅ pytest backend/tests/unit/ -v --cov=backend --cov-report=html
✅ pytest backend/tests/integration/ -v
✅ npm test -- --coverage --watchAll=false
✅ Coverage check (80% min)
```

**Output:**
- `htmlcov/index.html` (coverage report)
- `coverage.json` (machine-readable)
- Exit code 0 = all pass, 1 = failures

**Used by:** Pre-commit hook, CI/CD, code review

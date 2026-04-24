# /review — Code Review on Recent Changes

Analyzes recent commits for code quality, security, and style issues.

**Usage:**
```
/review                # Review recent commit
/review --range 5      # Last 5 commits
/review --branch       # Compare to main branch
```

**Checks:**
- ✅ Type hints present (Python)
- ✅ Tests included (80% coverage)
- ✅ No hardcoded secrets
- ✅ Docstrings on public functions
- ✅ API docs updated (Swagger)
- ✅ Linting passes (Black, Prettier, ESLint)

**Output:**
- Detailed findings with line numbers
- Severity levels (Critical, High, Medium, Info)
- Actionable remediation steps

**Used by:** Pre-PR checks, code review process

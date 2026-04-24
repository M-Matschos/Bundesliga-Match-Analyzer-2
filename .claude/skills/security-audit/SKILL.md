# 🔒 Security Audit Skill

**Command:** `/security-check`  
**Purpose:** Scan codebase for security vulnerabilities + compliance issues  
**Trigger:** Before every merge or weekly  
**Output:** HTML report + remediation steps

---

## Usage

```bash
# Full audit (all checks)
/security-check --full

# Fast check (critical issues only)
/security-check --fast

# Specific check
/security-check --target api-keys
/security-check --target dsgvo
/security-check --target sql-injection
/security-check --target jwt

# Generate report
/security-check --full --report
```

---

## Checks Performed

### 1. Secrets Detection
- ❌ API keys in code
- ❌ JWT secrets hardcoded
- ❌ Database passwords in commit history
- ❌ Credentials in config files

**Detection:**
```bash
git diff HEAD~1 | grep -E "api_key|secret|password|token"
detect-secrets scan
```

**Example Finding:**
```
🚨 CRITICAL: API_FOOTBALL_KEY in backend/app/main.py:15
   Found: "API_FOOTBALL_KEY = 'abc123xyz789...'"
   
   ✅ Fix:
   1. Remove from code
   2. Add to .env.example (with placeholder)
   3. Load from environment: API_FOOTBALL_KEY = os.getenv('API_FOOTBALL_KEY')
   4. Rotate the key immediately (it's compromised!)
```

### 2. JWT Token Validation
- ✅ Token expiry set
- ✅ Secret is strong (> 32 chars)
- ✅ Algorithm is HS256 or RS256 (not HS512)
- ❌ Token stored in LocalStorage (should be HttpOnly cookie)
- ✅ Refresh token rotation implemented

**Example Finding:**
```
⚠️  WARNING: JWT tokens might be stored in localStorage
   
   Mobile app code (mobile/src/services/api.ts:23):
   const token = localStorage.getItem('access_token')
   
   ✅ Fix:
   Use HttpOnly cookies (default from server)
   Store in secure React Context instead
```

### 3. SQL Injection Prevention
- ✅ Using SQLAlchemy ORM (safe)
- ❌ Raw SQL queries without parameterization
- ✅ Input validation on all endpoints

**Scanning:**
```bash
grep -r "execute(" backend/ | grep -v "select\|filter"
```

### 4. DSGVO Compliance
- ✅ No sensitive data in logs
- ✅ User can export data (implement `/users/export`)
- ✅ User can request deletion (implement `/users/delete`)
- ❌ User IP logged without anonymization
- ✅ Passwords hashed (Bcrypt, not MD5)

### 5. Authentication & Authorization
- ✅ Protected endpoints require JWT
- ✅ Scope validation (read vs write)
- ❌ Missing rate limiting (implement Redis-based)
- ✅ Password reset has expiry token

### 6. Dependencies Vulnerability Scan
```bash
pip-audit                    # Python vulnerabilities
npm audit                    # Node.js vulnerabilities
```

---

## Example Audit Report

```
SECURITY AUDIT REPORT
Generated: 2026-04-24 16:30:00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL (Fix Immediately)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[C001] Secret Found in Code
  Location: backend/app/core/config.py:42
  Finding: JWT_SECRET = "super_secret_key_12345"
  Fix: Move to .env, load with getenv()
  Severity: CRITICAL
  
[C002] Missing Rate Limiting
  Location: backend/app/main.py
  Finding: No rate limiting on /api/v1/weekend/calculate
  Fix: Add @limiter.limit("10/minute")
  Severity: CRITICAL (DoS risk)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HIGH (Fix Before Production)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[H001] Missing CORS Configuration
  Location: backend/app/main.py:8
  Finding: CORS allows all origins (*)
  Fix: Restrict to known domains
  Severity: HIGH

[H002] Missing DSGVO Data Export
  Location: backend/app/routers/
  Finding: No /api/v1/users/export endpoint
  Fix: Implement data export per DSGVO Article 15
  Severity: HIGH

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MEDIUM (Should Fix)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[M001] Missing Security Headers
  Location: backend/app/main.py
  Finding: No X-Content-Type-Options, CSP, etc.
  Fix: Add middleware for security headers
  Severity: MEDIUM
  
[M002] Unencrypted Cookies
  Location: backend/app/routers/auth.py:67
  Finding: Refresh token cookie not secure
  Fix: Add secure=True, httponly=True, samesite='Strict'
  Severity: MEDIUM

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INFO (Nice to Have)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[I001] Missing API Versioning
  Current: /api/v1/ ✅ (good!)
  
[I002] No Error Tracking Service
  Recommendation: Add Sentry integration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 CRITICAL:  2 issues
🟠 HIGH:      2 issues
🟡 MEDIUM:    2 issues
🟢 INFO:      2 notes

APPROVAL: ❌ NOT SAFE FOR PRODUCTION
  Fix critical issues before deploying to production

ESTIMATED TIME: 2 hours to fix all critical + high
```

---

## Automated Remediations

Some issues can be auto-fixed:

```bash
/security-check --full --auto-fix
```

**What gets auto-fixed:**
- ✅ Remove secrets from code + add to .env.example
- ✅ Add security headers middleware
- ✅ Configure CORS properly
- ✅ Add HTTPS redirect
- ❌ Implement complex features (rate limiting, encryption)

---

## Pre-Commit Hook Integration

Add to `.pre-commit-config.yaml`:

```yaml
- repo: local
  hooks:
    - id: security-check
      name: Security Audit
      entry: /security-check --fast
      language: system
      types: [python, typescript]
      pass_filenames: false
      stages: [commit]
```

This runs `/security-check --fast` before every commit.

---

## Continuous Compliance

**Weekly Audit** (GitHub Actions):
```yaml
# .github/workflows/security.yml
name: Security Audit
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: /security-check --full --report
      - uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: security-report.html
```

---

## Remediation Checklist

### Critical Fixes (Do First)
- [ ] Remove all secrets from git history
  ```bash
  git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch SECRET_FILE' HEAD
  rotate all compromised API keys
  ```

- [ ] Add rate limiting
  ```python
  from slowapi import Limiter
  limiter = Limiter(key_func=get_remote_address)
  @router.post("/weekend/calculate")
  @limiter.limit("10/minute")
  async def calculate_weekend(...):
  ```

- [ ] Implement DSGVO export + delete
  ```python
  @router.get("/api/v1/users/export")
  async def export_user_data(current_user = Depends(get_current_user)):
      # Export all user data as JSON
  ```

### High Priority Fixes
- [ ] Configure CORS properly
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["https://app.matchoracle.com"],
      allow_credentials=True,
  )
  ```

- [ ] Secure cookies
  ```python
  response.set_cookie(
      "refresh_token",
      value=token,
      secure=True,
      httponly=True,
      samesite="Strict",
      max_age=7*24*3600
  )
  ```

---

## Next Steps

1. Run `/security-check --full` now
2. Fix all CRITICAL issues
3. Add to CI/CD pipeline (weekly)
4. Document compliance (for investors/legal)

---

**Last Updated:** 2026-04-24  
**Compliance:** GDPR, OWASP Top 10, CWE Top 25

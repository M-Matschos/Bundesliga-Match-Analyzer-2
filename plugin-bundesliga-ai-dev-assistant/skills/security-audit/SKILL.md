---
name: Security Audit & Vulnerability Scanning
description: Scan code for secrets, CVE vulnerabilities, OWASP violations, injection risks, and authentication issues. Generates actionable remediation steps.
---

# Security Audit & Vulnerability Scanning

Comprehensive security analysis detecting 10+ vulnerability categories.

## Vulnerability Categories

1. **Secrets Detection**: API keys, tokens, passwords in code
2. **CVE Scanning**: Known vulnerabilities in dependencies
3. **OWASP Top 10**: Injection, XSS, CSRF, authentication flaws
4. **Code Injection Risks**: Dynamic code execution vulnerabilities
5. **Authentication Issues**: Weak password validation, token handling
6. **Authorization Flaws**: Privilege escalation vulnerabilities
7. **Data Leakage**: Unencrypted sensitive data transmission
8. **Dependency Risks**: Outdated or compromised packages
9. **Configuration Issues**: Exposed secrets in config files
10. **Cryptography**: Weak encryption or hashing

## Usage

### `/security-audit [--scope=SCOPE] [--severity=LEVEL]`

**Scope:**
- `file` — Single file
- `project` — All source code
- `dependencies` — npm packages only

**Severity:**
- `critical` — Security breaks immediately
- `high` — Serious vulnerabilities needing urgent fix
- `all` — All findings

**Example:**
```
/security-audit --scope=project --severity=all
```

## Output

For each vulnerability:
1. **Finding**: What was found
2. **Location**: File and line number
3. **Severity**: Critical/High/Medium/Low
4. **Description**: Why it's a problem
5. **Remediation**: How to fix it
6. **CWE/CVE**: Standard vulnerability reference

## Requirements

- Source code access
- npm dependencies list
- Optional: git history (for secrets in commits)
- Optional: configuration files (.env, config.json)

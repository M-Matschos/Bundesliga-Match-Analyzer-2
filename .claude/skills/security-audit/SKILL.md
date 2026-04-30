---
name: Security-Audit
description: Sicherheits-Audit mit 10+ Kategorien: Secrets, CVE, OWASP, Injection, Auth, Krypto, API-Sicherheit
---

# Security-Audit

Führe Sicherheits-Audit für das Match Oracle Decision Intelligence System durch. Überprüfe 10+ Schwachstellen-Kategorien: Secrets, CVE, OWASP Top 10, Injection-Anfälligkeit, Auth-Probleme, Kryptografie, API-Sicherheit, Data-Leaks, XML-Exploits, API-Rate-Limiting.

## Audit-Kategorien

1. **Secrets & Credentials**: Hardcodierte API-Keys, Passwörter, Tokens
2. **Known Vulnerabilities**: CVE in Dependencies, Security Advisories
3. **OWASP Top 10**:
   - A01: Broken Access Control
   - A02: Cryptographic Failures
   - A03: Injection
   - A04: Insecure Design
   - A05: Security Misconfiguration
   - A06: Vulnerable Components
   - A07: Authentication Failures
   - A08: Data Integrity Failures
   - A09: Logging & Monitoring Failures
   - A10: SSRF

4. **Injection-Anfälligkeit**: SQL, NoSQL, Command, XPath Injection
5. **Authentication & Authorization**: Weak Passwords, Missing MFA, Bad Token Handling
6. **Cryptography**: Weak Algorithms, Unsecured Keys, Missing Encryption
7. **API-Sicherheit**: Missing Rate-Limiting, Exposed Endpoints, Bad CORS
8. **Data Leaks**: Sensitive Data in Logs, unencrypted Storage
9. **XML/XXE**: Externe Entity Injections
10. **Supply Chain**: Dependency Vulnerabilities, Malicious Packages

## Ausgabeformat

1. Sicherheits-Scorecard (CVSS Scoring)
2. Kritische Schwachstellen (priorisiert)
3. Detaillierte Befunde pro Kategorie
4. Remediation-Anleitung mit Beispielcode
5. Compliance-Status (z.B. OWASP, DSGVO)
6. Scan-Zeitstempel und Reporter-Info

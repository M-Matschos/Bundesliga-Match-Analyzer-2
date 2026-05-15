# Plugin Skills Index — Bundesliga Match Analyzer
**Aktualisiert:** 2026-05-14 | **Stack:** FastAPI (Python) + React Native (TypeScript)

> Token-Sparregel: Nur die Skills unter "RELEVANT" laden. Alle anderen ignorieren.

---

## RELEVANT — Diese Skills nutzen

### Debugging & Test-Fixes
| Skill | Aufruf | Wann |
|---|---|---|
| `superpowers:systematic-debugging` | Skill-Tool | Bei unklaren Failures: Root Cause zuerst, dann Fix |
| `ecc:python-testing` | Skill-Tool | Pytest-Fixture-Patterns, async mocking, conftest-Strukturen |
| `ecc:tdd-workflow` | `/ecc:tdd-workflow` | Red→Green→Refactor für jeden einzelnen Fix |

### Code Review & Qualität
| Skill | Aufruf | Wann |
|---|---|---|
| `ecc:fastapi-review` | `/ecc:fastapi-review` | Strukturaudit vor Änderungen: DI, async, CORS, Schemas |
| `ecc:fastapi-patterns` | Skill-Tool | Referenz: Pydantic, dependency_overrides, TestClient |
| `ecc:python-review` | `/ecc:python-review` | Vor jedem Commit: ruff, mypy, bandit, pytest --cov |
| `ecc:quality-gate` | `/ecc:quality-gate` | Lint/Format/Type-Check vor git commit |

### Parallele Agenten & Orchestrierung
| Skill | Aufruf | Wann |
|---|---|---|
| `superpowers:dispatching-parallel-agents` | Skill-Tool | 3+ unabhängige Fixes → parallel bearbeiten |
| `ecc:verification-loop` | `/ecc:verify` | Nach jedem Batch: 6-Phasen-Gate (build→lint→test→security) |

### Session-Kontinuität
| Skill | Aufruf | Wann |
|---|---|---|
| `episodic-memory:remembering-conversations` | Skill-Tool | Session-Start: vorherige Arbeit durchsuchen |
| `ecc:save-session` | `/ecc:save-session` | Session-Ende: Fortschritt dokumentieren |
| `ecc:resume-session` | `/ecc:resume-session` | Session-Start: letzten Stand laden |
| `ecc:checkpoint` | `/ecc:checkpoint` | Benannte Git-Snapshots vor/nach Fixes |

### Git & Release
| Skill | Aufruf | Wann |
|---|---|---|
| `ecc:git-workflow` | Skill-Tool | Commit-Format, Branch-Strategie |
| `ecc:pr` | `/ecc:pr` | Pull Request erstellen |
| `ecc:security-scan` | `/ecc:security-scan` | Vor RC: Secrets, OWASP Top 10 |

### UI/Design (Mobile React Native)
| Skill | Aufruf | Wann |
|---|---|---|
| `uiux-skills/ui-ux-pro-max` | Skill-Tool | Komponenten-Design, Design-System-Tokens |
| `uiux-skills/design-system` | Skill-Tool | Farben, Spacing, Typography |

---

## NICHT RELEVANT — Diese Skills überspringen

Folgende Kategorien sind für dieses Projekt ohne Relevanz (FastAPI + React Native Stack):

```
Flutter / Dart         → wir nutzen React Native, nicht Flutter
Go / Golang            → wir nutzen Python/FastAPI
Kotlin / Android       → wir nutzen React Native
Compose Multiplatform  → nicht relevant
Swift / iOS / SwiftUI  → wir nutzen React Native
Rust                   → nicht relevant
C++ / C#               → nicht relevant
Java / Spring Boot     → wir nutzen FastAPI
Quarkus / Gradle       → nicht relevant
Django / Laravel       → wir nutzen FastAPI
Perl                   → nicht relevant
GAN / ML Training      → ML direkt in Python, kein Skill nötig
Healthcare / HIPAA     → nicht relevant
Logistics              → nicht relevant
Finance / Billing      → nicht relevant
Energy / Procurement   → nicht relevant
Homelab Networking     → nicht relevant
Cisco / BGP            → nicht relevant
DeFi / EVM / Crypto    → nicht relevant
```

---

## Session-Start Routine (Kurzform)

```
1. /ecc:resume-session
2. episodic-memory: search "pytest failures Bundesliga"
3. /ecc:fastapi-review backend/    (nur bei größeren Änderungen)
4. /ecc:checkpoint create "<beschreibung>"
```

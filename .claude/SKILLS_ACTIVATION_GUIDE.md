# Skills Activation Guide — Bundesliga Match Analyzer
**Datum:** 2026-04-29  
**Phase:** C (Dark Mode & Testing) → D (Production Ready)

---

## 🎯 Quick Start: Aktiviere Skills nach Bedarf

### Phase C (JETZT): Dark Mode & Testing Priority
```bash
# Aktiviere diese 4 Skills sofort:
/e2e-testing --dark-mode --phase C
/tdd-workflow --coverage-target 80
/frontend-patterns --dark-mode
/verification-loop --auto-fix
```

### Phase D (SPÄTER): Production Ready Priority
```bash
# Aktiviere diese Skills vor Release:
/security-review --strict
/api-design --openapi
/backend-patterns --validate
```

---

## 📋 Verfügbare Skills (Aktivierungsstatus)

### ✅ READY NOW (Phase C)
- **e2e-testing** — Dark Mode + Component Tests
- **tdd-workflow** — Test Coverage + Test-First Development
- **frontend-patterns** — UI Pattern Documentation
- **verification-loop** — Automatische Test-Verifikation

### ⏳ READY SOON (Phase D)
- **security-review** — OWASP Top 10 Audit
- **api-design** — REST API Dokumentation
- **backend-patterns** — FastAPI Best Practices
- **frontend-design** — Design Token Generation

### 📚 OPTIONAL (Nice-to-Have)
- **documentation-lookup** — Docs Generierung
- **coding-standards** — Code Quality
- **deep-research** — Data Analysis
- **market-research** — Trends Analysis
- **eval-harness** — Model Evaluation

---

## 🔌 Wie Skills aktiviert werden

**Option 1: Inline Skill-Aufruf** (Empfohlen für Phase C)
```bash
/e2e-testing --dark-mode --component NotificationHistoryScreen
```
- Nutze Skills direkt in deiner Arbeit
- Keine permanente Installation nötig
- Token-effizient (nur bei Bedarf laden)

**Option 2: Workspace Integration** (Für Phase D)
```bash
# Skills in .claude/skills/ kopieren
cp -r ~/.claude/plugins/everything-claude-code/.agents/skills/e2e-testing .claude/skills/
cp -r ~/.claude/plugins/everything-claude-code/.agents/skills/tdd-workflow .claude/skills/
```
- Skills sind immer verfügbar
- Funktioniert offline
- Mehr Token-Overhead

---

## 💡 Empfohlene Nutzung nach Phase

### Phase C Workflow (Weeks 1-2)

**Woche 1: Dark Mode Tests**
```bash
# Tag 1: Setup Testing
/e2e-testing --dark-mode --all-screens
/tdd-workflow --phase C --init

# Tag 2-3: Component Testing
/e2e-testing --component NotificationHistoryScreen --dark-mode
/verification-loop --all-tests

# Tag 4-5: Pattern Documentation
/frontend-patterns --dark-mode --all-components
```

**Woche 2: Performance & Patterns**
```bash
# Tag 6-7: Backend Pattern Review
/backend-patterns --validate-all
/api-design --validate-endpoints

# Tag 8: Final Verification
/verification-loop --auto-fix --coverage-target 80
```

### Phase D Workflow (Week 1-2 vor Release)

**Security & Production**
```bash
# Tag 1: Security Audit
/security-review --strict --owasp-top-10

# Tag 2: API Documentation
/api-design --openapi --generate-docs

# Tag 3: Backend Validation
/backend-patterns --service CircuitBreaker --validate

# Tag 4: Final Checks
/deployment-check --release
```

---

## 🎁 Skill Features im Detail

### e2e-testing
```bash
/e2e-testing --dark-mode --component ButtonComponent
# ✅ Erstellt Dark Mode Tests für alle Varianten
# ✅ Prüft Accessibility (WCAG 2.1)
# ✅ Generiert Jest Snapshots
```

### tdd-workflow
```bash
/tdd-workflow --coverage-target 80 --phase C
# ✅ Erzwingt 80%+ Test Coverage
# ✅ Schlägt Tests vor, bevor Code geschrieben wird
# ✅ Validiert Coverage nach jedem Commit
```

### frontend-patterns
```bash
/frontend-patterns --dark-mode --component Card
# ✅ Dokumentiert Pattern Usage
# ✅ Zeigt Dark/Light Varianten
# ✅ Liefert Code Snippets
```

### verification-loop
```bash
/verification-loop --all-tests --auto-fix
# ✅ Sucht failing Tests automatisch
# ✅ Versucht fixes
# ✅ Loops bis alles grün ist
```

### security-review
```bash
/security-review --strict --phase D
# ✅ OWASP Top 10 Scan
# ✅ JWT/AsyncStorage Security Check
# ✅ Dependency Vulnerabilities
```

### api-design
```bash
/api-design --openapi --validate-endpoints
# ✅ Generiert OpenAPI/Swagger
# ✅ Validiert alle Endpoints
# ✅ Erstellt Dokumentation
```

---

## ⚡ Token-Optimierung

**Pro Skill:** ~2,000-5,000 tokens beim Laden + ~500-2,000 tokens pro Aufruf

**Sparen-Tipps:**
1. ✅ **Inline statt Installation** — `/e2e-testing` ist günstiger als `.claude/skills/e2e-testing/`
2. ✅ **Batch-Aktionen** — `/e2e-testing --all-tests` statt einzelne Tests
3. ✅ **Nach Phase aktivieren** — Phase C: 4 Skills, Phase D: +3 Skills
4. ✅ **Optional-Skills skipppen** — documentation-lookup nur wenn nötig

---

## 🔄 Integration mit bestehenden Skills

Diese neue Skills ergänzen die bestehenden Skills aus `.claude/SKILLS_INTEGRATED.md`:

| Existierendes Skill | Neues Komplementär-Skill |
|-------------------|--------------------------|
| sports-analytics | deep-research, market-research |
| generate-tests | e2e-testing, tdd-workflow |
| run-benchmarks | verification-loop |
| security-audit | security-review |
| deployment-check | api-design, backend-patterns |
| ui-ux-pro-max | frontend-design, frontend-patterns |

---

## 📊 Checklist für Phase C

- [ ] `/e2e-testing --dark-mode --all-screens` — Alle Screens testen
- [ ] `/tdd-workflow --phase C --coverage-target 80` — Test Coverage erzwingen
- [ ] `/frontend-patterns --dark-mode --all-components` — Patterns dokumentieren
- [ ] `/verification-loop --all-tests --auto-fix` — Tests auf grün bringen
- [ ] `/backend-patterns --validate-all` — Backend Review
- [ ] `/api-design --validate-endpoints` — API Prüfung
- [ ] Dark Mode Implementierung fertig ✅
- [ ] Alle Tests passing (80%+ coverage) ✅
- [ ] Phase D vorbereitet (security-review ready) ✅

---

## 📞 Troubleshooting

**Skill nicht gefunden?**
```bash
# Prüfe, ob Skill im System verfügbar ist
ls ~/.claude/plugins/everything-claude-code/.agents/skills/e2e-testing
```

**Zu viele Token?**
→ Nutze Inline Skills (`/e2e-testing`) statt Installation in `.claude/skills/`

**Test schlagen fehl nach Skill-Aufruf?**
→ Nutze `/verification-loop --auto-fix` zur automatischen Reparatur

---

**Status:** ✅ Guide fertig  
**Nächster Schritt:** Phase C Skills aktivieren & Dark Mode Tests durchführen

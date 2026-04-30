# Bundesliga Match Analyzer — Integrierte Skills & Agents

**Datum:** 2026-04-29  
**Quelle:** Bundesliga-AI-Dev-Assistant + Everything Claude Code Skills  
**Struktur:** `.claude/skills/`, `.claude/agents/`, `.claude/hooks/`

---

## 🚀 Priorität 1: Sofort Einsetzbar

### 1. **sports-analytics** — Match-Prediction Engine
**Pfad:** `.claude/skills/sports-analytics/`

**Features:**
- 🏆 Ensemble-Model für Match-Vorhersagen (3+ verschiedene Modelle)
- 💰 Kelly-Kriterium für optimal Risk/Reward Berechnung
- 🛑 Kill-Switch-Logik (pausiert Vorhersagen bei < 40% Konfidenz)
- 📊 Model-Drift-Erkennung (automatisches Retraining)
- 💹 ROI-Optimierung mit Hard-Constraints (€10–€500 Wettkasse, €500/Tag Limit)

**Einsatz in Phase C/D:**
```bash
/sports-analytics          # Match vorhersagen
/sports-analytics --model ensemble  # Mehrere Modelle
/sports-analytics --safety-check    # Kill-Switch prüfen
```

**Integration mit Backend:**
- REST API Endpoint: POST `/predictions/match`
- Input: `{ homeTeam, awayTeam, odds, historicalData }`
- Output: `{ prediction, confidence, recommendedBet, Kelly% }`

---

### 2. **Agents — Orchestration** 
**Pfad:** `.claude/agents/`

**Enthält 3 autonome Agenten:**
1. **orchestrator-agent** — Koordiniert alle Skills + parallele Agentenläufe
2. **ensemble-validator-agent** — Validiert Vorhersagen gegen Ensemble-Modelle
3. **learning-feedback-agent** — Sammelt Feedback für kontinuierliches Lernen

**Einsatz:**
```bash
# Autonome Koordination mehrerer Vorhersagen parallel
/run-match-prediction-cycle  # orchestrator-agent startet
```

---

### 3. **run-benchmarks** — Performance-Tuning
**Pfad:** `.claude/skills/run-benchmarks/`

**Features:**
- ⚡ Automatische Performance-Messung (Bundlegröße, Load-Time, FPS)
- 🔍 Bottleneck-Detektion
- 📈 Performance-Baselines erstellen & Regressions erkennen
- 🎯 Targets prüfen: < 15MB bundle, < 3s load, 60 FPS

**Einsatz für Phase D:**
```bash
/benchmark                   # Vollständiger Performance Report
/benchmark --mobile          # React Native Bundle-Größe
/benchmark --api             # Backend Response Times
/benchmark --compare         # Vs. vorherige Version
```

---

### 4. **generate-tests** — Test-Automatisierung
**Pfad:** `.claude/skills/generate-tests/`

**Features:**
- 🧪 Automatische Test-Generierung für Components (React Native)
- ✅ Dark Mode Tests generieren (Phase C)
- 📊 Coverage-Reports
- 🔄 Regression-Tests

**Einsatz für Phase C Dark Mode:**
```bash
/generate-tests --component NotificationToast  # Dark Mode Tests
/generate-tests --dark-mode --full-coverage    # Alle Dark Mode Tests
/generate-tests --api                          # Backend Tests
```

---

### 5. **security-audit** — Vulnerability Scanning
**Pfad:** `.claude/skills/security-audit/`

**Features:**
- 🔐 OWASP Top 10 Scanning
- 🔑 Secrets Detection (API Keys, Tokens)
- 📝 Dependency Vulnerabilities
- 🛡️ Compliance Checks (GDPR, Standards)

**Einsatz für Phase D:**
```bash
/security-audit             # Vollständiger Security Report
/security-audit --strict    # Streng (Phase D Release)
/security-audit --secrets   # Nur Secrets scannen
```

---

### 6. **deployment-check** — Pre-Release Validation
**Pfad:** `.claude/skills/deployment-check/`

**Features:**
- ✅ Pre-Deployment Checks (Build, Tests, Lint)
- 📋 Deployment Checklist
- 🚀 Release Notes Generator
- 🔄 Rollback Plans

**Einsatz vor Production:**
```bash
/deployment-check           # Vollständige Validierung
/deployment-check --release # Release-Level Checks
```

---

## 📚 Integration mit Existing Codebase

### Phase B → Phase C → Phase D Roadmap

| Phase | Fokus | Relevante Skills |
|-------|-------|------------------|
| **B** ✅ | Design Patterns | *(abgeschlossen)* |
| **C** 🔄 | Dark Mode + Testing | `generate-tests`, `run-benchmarks` |
| **D** 📋 | Production Ready | Alle Skills (Security, Deploy, Performance) |

---

## 🎯 Nächste Schritte

### Phase C (Sofort):
1. ✅ Dark Mode Tests mit `/generate-tests --dark-mode` generieren lassen
2. ✅ `/run-benchmarks` vor & nach Dark Mode Implementierung
3. ✅ `/sports-analytics` für Demo-Match-Vorhersagen testen

### Phase D (Später):
1. 🔐 `/security-audit --strict` für Release Validation
2. 🚀 `/deployment-check` vor Production Deploy
3. 📊 `/run-benchmarks --compare` für Performance Regressions
4. 💡 Ensemble Vorhersagen tunen (Model Selection, Weights)

---

## ⚙️ Skill-Aufruf Syntax

Alle Skills sind via `/skill-name` aufrufbar im Claude Code:

```bash
# Match Vorhersagen
/sports-analytics --team "Bayern Munich" --opponent "Dortmund"

# Performance Baseline setzen
/run-benchmarks --baseline --save

# Dark Mode Tests
/generate-tests --component ButtonComponent --dark-mode

# Security Release Check
/security-audit --release --strict

# Deployment Readiness
/deployment-check --final
```

---

## 📖 Dokumentation

Jeder Skill hat interne Dokumentation:
- **SKILL.md** — Detaillierte Feature-Docs
- **README.md** — Quick-Start Guide
- **examples/** — Code-Beispiele

Zum Öffnen:
```bash
cat .claude/skills/sports-analytics/README.md
```

---

## 🔄 Agenten-Orchestration

Die 3 Agenten arbeiten autonom zusammen:

```
User Input
   ↓
[orchestrator-agent] — koordiniert Läufe
   ↓
[ensemble-validator-agent] — validiert Ergebnisse
   ↓
[learning-feedback-agent] — sammelt Feedback
   ↓
Output + Learning Loop
```

**Automatische Workflows:**
- Täglich: Match-Vorhersagen + Model-Update
- Wöchentlich: Performance-Benchmark + Drift-Detection
- Vor Release: Security Audit + Deployment Check

---

**Status:** ✅ Integriert & einsatzbereit  
**Letzte Aktualisierung:** 2026-04-29

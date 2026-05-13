# Bundesliga Match Analyzer

**Status:** Phase C 🔄 (Dark Mode & Testing)  
**Team:** 1 FTE  
**Timeline:** Phase C started 2026-04-26, ongoing dark mode validation and Jest test fixes

## Architecture

### Mobile (`mobile/`)
- **src/screens/** — 10+ screens (Auth, Dashboard, Match Details, Notifications, Settings, etc.)
- **src/components/** — 50+ reusable UI components (Tables, Modals, Toasts, Loading states)
- **src/hooks/** — Custom hooks (useAuth, useNotifications, useMatches, useTheme)
- **src/context/** — AuthContext, ToastContext, ThemeContext
- **src/navigation/** — RootNavigator, Screen types, Deep linking config
- **src/styles/** — Design tokens (colors, typography, spacing, shadows)
- **__tests__/** — Jest unit tests with @testing-library/react-native

### Backend (`backend/`)
- **app/models/** — Database models (Match, Team, Player, Notification, User)
- **app/services/** — Business logic (MatchService, NotificationService, CircuitBreaker)
- **app/routers/** — API endpoints (/matches, /notifications, /teams, /players)
- **app/middleware/** — Authentication, error handling, request logging
- **migrations/** — SQL migrations for schema setup
- **tests/unit/** — Unit tests with pytest

## Code Conventions

### TypeScript/React Native
- Functional components with hooks
- PascalCase for components, camelCase for functions/variables
- Props interfaces prefixed with `I` (e.g., `INotificationProps`)
- Screens in `screens/`, components in `components/`, hooks in `hooks/`

### Python/FastAPI
- snake_case for functions/variables, PascalCase for classes
- Type hints on all functions
- Docstrings on all classes and public functions
- Services handle business logic, routers handle HTTP

### Testing
- Jest for React Native, pytest for Python backend
- Test files in `__tests__/` with `.test.tsx` / `.test.py` suffixes
- Mock patterns defined in jest.setup.js and conftest.py
- Aim for 80%+ coverage on critical paths

### Commit Format
- Prefix: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`
- Example: `feat: add dark mode support to NotificationHistoryScreen`
- Keep commits atomic and focused

## Dark Mode Implementation

**Design System** — Centralized token definitions in `styles/tokens.ts`
```typescript
const lightTheme = { background: '#FFFFFF', text: '#000000', ... }
const darkTheme = { background: '#1A1A1A', text: '#FFFFFF', ... }
```

**Component-Level** — useColorScheme() hook determines active theme
- Light mode: white backgrounds, dark text, subtle shadows
- Dark mode: dark backgrounds, light text, reduced brightness

**Testing** — Dark mode unit tests validate theme switching
- `NotificationHistoryScreen.test.tsx` — 5 tests for light/dark mode rendering
- `NotificationToast.test.tsx` — 5 tests for toast component theming
- All tests use jest mocks for useColorScheme and useTheme hooks

## Phase Status

### Phase A ✅ COMPLETE
Mobile foundation with 10+ screens, authentication, navigation, and provider setup. 70+ tests passing.

### Phase B ✅ COMPLETE
5 design patterns implemented: Table, Modal, Toast, Loading/Error, Navigation. 300+ tests, 65+ KB docs.

### Phase C 🔄 IN PROGRESS
Dark mode implementation and comprehensive test validation. Current tasks:
- Resolve Jest configuration for React Native component mocks (10 failing dark mode tests)
- Validate all screens support theme switching
- Complete API integration tests

### Phase D 📋 PLANNED
Production readiness: CI/CD pipeline, security audit, performance optimization, deployment guide.

## Testing Standards

**Jest Setup** — jest.setup.js mocks React Native and navigation libraries
**Test Pattern** — Arrange-Act-Assert with async/await for async operations
**Naming** — `test('renders <component> with <condition>', async () => {})`
**Mocking** — useAuth, useNotifications, useColorScheme, useTheme all mocked globally
**Dark Mode Tests** — Validate light/dark rendering, color switching, component behavior

## Security

- JWT tokens stored in AsyncStorage (secure storage recommended for production)
- Notification permissions requested at runtime
- Backend API validates all incoming data
- No sensitive data logged to console

## Performance Targets

- Bundle size: < 15 MB
- First load: < 3s
- Frame rate: 60 FPS
- Memory usage: < 100 MB
- Network: Request timeout 10s, max retry 3x with exponential backoff

## .Codex/ Directory Structure

```
.Codex/
├── skills/                        # Integrierte Entwicklungs-Skills (2026-04-29)
│   ├── sports-analytics/          🏆 Match-Prediction Engine (Kelly, Ensemble, Kill-Switch)
│   ├── generate-tests/            🧪 Automatische Test-Generierung (Dark Mode Phase C!)
│   ├── run-benchmarks/            ⚡ Performance & Regression Baseline Detection
│   ├── security-audit/            🔐 Vulnerability Scanning (OWASP Top 10, Secrets)
│   └── deployment-check/          🚀 Pre-Release Validation Checklist
├── design-system/                 # UI-UX Pro Max Design Intelligence
│   ├── src/ui-ux-pro-max/         📐 161 Industry Rules + 67 Styles + 161 Palettes
│   ├── data/                      Color, typography, React Native, Dark Mode
│   └── scripts/search.py          Domain-specific design recommendations
├── agents/                        # Bundesliga-AI Autonome Agenten
│   ├── orchestrator-agent/        (koordiniert alle Skills, parallele Läufe)
│   ├── ensemble-validator-agent/  (validiert Match-Vorhersagen)
│   └── learning-feedback-agent/   (kontinuierliches Lernen & Model-Update)
├── hooks/
│   ├── PostTooUse.sh      (auto-commit with NM-XXX format)
│   ├── SessionStart.sh    (session initialization)
│   └── PreCompact.sh      (state backup before compression)
├── commands/
│   └── ship.md            (Build → Lint → Deploy master command)
├── plugins/
│   └── vercel/            (Vercel integration plugin)
├── rules/
│   └── api.md             (API-specific rules)
└── SKILLS_INTEGRATED.md   📖 Vollständige Dokumentation (Skills, Agents, Einsatz)
```

## Integrierte Skills & Agents (2026-04-29)

### 🚀 PRIORITY 1: Sofort Einsatzbereit (Phase C/D)

#### 1. **sports-analytics** — Match-Prediction Engine
- 🏆 Ensemble-Models (3+ verschiedene Modelle kombiniert)
- 💰 Kelly-Kriterium für Risk/Reward-Optimierung
- 🛑 Kill-Switch-Logik (Pausiert bei < 40% Konfidenz)
- 📊 Model-Drift-Erkennung & Auto-Retraining
- 💹 ROI-Maximierung: €10–€500 Wettkasse, €500/Tag Limit

**Einsatz:**
```bash
/sports-analytics                    # Match vorhersagen
/sports-analytics --model ensemble   # Mehrere Modelle
/sports-analytics --safety-check     # Kill-Switch prüfen
```

#### 2. **ui-ux-pro-max** — Design Intelligence (NEW!)
- 📐 161 Industry-Specific Rules (Sports Analytics Category!)
- 🎨 67 UI Styles (Glassmorphism, Modern, Sports Dashboard)
- 🌈 161 Color Palettes (Bundesliga Brand Colors Available)
- ✅ React Native Explicit Support
- 🌙 Dark Mode First-Class Support (Phase C!)
- 📱 Responsive Design Patterns (375px–1440px)

**Einsatz für Phase C Dark Mode:**
```bash
/ui-ux-pro-max --dark-mode --theme sports-dashboard
/ui-ux-pro-max --design-system      # Design System generieren
/ui-ux-pro-max --component card     # Card Layout (Match Results)
```

#### 3. **generate-tests** — Test-Automatisierung
- 🧪 Dark Mode Tests generieren (PHASE C PRIORITY!)
- 📊 Component Coverage Reports
- 🔄 Regression-Test Automation
- ✅ Jest + React Native optimiert

```bash
/generate-tests --dark-mode --full-coverage  # Alle Dark Mode Tests
/generate-tests --component NotificationToast
/generate-tests --api                        # Backend Tests
```

#### 4. **run-benchmarks** — Performance Baseline
- ⚡ Bundle Size Measurement (Target: < 15MB)
- ⏱️ Load Time Validation (Target: < 3s)
- 🎬 FPS Stability (Target: 60 FPS smooth)
- 📈 Regression Detection (Before/After comparison)

```bash
/run-benchmarks --baseline              # Setze Baseline
/run-benchmarks --dark-mode --compare   # Nach Changes
```

#### 5. **security-audit** — Vulnerability Scanning (Phase D)
- 🔐 OWASP Top 10 Scanning
- 🔑 Secrets Detection (API Keys, Tokens)
- 📝 Dependency Vulnerability Check
- 🛡️ Compliance Validation

```bash
/security-audit --strict  # Release-Level Checks
/security-audit --secrets # Nur Secrets scannen
```

#### 6. **deployment-check** — Pre-Release Validation (Phase D)
- ✅ Build & Lint & Tests Validation
- 📋 Deployment Checklist
- 🚀 Release Notes Auto-Generation
- 🔄 Rollback Plans

```bash
/deployment-check --release  # Finale Release-Checks
```

### 🤖 PRIORITY 1: Autonome Agenten (Bundesliga-AI Dev Assistant)

#### orchestrator-agent
- Koordiniert alle Skills
- Parallele Match-Vorhersagen
- Automatische Workflow-Orchestration

#### ensemble-validator-agent
- Validiert Vorhersagen gegen Ensemble-Modelle
- Confidence-Scoring
- Kill-Switch Trigger-Evaluation

#### learning-feedback-agent
- Sammelt Feedback aus Vorhersagen
- Model-Update Automation
- Drift-Erkennung & Retraining

### 📋 Phase C → Phase D Roadmap

| Phase | Fokus | Skills |
|-------|-------|--------|
| **C** 🔄 | Dark Mode + Testing | `ui-ux-pro-max`, `generate-tests`, `run-benchmarks` |
| **D** 📋 | Production Ready | Alle + `security-audit`, `deployment-check` |

### 📖 Weitere Dokumentation

Siehe `.Codex/SKILLS_INTEGRATED.md` für:
- Detaillierte Feature-Übersicht
- Skill-spezifische Syntax
- Agent-Orchestration Workflows
- Automatische Tägliche/Wöchentliche Prozesse

## Skills Evaluation & Aktivierung

### 🎯 Neue Skills für Phase C/D (2026-04-29)

Entdeckte **34 verfügbare Skills** aus `~/.Codex/plugins/everything-Codex/`:

**Priority 1 — MÜSSEN für Phase C integriert werden:**
- **e2e-testing** — Dark Mode + Component Tests
- **tdd-workflow** — 80%+ Test Coverage erzwingen
- **frontend-patterns** — UI Pattern Dokumentation
- **verification-loop** — Auto-Test-Verifikation

**Priority 1 — Für Phase D vorbereiten:**
- **security-review** — OWASP Top 10 Audit
- **api-design** — REST API Dokumentation
- **backend-patterns** — FastAPI Best Practices
- **frontend-design** — Design Token Generation

**Priority 2 — Optional (später):**
- documentation-lookup, coding-standards, deep-research, market-research, eval-harness

### 📊 Bewertungsmatrix & Aktivierungsguide

- Siehe `.Codex/SKILLS_EVALUATION.md` für:
  - Detaillierte Bewertung aller 34 Skills
  - Relevanz für Bundesliga Match Analyzer
  - Phase C vs. Phase D Prioritäten
  - Token-Kosten Analyse

- Siehe `.Codex/SKILLS_ACTIVATION_GUIDE.md` für:
  - Quick-Start Aktivierungsbefehle
  - Phase C & D Workflows
  - Skill Features im Detail
  - Troubleshooting & Token-Optimierung

### ⚡ Phase C Sofort-Aktivierung

```bash
# Aktiviere diese 4 Skills jetzt:
/e2e-testing --dark-mode --phase C
/tdd-workflow --coverage-target 80
/frontend-patterns --dark-mode
/verification-loop --auto-fix
```

## Getting Started

**Install dependencies:**
```bash
cd mobile && npm install
cd ../backend && pip install -r requirements.txt
```

**Run tests:**
```bash
npm test                    # Mobile unit tests
pytest backend/tests/       # Backend unit tests
```

**Development:**
```bash
npm run dev                 # Start mobile dev server
python -m uvicorn app.main:app --reload  # Start backend API
```

**Documentation:**
- See `docs/PATTERN_*.md` for component patterns
- See `docs/PHASE_*.md` for phase completion summaries
- See `README.md` for project overview

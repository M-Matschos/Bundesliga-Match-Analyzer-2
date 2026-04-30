---
phase: C-dark-mode
plan: 03
type: execute
wave: 2
depends_on: [C-01]
files_modified:
  - mobile/src/components/MatchPredictionCard.tsx
  - mobile/src/components/Spinner.tsx
  - mobile/src/components/Toast.tsx
  - mobile/src/components/Modal.tsx
  - mobile/src/components/ErrorBoundary.tsx
  - mobile/src/components/FormInputGroup.tsx
  - mobile/src/__tests__/components/DarkModeComponents.test.tsx
autonomous: true
requirements:
  - F1.6
  - F1.8
  - F1.9
user_setup: []

must_haves:
  truths:
    - Alle 6+ Components rendern korrekt in Light Mode
    - Alle 6+ Components rendern korrekt in Dark Mode
    - Keine hardcodierten Farben in Components
    - StyleSheet.create() ist optimiert mit useMemo
  artifacts:
    - path: mobile/src/components/MatchPredictionCard.tsx
      provides: Dynamic colors mit color props
      pattern: "useThemeColors()"
    - path: mobile/src/__tests__/components/DarkModeComponents.test.tsx
      provides: 20+ Tests für Components
      min_lines: 150

---

<objective>
Phase C3: Dark Mode für Components — Implementiere dynamische Farben in allen 6+ Komponenten (MatchPredictionCard, Spinner, Toast, Modal, ErrorBoundary, FormInputGroup).

**Output:**
- 6+ Components mit Dark Mode Support
- 20+ Tests für Component-Rendering
- useMemo Optimierung
- Keine Hardcoded Colors
</objective>

<execution_context>
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/phases/C-dark-mode/C-01-PLAN.md
@mobile/src/hooks/useTheme.ts
@mobile/src/theme/colors.ts
</execution_context>

<context>
## Dependencies

**Blocking:** C-01 muss komplett sein (useTheme Hook, ThemeProvider).

**Parallelisierbar mit C-02** aber nach C-01.

## Components (6+)

1. MatchPredictionCard — Match prediction
2. Spinner — Loading indicator
3. Toast — Notifications
4. Modal — Dialog
5. ErrorBoundary — Error handling
6. FormInputGroup — Form inputs

## Pattern

```typescript
const Component = () => {
  const colors = useThemeColors()
  const styles = useMemo(() => StyleSheet.create({
    container: { backgroundColor: colors.background },
  }), [colors])
  return <View style={styles.container} />
}
```
</context>

<tasks>

<task type="auto">
  <name>Task 1: Dark Mode für MatchPredictionCard + Spinner + Toast</name>
  <files>
    - mobile/src/components/MatchPredictionCard.tsx
    - mobile/src/components/Spinner.tsx
    - mobile/src/components/Toast.tsx
  </files>
  <action>
Update Core Components:

**MatchPredictionCard:**
- background: colors.surface
- text: colors.text
- confidence colors: getConfidenceColor()
- useMemo for styles

**Spinner:**
- Indicator color: colors.primary
- useMemo for styles

**Toast:**
- Background: varies by type (success=green, error=red)
- Text: colors.text
- useMemo for styles

**Alle 3:**
- useThemeColors() hook
- useMemo for styles
- Tests passing
  </action>
  <verify>
    <automated>cd mobile && npm test -- --testPathPattern="MatchPredictionCard|Spinner|Toast" --no-coverage 2>&1 | grep -E "PASS|FAIL"</automated>
  </verify>
  <done>
3 Components Dark Mode. Tests passing.
  </done>
</task>

<task type="auto">
  <name>Task 2: Dark Mode für Modal + ErrorBoundary + FormInputGroup</name>
  <files>
    - mobile/src/components/Modal.tsx
    - mobile/src/components/ErrorBoundary.tsx
    - mobile/src/components/FormInputGroup.tsx
  </files>
  <action>
Update Dialog/Form Components:

**Modal:**
- Modal background: colors.surface
- Title/Text: colors.text
- Buttons: primary/danger colors

**ErrorBoundary:**
- Error display background: colors.red + opacity
- Error text: colors.text
- Retry button: colors.primary

**FormInputGroup:**
- Label: colors.text
- Input: colors.surface, border colors.border
- Placeholder: colors.textMuted
- Error: colors.red, Focus: colors.primary

**Alle 3:**
- useThemeColors()
- useMemo
- Tests passing
  </action>
  <verify>
    <automated>cd mobile && npm test -- --testPathPattern="Modal|ErrorBoundary|FormInputGroup" --no-coverage 2>&1 | grep -E "PASS|FAIL"</automated>
  </verify>
  <done>
3 Components Dark Mode. Tests passing.
  </done>
</task>

<task type="auto">
  <name>Task 3: Schreibe 20+ Dark Mode Tests für Components</name>
  <files>mobile/src/__tests__/components/DarkModeComponents.test.tsx</files>
  <action>
Erstelle Dark Mode Tests (2 pro Component):

```typescript
describe('ComponentName Dark Mode', () => {
  it('renders correctly in light mode', () => {
    render(
      <ThemeProvider initialTheme="light">
        <ComponentName />
      </ThemeProvider>
    )
    // verify light colors
  })
  it('renders correctly in dark mode', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <ComponentName />
      </ThemeProvider>
    )
    // verify dark colors
  })
})
```

**Target:** 20+ Tests, all passing
  </action>
  <verify>
    <automated>cd mobile && npm test -- --testPathPattern="DarkModeComponents.test" --no-coverage 2>&1 | grep -E "PASS|FAIL|Tests:"</automated>
  </verify>
  <done>
20+ Tests geschrieben. Alle passing.
  </done>
</task>

</tasks>

<success_criteria>
1. All 6 Components Dark Mode Ready
2. 20+ Tests written and passing
3. Zero TypeScript errors
4. useMemo verified
5. Ready for Phase C4
</success_criteria>

<output>
Nach Completion: `.planning/phases/C-dark-mode/C-03-SUMMARY.md`
</output>

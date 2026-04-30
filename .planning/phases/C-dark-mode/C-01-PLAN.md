---
phase: C-dark-mode
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - mobile/src/context/ThemeContext.tsx
  - mobile/src/theme/colors.ts
  - mobile/src/hooks/useTheme.ts
  - mobile/src/screens/ProfileScreen.tsx
  - mobile/src/__tests__/context/ThemeContext.test.tsx
  - mobile/src/__tests__/hooks/useTheme.test.tsx
autonomous: true
requirements:
  - F1.1
  - F1.2
  - F1.3
  - F1.4
user_setup: []

must_haves:
  truths:
    - ThemeContext existiert mit mode-State und toggleTheme() Funktion
    - useTheme() Hook liefert aktuelles Theme und Toggle-Funktion
    - Theme-Präferenz wird in AsyncStorage persistiert
    - Theme-Toggle Button ist in ProfileScreen sichtbar und funktional
    - Systemfarbschema wird beim App-Start berücksichtigt
  artifacts:
    - path: mobile/src/context/ThemeContext.tsx
      provides: ThemeContext mit vollständiger Persistierung
      min_lines: 65
    - path: mobile/src/hooks/useTheme.ts
      provides: useTheme() Hook mit AsyncStorage Integration
      min_lines: 35
    - path: mobile/src/theme/colors.ts
      provides: DARK_COLORS + LIGHT_COLORS mit getColors() Funktion
      min_lines: 175
    - path: mobile/src/screens/ProfileScreen.tsx
      provides: Theme Toggle Button in UI
      exports: ["ProfileScreen", "ThemeToggleButton"]
  key_links:
    - from: ProfileScreen
      to: ThemeContext
      via: useTheme() Hook
      pattern: "const { mode, toggleTheme } = useTheme()"
    - from: ThemeContext
      to: AsyncStorage
      via: useEffect persistence
      pattern: "AsyncStorage.setItem('theme', mode)"
    - from: App.tsx
      to: ThemeContext
      via: Provider Wrapper
      pattern: "<ThemeProvider>"
---

<objective>
Phase C1: Dark Mode Infrastructure — Erstelle die Basis-Infrastruktur für Theme-Management und Benutzer-Präferenz-Persistierung.

**Zweck:** Das Fundament für Dark Mode schaffen, damit alle folgenden Screens (C2, C3, C4) dynamische Farben verwenden können. ThemeContext mit AsyncStorage-Persistierung = Benutzer kann Dark/Light Mode wechseln und die Wahl bleibt nach App-Neustart erhalten.

**Output:**
- Vollständig funktionierendes ThemeContext mit mode-State
- useTheme() Hook für alle Screen/Component Implementierungen
- Persistierungs-Logik für User-Präferenz
- Theme Toggle UI in ProfileScreen
- Unit Tests für ThemeContext und Hook
</objective>

<execution_context>
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/ROADMAP.md
@.planning/STATE.md

# Kodebase-Referenzen
@mobile/src/context/AuthContext.tsx
@mobile/src/context/ToastContext.tsx
@mobile/src/theme/colors.ts
@mobile/src/_layout.tsx
</execution_context>

<context>
## Projekt-Kontext

**Phase A** ✅ Abgeschlossen — Mobile Foundation mit 70+ Tests
**Phase B** ✅ Abgeschlossen — Design Patterns mit 300+ Tests
**Phase C** 🔄 In Progress — Dark Mode, Detail Screens, Testing

## Vorhandene Infrastruktur

- **ThemeContext.tsx** existiert bereits mit useColorScheme() Hook
- **colors.ts** hat DARK_COLORS und LIGHT_COLORS Paletten definiert
- **AuthContext** und **ToastContext** zeigen Provider-Pattern
- **Design-Tokens** in design-tokens.ts und colors.ts verfügbar
- **App.tsx** hat Provider-Hierarchy (AuthProvider, ToastProvider, GestureHandler)

## Anforderungen aus F1

- F1.1: ThemeContext mit mode-State ('light' | 'dark')
- F1.2: useTheme() Hook für alle Komponenten
- F1.3: Theme Toggle Button in UI (ProfileScreen)
- F1.4: AsyncStorage Persistierung für User-Präferenz
- F1.7: DARK_COLORS + LIGHT_COLORS Paletten bereits vorhanden
- F1.8/1.9: Farben müssen getColors() verwenden (kein Hardcoding)

## Architektur-Muster

Folge dem Pattern aus **AuthContext.tsx**:
1. createContext() für Type Definition
2. Provider-Komponente mit useState
3. useEffect für Side Effects (AsyncStorage)
4. Custom Hook (useTheme) für Type-sichere Verwendung
5. Error Handling wenn Hook außerhalb Provider verwendet
</context>

<tasks>

<task type="auto">
  <name>Task 1: Erweitere ThemeContext mit AsyncStorage-Persistierung</name>
  <files>mobile/src/context/ThemeContext.tsx</files>
  <action>
Aktualisiere mobile/src/context/ThemeContext.tsx nach folgendem Plan:

1. **Imports hinzufügen:**
   - `AsyncStorage` von '@react-native-async-storage/async-storage'
   - `useCallback` von 'react'

2. **Persistierungs-Logik implementieren:**
   - useEffect Hook: Beim Start `AsyncStorage.getItem('theme')` laden
   - Wenn AsyncStorage Theme vorhanden → verwenden
   - Sonst: systemColorScheme fallback → 'dark'
   - `toggleTheme()`: Neuen Mode berechnen, in State setzen, in AsyncStorage speichern
   - `setTheme()`: Neuen Mode setzen und in AsyncStorage speichern

3. **Fehlerbehandlung:**
   - try/catch um AsyncStorage.getItem (könnte bei ersten Start null sein)
   - null-Check nach AsyncStorage.getItem
   - console.error nur wenn AsyncStorage wirklich fehlschlägt

4. **Type-Sicherheit:**
   - ThemeMode Type bleibt 'light' | 'dark'
   - toggleTheme und setTheme geben void zurück
   - Keine Type-Assertions, nur Validierung

5. **Struktur:**
   - Behalte existierenden Code, ergänze nur:
     - useCallback für memoized toggleTheme/setTheme
     - useEffect für AsyncStorage.getItem beim Mount
     - useEffect für AsyncStorage.setItem wenn mode ändert
   
Hinweis: Die Datei existiert bereits, du ergänzt nur die Persistierungs-Logik. Keine Breaking Changes.

Typ-Definition muss TypeScript 5.x kompatibel sein.
  </action>
  <verify>
    <automated>cd mobile && npm test -- --testPathPattern="ThemeContext.test" -t "AsyncStorage" --no-coverage 2>&1 | head -50</automated>
  </verify>
  <done>
ThemeContext speichert Theme in AsyncStorage und laden beim Start. toggleTheme() + setTheme() aktualisieren both State und Storage. Keine TypeScript-Fehler, keine Console-Errors in Tests.
  </done>
</task>

<task type="auto">
  <name>Task 2: Erstelle useTheme() Hook mit zusätzlichen Utilities</name>
  <files>mobile/src/hooks/useTheme.ts</files>
  <action>
Erstelle neue Datei mobile/src/hooks/useTheme.ts als Custom Hook Wrapper:

1. **Exports:**
   - Exportiere den bestehenden useTheme aus ThemeContext
   - Exportiere Helper-Funktionen:
     - `isDarkMode()` — gibt boolean zurück (mode === 'dark')
     - `getThemeColors(theme?: 'light' | 'dark')` — nutzt getColors() aus colors.ts
     - `useThemeColors()` — Hook, der automatisch bei Mode-Change updated

2. **useThemeColors() Hook (neu):**
   ```typescript
   export function useThemeColors() {
     const { mode } = useTheme()
     const [colors, setColors] = useState(() => getColors(mode))
     
     useEffect(() => {
       setColors(getColors(mode))
     }, [mode])
     
     return colors
   }
   ```
   Das ist für Komponenten, die nicht jeden Props durchreichen wollen.

3. **Type-Sicherheit:**
   - Alle Functions mit expliziten Return Types
   - Props-Interfaces für Hook-Outputs
   - Keine `any` Types

4. **Import Strategy:**
   - Nutze TreeShaking: nur `getColors` aus colors.ts importieren
   - Kommentiere Imports: `// For thematic color resolution in components`

5. **Dokumentation:**
   - JSDoc Comments für jede Function
   - Beispiel-Usage in Comments

6. **Fehlerbehandlung:**
   - isDarkMode() muss sicher sein (try-catch um useTheme)
   - Fallback auf 'dark' wenn useTheme fehlschlägt
  </action>
  <verify>
    <automated>cd mobile && npx tsc --noEmit mobile/src/hooks/useTheme.ts 2>&1 | grep -i error</automated>
  </verify>
  <done>
mobile/src/hooks/useTheme.ts existiert mit useThemeColors(), isDarkMode() und getThemeColors() exports. Keine TypeScript-Fehler. Hook lädt Farben dynamisch basierend auf currentMode.
  </done>
</task>

<task type="auto">
  <name>Task 3: Aktualisiere colors.ts mit getColors() und Validierung</name>
  <files>mobile/src/theme/colors.ts</files>
  <action>
Modifiziere mobile/src/theme/colors.ts um konsistente getColors()-Nutzung:

1. **getColors() Funktion (vorhanden, überprüfen):**
   ```typescript
   export function getColors(theme: 'light' | 'dark') {
     return theme === 'light' ? LIGHT_COLORS : DARK_COLORS
   }
   ```
   Wenn diese Funktion nicht existiert → erstelle sie
   Wenn sie existiert → überprüfe, dass sie korrekt ist

2. **CONTRAST_RATIO Validierung hinzufügen:**
   - Erstelle neue Konstante CONTRAST_CHECKLIST für WCAG AA (4.5:1 min für Text)
   - Dokumentiere Kontrast-Verhältnisse in Kommentaren für critical pairs:
     - text vs background
     - textSecond vs background
     - primary vs background (für Buttons)

3. **Export Konsistenz:**
   - Default Export bleibt `DARK_COLORS` (Dark Mode First)
   - Named Exports: DARK_COLORS, LIGHT_COLORS, getColors, getConfidenceColor, etc.

4. **Type-Safety für getColors():**
   ```typescript
   // Stelle sicher dass:
   const colors: typeof LIGHT_COLORS | typeof DARK_COLORS = getColors('light')
   // → Sollte Type-Safe sein, keine `any`
   ```

5. **Kommentare aktualisieren:**
   - "Dark Mode First" Note hinzufügen
   - WCAG AA Kontrastanforderungen dokumentieren

Diese Task ist Überprüfung + kleinere Fixes, nicht komplettes Umschreiben.
  </action>
  <verify>
    <automated>cd mobile && npx tsc --noEmit mobile/src/theme/colors.ts 2>&1 | grep "error TS"</automated>
  </verify>
  <done>
colors.ts hat getColors() Funktion mit korrekten Type-Signaturen. Keine TypeScript-Fehler. WCAG AA Kommentare vorhanden. Dark Mode First Dokumentation aktuell.
  </done>
</task>

<task type="auto">
  <name>Task 4: Integriere ThemeProvider in App.tsx Provider-Hierarchy</name>
  <files>mobile/src/_layout.tsx</files>
  <action>
Modifiziere mobile/src/_layout.tsx (oder App.tsx) um ThemeProvider zu integrieren:

1. **Überprüfe Provider-Hierarchy:**
   - Prüfe ob ThemeProvider bereits vorhanden ist
   - Wenn nicht → füge hinzu NACH GestureHandlerRootView aber VOR AuthProvider
   - Reihenfolge: GestureHandler → Theme → Auth → Toast → Children

2. **Import ThemeProvider:**
   ```typescript
   import { ThemeProvider } from '../context/ThemeContext'
   ```

3. **Wrapper-Struktur:**
   ```typescript
   <GestureHandlerRootView>
     <ThemeProvider>
       <AuthProvider>
         <ToastProvider>
           {/* Deine Screens */}
         </ToastProvider>
       </AuthProvider>
     </ThemeProvider>
   </GestureHandlerRootView>
   ```

4. **Keine Breaking Changes:**
   - Behalte alle existierenden Provider bei
   - ThemeProvider nur hinzufügen, nichts löschen
   - Teste dass App noch startet (keine Crashes)

5. **TypeScript:**
   - Keine Type-Fehler nach dieser Änderung
   - children Props korrekt propagiert
  </action>
  <verify>
    <automated>cd mobile && npm run build 2>&1 | tail -20</automated>
  </verify>
  <done>
ThemeProvider ist in App/Layout-Hierachie integriert. App startet ohne Fehler. Provider-Order: GestureHandler → Theme → Auth → Toast.
  </done>
</task>

<task type="auto">
  <name>Task 5: Erstelle Theme Toggle Button in ProfileScreen</name>
  <files>mobile/src/screens/ProfileScreen.tsx</files>
  <action>
Füge Theme Toggle Button zu ProfileScreen hinzu:

1. **Button-Komponente erstellen oder verwenden:**
   - Nutze existierende Button-Pattern aus Phase B
   - Oder erstelle Inline-Button mit TouchableOpacity

2. **UI-Struktur:**
   ```typescript
   const ProfileScreen = () => {
     const { mode, toggleTheme } = useTheme()
     
     return (
       <View>
         {/* Existierender Content */}
         
         <TouchableOpacity 
           onPress={toggleTheme}
           style={styles.themeButton}
         >
           <Text>{mode === 'dark' ? '☀️ Light' : '🌙 Dark'}</Text>
         </TouchableOpacity>
       </View>
     )
   }
   ```

3. **Styling:**
   - Nutze getColors(mode) für Button-Farben
   - Icons: ☀️ (Light) oder 🌙 (Dark) oder Text-Label
   - Platzierung: Im Settings/Profile-Bereich, nicht in der Navigation Bar
   - StyleSheet.create() mit useMemo für Performance

4. **Accessibility:**
   - testID="theme-toggle-button" für Testing
   - accessibilityLabel="Toggle theme between light and dark mode"
   - accessibilityRole="button"

5. **Feedback:**
   - Optional: Toast zeigen nach Toggle (via useToast Hook)
   - "Switched to Dark Mode" / "Switched to Light Mode"

6. **Platzierung im Profile:**
   - Nach User-Info, vor Logout Button
   - In separater Section mit Label "Settings" oder "Display"
  </action>
  <verify>
    <automated>cd mobile && npm test -- --testPathPattern="ProfileScreen.test" -t "theme" --no-coverage 2>&1 | tail -30</automated>
  </verify>
  <done>
ProfileScreen hat funktionierenden Theme Toggle Button. Button hat Icon/Label, testID, und accessibility attributes. Klick auf Button toggled Mode und zeigt optional Toast.
  </done>
</task>

<task type="auto">
  <name>Task 6: Schreibe Unit Tests für ThemeContext</name>
  <files>mobile/src/__tests__/context/ThemeContext.test.tsx</files>
  <action>
Erstelle mobile/src/__tests__/context/ThemeContext.test.tsx mit folgenden Tests:

**Test-Suite 1: ThemeContext Initialization (3 Tests)**
1. "renders with system color scheme on mount"
   - Rendere ThemeProvider mit Mock useColorScheme
   - Überprüfe dass mode === 'dark' oder 'light'
   
2. "provides theme context to children"
   - Rendere ThemeProvider mit Child-Komponente
   - Child nutzt useTheme Hook
   - Überprüfe dass mode vorhanden ist

3. "throws error when useTheme used outside provider"
   - Nutze useTheme direkt ohne Provider
   - Erwarte Error: "useTheme must be used within a ThemeProvider"

**Test-Suite 2: Theme Toggle (3 Tests)**
1. "toggleTheme switches from dark to light"
   - Rendere mit initial dark mode
   - Rufe toggleTheme() auf
   - Überprüfe mode === 'light'

2. "toggleTheme switches from light to dark"
   - Initial light mode
   - Rufe toggleTheme() auf
   - Überprüfe mode === 'dark'

3. "setTheme sets specific mode"
   - Rendere ThemeProvider
   - Rufe setTheme('light') auf
   - Überprüfe mode === 'light'

**Test-Suite 3: AsyncStorage Persistence (3 Tests)**
1. "saves theme to AsyncStorage on toggle"
   - Mock AsyncStorage.setItem
   - Rufe toggleTheme() auf
   - Überprüfe AsyncStorage.setItem('theme', newMode)

2. "loads theme from AsyncStorage on mount"
   - Mock AsyncStorage.getItem('theme') → 'light'
   - Rendere ThemeProvider
   - Überprüfe dass mode === 'light'

3. "falls back to system scheme if AsyncStorage is empty"
   - Mock AsyncStorage.getItem → null
   - Mock useColorScheme → 'dark'
   - Rendere ThemeProvider
   - Überprüfe mode === 'dark'

**Mocking Strategy:**
- Nutze jest.mock('@react-native-async-storage/async-storage')
- Mock useColorScheme von react-native
- AsyncStorage: clearAsyncStorage() zwischen Tests

**Target:** 10+ Tests, alle passing
  </action>
  <verify>
    <automated>cd mobile && npm test -- --testPathPattern="ThemeContext.test" --no-coverage 2>&1 | grep -E "PASS|FAIL|Tests:"</automated>
  </verify>
  <done>
ThemeContext.test.tsx hat 10+ Tests. Alle Tests passing. Coverage 80%+. MockAsyncStorage und mockColorScheme korrekt konfiguriert.
  </done>
</task>

<task type="auto">
  <name>Task 7: Schreibe Unit Tests für useTheme Hook</name>
  <files>mobile/src/__tests__/hooks/useTheme.test.tsx</files>
  <action>
Erstelle mobile/src/__tests__/hooks/useTheme.test.tsx mit folgenden Tests:

**Test-Suite 1: useTheme Hook Basic (3 Tests)**
1. "returns theme mode and toggle function"
   - Rendere Hook innerhalb ThemeProvider
   - Überprüfe dass mode und toggleTheme vorhanden sind

2. "useThemeColors returns current theme colors"
   - Rendere Hook innerhalb ThemeProvider
   - Überprüfe dass colors object LIGHT_COLORS oder DARK_COLORS enthält

3. "isDarkMode returns correct boolean"
   - Dark mode → isDarkMode() === true
   - Light mode → isDarkMode() === false

**Test-Suite 2: useThemeColors Dynamic Update (2 Tests)**
1. "updates colors when theme mode changes"
   - Rendere useThemeColors Hook
   - Initial: mode === 'dark'
   - Rufe toggleTheme() auf
   - Überprüfe dass colors zu LIGHT_COLORS wechselt

2. "getThemeColors returns correct palette"
   - getThemeColors('light') === LIGHT_COLORS
   - getThemeColors('dark') === DARK_COLORS

**Test-Suite 3: Hook Error Handling (2 Tests)**
1. "isDarkMode safely handles missing context"
   - Rendere isDarkMode() ohne ThemeProvider
   - Sollte nicht crashen, sondern fallback zu 'dark' geben

2. "useTheme throws when used outside provider"
   - Nutze useTheme() ohne ThemeProvider
   - Erwarte Error

**Target:** 8+ Tests, alle passing
  </action>
  <verify>
    <automated>cd mobile && npm test -- --testPathPattern="useTheme.test" --no-coverage 2>&1 | grep -E "PASS|FAIL|Tests:"</automated>
  </verify>
  <done>
useTheme.test.tsx hat 8+ Tests. Alle Tests passing. Coverage 85%+. Hook Utilities (isDarkMode, useThemeColors, getThemeColors) alle getestet.
  </done>
</task>

<task type="auto">
  <name>Task 8: Verifiziere Dark Mode Toggle in ProfileScreen mit Snapshot Test</name>
  <files>mobile/src/__tests__/screens/ProfileScreen.test.tsx</files>
  <action>
Füge zu bestehender ProfileScreen.test.tsx (oder erstelle neue) diese Tests hinzu:

**Test: Theme Toggle Button (3 Tests)**
1. "renders theme toggle button"
   - Rendere ProfileScreen mit MockAuth + MockTheme
   - Überprüfe dass Theme Toggle Button vorhanden ist
   - testID="theme-toggle-button" gefunden

2. "toggling theme updates button text"
   - Rendere ProfileScreen
   - Initial text: "🌙 Dark" (light mode) ODER "☀️ Light" (dark mode)
   - Rufe fireEvent.press(themeButton) auf
   - Überprüfe dass Text sich ändert

3. "snapshot test: ProfileScreen in light and dark mode"
   - Dark Mode Snapshot
   - Light Mode Snapshot
   - Vergleiche dass beide unterschiedlich sind

**Mocking:**
- Mock useTheme Hook
- Mock useAuth Hook
- Alle Context-Deps mochen

**Target:** 3 Tests, alle passing
  </action>
  <verify>
    <automated>cd mobile && npm test -- --testPathPattern="ProfileScreen.test" --no-coverage 2>&1 | tail -20</automated>
  </verify>
  <done>
ProfileScreen.test.tsx hat Theme Toggle Tests. Theme-Button rendert korrekt. Snapshot Tests zeigen Light/Dark Unterschiede. Alle Tests passing.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| AsyncStorage | Lokale User-Präferenz wird in AsyncStorage gespeichert (kein Encryption nötig für Theme) |
| Theme Toggle UI | User kann Theme via Button wechseln (keine Auth-Checks nötig) |
| useColorScheme() | System-Präferenz wird respektiert, aber User-Wahl überschreibt sie |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-C1-01 | Information Disclosure | AsyncStorage Theme | accept | Theme Preference ist nicht sensibel, nur UI-Einstellung |
| T-C1-02 | Tampering | useTheme Hook | mitigate | Hook-Validierung: useContext checkt ob Provider vorhanden ist |
| T-C1-03 | Denial of Service | AsyncStorage.getItem() | mitigate | Implementiere Try-Catch um AsyncStorage-Fehler. Fallback zu System-Scheme wenn Storage fehlschlägt |

</threat_model>

<verification>
## Phase C1 Verification Checklist

Nach Completion dieser 8 Tasks:

1. **Infrastructure Tests** (8 Tests)
   - `npm test -- --testPathPattern="ThemeContext.test"` — 10+ Tests passing ✓
   - `npm test -- --testPathPattern="useTheme.test"` — 8+ Tests passing ✓

2. **Integration Tests** (ProfileScreen)
   - `npm test -- --testPathPattern="ProfileScreen.test"` — Theme Toggle Tests passing ✓
   - ProfileScreen rendert in Light + Dark Mode ✓

3. **Code Quality**
   - `npm run lint` — Keine Errors ✓
   - `npx tsc --noEmit` — Keine TypeScript-Fehler ✓

4. **Manual Verification (lokal)**
   - App startet ohne Crashes ✓
   - ProfileScreen hat sichtbaren Theme Toggle Button ✓
   - Klick auf Button wechselt Dark/Light Mode ✓
   - App startet in correktem Mode nach Neustart ✓

5. **Artifacts Verification**
   - ✓ ThemeContext.tsx mit AsyncStorage-Persistierung
   - ✓ useTheme.ts Hook mit Utilities
   - ✓ colors.ts mit getColors() Funktion
   - ✓ _layout.tsx hat ThemeProvider
   - ✓ ProfileScreen hat Theme Toggle Button
   - ✓ 18+ Tests geschrieben und passing

</verification>

<success_criteria>
**Phase C1 erfolgreich abgeschlossen wenn:**

1. **ThemeContext** vollständig funktioniert
   - ✅ mode-State synchronized mit AsyncStorage
   - ✅ toggleTheme() und setTheme() funktionieren
   - ✅ System-Präferenz wird beim Start respektiert

2. **useTheme Hook & Utilities** produktionsbereit
   - ✅ useTheme() in alle Komponenten einsetzbar
   - ✅ useThemeColors() für automatisches Color-Update
   - ✅ isDarkMode() und getThemeColors() Helper vorhanden

3. **App-Integration** abgeschlossen
   - ✅ ThemeProvider in Provider-Hierarchy integriert
   - ✅ ProfileScreen hat Theme Toggle Button
   - ✅ Button ist funktionsfähig und persistent

4. **Tests & Quality**
   - ✅ 18+ neue Tests geschrieben
   - ✅ Alle Tests passing (0 Failures)
   - ✅ Keine TypeScript-Fehler
   - ✅ Keine Console-Errors oder Warnings

5. **Ready for Phase C2**
   - ✅ Phase C1 Tasks alle abgeschlossen
   - ✅ Commits gemacht mit klaren Messages
   - ✅ 15+ Screens können jetzt Dark Mode implementieren
   - ✅ 6+ Components können jetzt Dark Mode implementieren

</success_criteria>

<output>
Nach Completion, erstelle Datei: `.planning/phases/C-dark-mode/C-01-SUMMARY.md` mit:
- Zusammenfassung was getan wurde
- Commits die gemacht wurden
- Anzahl der geschriebenen Tests
- Überblick über kommende Phase C2
</output>

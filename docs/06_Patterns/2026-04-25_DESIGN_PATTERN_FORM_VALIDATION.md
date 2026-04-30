# Design Patterns: Form Validation — Bundesliga Match Analyzer

**Erstellt:** 2026-04-25  
**Basierend auf:** DESIGN_SYSTEM_AUDIT.md (62/100 Score)  
**Priorität:** 🔴 CRITICAL (Blocking multiple features)

---

## 🎯 Problem Statement

Das System hat einzelne Input-Komponenten (mit Validierungs-States), aber **keine formalen Muster für**:

1. ❌ Input-Gruppe mit Label + Fehler + Success-Message (atomar)
2. ❌ Multi-Field-Validierung (z.B. Password Confirmation)
3. ❌ Progressive Validation (on blur vs on submit)
4. ❌ Error Recovery UX (Reset, Retry, Clear)
5. ❌ Form-Level vs Field-Level Error Handling

**Impact:** Jedes Formular (LoginForm, Weekend-Calculator, Virtual Bet) kopiert Validierungs-Logik → Inkonsistenz, Fehler

---

## 📋 Pattern 1: Form Input Group (Atom)

### Problem
Login/Register brauchen Label + Input + Error-Message als Einheit. Aktuell: 3 separate Komponenten

### Existing Components
| Komponente | Similarity | Warum nicht ausreichend |
|-----------|-----------|---------------------------|
| Input | Hat Validierungs-States | Kein Label, keine Error-Message |
| Button | Primär für Actions | Nicht für Input-Organisation |
| Error Message | Zeigt nur Text | Nicht mit Input gekoppelt |

### Proposed Design

#### API / Props (React)

```typescript
interface FormInputGroupProps {
  // Layout
  label: string
  labelRequired?: boolean                    // "*" Indicator
  
  // Input
  type: 'text' | 'email' | 'password'
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  
  // Validation
  error?: string                            // Presence = error state
  hint?: string                            // Helper text (below input)
  success?: boolean                         // Überride to green state
  
  // Accessibility
  description?: string                      // For aria-describedby
  required?: boolean
  autoComplete?: string                     // "email", "current-password", etc.
  
  // States
  disabled?: boolean
  loading?: boolean                         // For async validation
}
```

#### Variants

| Variant | Use When | Visual |
|---------|----------|--------|
| **Default** | No interaction | Gray border, placeholder visible |
| **Focus** | User typing | Blue border + ring shadow |
| **Error** | Validation failed | Red border, error message below |
| **Success** | Validation passed | Green check mark, success message |
| **Loading** | Async validation (email uniqueness) | Spinner inside input |
| **Disabled** | Not editable (form locked) | Gray background, no cursor |

#### States

| State | Behavior | Message | Icon |
|-------|----------|---------|------|
| **Default** | Border: #334155 (slate-700) | — | — |
| **Focus** | Border: #3b82f6 (blue) + Ring | — | — |
| **Error** | Border: #dc2626 (red) + Message | "Invalid email" / "Min 6 chars" | ❌ Red X |
| **Success** | Border: #10b981 (green) | "Email is available" | ✅ Green Check |
| **Loading** | Spinner inside input | "Checking..." | ⏳ Spinner |
| **Disabled** | No interaction | — | — |

#### Tokens Used

- **Colors:**
  - Label: `--color-text-primary` (#e2e8f0)
  - Border (Default): `--color-border` (#334155)
  - Border (Focus): `--color-primary` (#3b82f6)
  - Border (Error): `--color-danger` (#dc2626)
  - Border (Success): `--color-success` (#10b981)
  - Error Text: `--color-danger-light` (#fca5a5)
  - Success Text: `--color-success-light` (#d1fae5)

- **Spacing:**
  - Label bottom: `--space-sm` (8px)
  - Input padding: `--space-md` (12-16px)
  - Error message top: `--space-xs` (4px)
  - Hint text top: `--space-xs` (4px)

- **Typography:**
  - Label: `body-sm` (14px), weight 600
  - Input: `body-md` (14px), weight 400
  - Error/Hint: `label-sm` (12px), weight 400

- **Radius:** `--radius-md` (6px)

#### Accessibility

- **Role:** Input group (no specific role, semantic HTML)
- **Keyboard:**
  - `Tab` → Focus input
  - `Shift+Tab` → Previous field
  - `Enter` → Submit form (if inside form)
  - `Escape` → Clear value (optional)

- **Screen Reader:**
  - Announced: `<label> {label}. <input> {description}`
  - Error: `Alert: {error message}`
  - Success: `Checked: {success message}`
  - Required: Announced as "required"

- **ARIA Attributes:**
  ```html
  <div class="form-group">
    <label for="email" class="form-label">
      E-Mail
      <span aria-label="required">*</span>
    </label>
    
    <input
      id="email"
      type="email"
      required
      aria-required="true"
      aria-invalid={hasError}
      aria-describedby={`${id}-error ${id}-hint`}
    />
    
    {error && (
      <div id={`${id}-error`} role="alert" class="error-message">
        {error}
      </div>
    )}
    
    {hint && (
      <div id={`${id}-hint`} class="hint-message">
        {hint}
      </div>
    )}
  </div>
  ```

### Do's and Don'ts

| ✅ Do | ❌ Don't |
|------|---------|
| Show error message immediately on blur | Don't validate on every keystroke (annoying) |
| Clear error when user starts typing | Don't hide label (even on focus) |
| Use red for danger, green for success | Don't use only color (colorblind users) |
| Add icon + text for errors | Don't show multiple errors at once |
| Use `aria-label` + description for clarity | Don't use placeholder as label |
| Allow paste in password fields | Don't disable paste for security theater |
| Show success after validation passes | Don't submit form until all valid |

### Code Examples

#### React Desktop

```jsx
import { useState } from 'react'

function FormInputGroup({
  label,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  success,
  required,
  labelRequired,
  ...props
}) {
  const hasError = !!error
  const showSuccess = success && !hasError

  const inputClasses = [
    'form-input',
    hasError && 'form-input--error',
    showSuccess && 'form-input--success',
  ].filter(Boolean).join(' ')

  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {(required || labelRequired) && (
          <span className="form-label__required" aria-label="required">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClasses}
        required={required}
        aria-invalid={hasError}
        aria-describedby={`${props.id}-error ${props.id}-hint`}
        {...props}
      />

      {hasError && (
        <div className="form-message form-message--error" role="alert">
          <span className="form-message__icon">❌</span>
          {error}
        </div>
      )}

      {showSuccess && (
        <div className="form-message form-message--success">
          <span className="form-message__icon">✅</span>
          {success}
        </div>
      )}

      {hint && (
        <div className="form-hint">
          {hint}
        </div>
      )}
    </div>
  )
}

// Usage
export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  const handleEmailBlur = () => {
    if (!email.includes('@')) {
      setEmailError('E-Mail must contain @')
    } else if (email.length < 5) {
      setEmailError('E-Mail too short')
    } else {
      setEmailError('')
    }
  }

  return (
    <form>
      <FormInputGroup
        id="email"
        label="E-Mail"
        type="email"
        value={email}
        onChange={setEmail}
        onBlur={handleEmailBlur}
        error={emailError}
        hint="We'll never share your email"
        required
        placeholder="your@email.com"
      />
    </form>
  )
}
```

#### React Native

```typescript
import React, { useState } from 'react'
import { View, TextInput, Text } from 'react-native'
import { colors, spacing, typography } from '../theme'

interface FormInputGroupProps {
  label: string
  type?: 'text' | 'email' | 'password'
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  hint?: string
  success?: boolean
  required?: boolean
  placeholder?: string
}

export function FormInputGroup({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  hint,
  success,
  required,
  placeholder,
}: FormInputGroupProps) {
  const hasError = !!error
  const showSuccess = success && !hasError

  const borderColor = hasError
    ? colors.danger
    : showSuccess
    ? colors.success
    : colors.border

  const styles = {
    container: { marginBottom: spacing.lg },
    label: {
      fontSize: typography.body.sm.size,
      fontWeight: typography.body.sm.weight,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    inputContainer: {
      borderWidth: 1,
      borderColor,
      borderRadius: 6,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
    },
    input: {
      fontSize: typography.body.md.size,
      color: colors.text.primary,
    },
    error: {
      color: colors.danger,
      fontSize: typography.label.sm.size,
      marginTop: spacing.xs,
    },
    success: {
      color: colors.success,
      fontSize: typography.label.sm.size,
      marginTop: spacing.xs,
    },
    hint: {
      color: colors.text.muted,
      fontSize: typography.label.sm.size,
      marginTop: spacing.xs,
    },
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={{ color: colors.danger }}>*</Text>}
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          secureTextEntry={type === 'password'}
          keyboardType={type === 'email' ? 'email-address' : 'default'}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
        />
      </View>

      {hasError && <Text style={styles.error}>❌ {error}</Text>}
      {showSuccess && <Text style={styles.success}>✅ {success}</Text>}
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  )
}
```

### Open Questions

1. **Debouncing async validation** — Should we debounce email uniqueness checks (500ms)?
2. **Real-time vs on-blur** — Current spec says "blur", but Password Strength might want real-time feedback
3. **Success message type** — String or ReactNode? (Icons, formatted text?)
4. **Multi-error support** — Show first error only or all errors?

---

## 📋 Pattern 2: Password Confirmation Group (Compound)

### Problem
Register form has Password + Confirm Password, but validation is coupled. Need reusable pattern.

### Proposed Design

```typescript
interface PasswordConfirmationGroupProps {
  password: string
  passwordError?: string
  onPasswordChange: (value: string) => void
  onPasswordBlur?: () => void

  confirmation: string
  confirmationError?: string
  onConfirmationChange: (value: string) => void
  onConfirmationBlur?: () => void

  showRequirements?: boolean            // Min 6, 1 uppercase, etc.
}
```

#### Validation Rules

```
Password:
  ✓ Min 6 characters
  ✓ No spaces allowed
  
Confirmation:
  ✓ Must match password
  ✓ Case-sensitive
```

#### States

| Scenario | Password Border | Confirm Border | Message |
|----------|-----------------|-----------------|---------|
| Both empty | Slate | Slate | — |
| Typing password | Blue (focus) | Slate | "Min 6 chars" (hint) |
| Password valid | Green ✅ | Slate | — |
| Confirm typing | Green | Blue (focus) | — |
| Mismatch | Green | Red ❌ | "Passwords don't match" |
| Match | Green | Green | "Passwords match" |

#### Code Example (React)

```jsx
function PasswordConfirmationGroup({
  password,
  onPasswordChange,
  confirmation,
  onConfirmationChange,
}) {
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')

  const validatePassword = (pwd) => {
    if (pwd.length < 6) {
      setPasswordError('Min 6 characters')
      return false
    }
    if (pwd.includes(' ')) {
      setPasswordError('No spaces allowed')
      return false
    }
    setPasswordError('')
    return true
  }

  const validateConfirmation = (confirm) => {
    if (confirm && confirm !== password) {
      setConfirmError("Passwords don't match")
      return false
    }
    setConfirmError('')
    return true
  }

  return (
    <>
      <FormInputGroup
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={onPasswordChange}
        onBlur={() => validatePassword(password)}
        error={passwordError}
        hint="Min 6 characters, no spaces"
        required
      />

      <FormInputGroup
        id="password-confirm"
        label="Confirm Password"
        type="password"
        value={confirmation}
        onChange={onConfirmationChange}
        onBlur={() => validateConfirmation(confirmation)}
        error={confirmError}
        success={confirmation && !confirmError ? "Passwords match" : undefined}
        required
      />
    </>
  )
}
```

---

## 📋 Pattern 3: Form Error Summary (Container)

### Problem
When form submission fails (e.g., "Email already exists"), where do we show the error?
- Currently: Error toast (disappears after 3s, user might miss it)
- Better: Error summary at top of form

### Proposed Design

```typescript
interface FormErrorSummaryProps {
  errors: FormError[]                   // [{field: "email", message: "..."}]
  onDismiss?: () => void
}

type FormError = {
  field: string
  message: string
}
```

#### Visual

```
┌─────────────────────────────────────┐
│ ⚠️ Please fix the following errors:  │ ← Error Summary
├─────────────────────────────────────┤
│ • Email: Already registered          │
│ • Password: Too common               │
└─────────────────────────────────────┘

Email: [input with red border + "Already registered" message]
Password: [input with red border]
```

#### Accessibility

```html
<div
  role="alert"
  aria-live="polite"
  class="form-error-summary"
>
  <h2>Please fix the following errors:</h2>
  <ul>
    <li>
      <a href="#email">Email: Already registered</a>
    </li>
    <li>
      <a href="#password">Password: Too common</a>
    </li>
  </ul>
</div>
```

---

## 🎯 Implementation Roadmap

### Phase 1 (Week 1): Foundation
- [ ] Export `FormInputGroup` from component library
- [ ] Create shared validation schema (Zod/Yup)
- [ ] Update LoginForm to use FormInputGroup
- [ ] Update WeekendCalculator to use FormInputGroup

### Phase 2 (Week 2): Compound Patterns
- [ ] Implement `PasswordConfirmationGroup`
- [ ] Implement `FormErrorSummary`
- [ ] Add to Register Form
- [ ] Add to Virtual Bet Form

### Phase 3 (Week 3): Testing + Docs
- [ ] Unit tests for validation logic
- [ ] Component tests for FormInputGroup
- [ ] Integration test: Full form flow
- [ ] Storybook stories for all states

### Phase 4 (Week 4): Optimization
- [ ] Debounce async validation (email uniqueness)
- [ ] Add loading state spinner
- [ ] Implement field-level error recovery (clear on keystroke)
- [ ] Add hint text animations

---

## 📊 Success Metrics

| Metric | Target | Current | Owner |
|--------|--------|---------|-------|
| Form validation consistency | 100% of forms use FormInputGroup | 0% (copied code) | Frontend |
| Accessibility WCAG AA | Pass axe audit | Missing ARIA | Frontend |
| Code duplication | 0 validation copies | 8 copies (LoginForm, Register, Betting) | Frontend |
| Test coverage | 80% pattern logic | 0% | QA |
| Documentation | Storybook + docs | This document | Frontend |

---

## 🔗 Related Patterns (To Design Next)

1. **Pattern 4: Data Display Table** — Matches list, Standings table
2. **Pattern 5: Modal Dialog** — Confirmation, Settings
3. **Pattern 6: Toast Notification** — Success, Error, Info messages
4. **Pattern 7: Loading & Error States** — Skeleton, Fallback UI
5. **Pattern 8: Navigation Pattern** — Tabs, Breadcrumbs, Drawer

---

**Status:** 🟡 Design Phase (Ready for Implementation)  
**Next:** Execute Phase 1 (Export FormInputGroup + Integrate into LoginForm)

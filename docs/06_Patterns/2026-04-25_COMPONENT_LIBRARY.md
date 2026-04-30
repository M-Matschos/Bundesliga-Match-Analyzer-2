# Match Oracle Component Library

**Version:** 1.0.0-draft  
**Last Updated:** 2026-04-25  
**Framework:** React (Desktop) + React Native (Mobile)

---

## Button Component

### Description
Primary UI element for user actions. Available in 4 variants and 3 sizes.
**When to use:** Form submissions, navigation, primary/secondary actions

### Variants

| Variant | Usage | Example |
|---------|-------|---------|
| **Primary** | Main call-to-action (submit, confirm) | "Anmelden", "Berechnung starten" |
| **Secondary** | Supporting actions | "Abbrechen", "Zurück" |
| **Danger** | Destructive actions | "Abmelden", "Löschen" |
| **Text** | Links, secondary navigation | Inline action links |

### Props / Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `variant` | `primary` \| `secondary` \| `danger` \| `text` | `primary` | Button style variant |
| `size` | `sm` \| `md` \| `lg` | `md` | Button size |
| `disabled` | `boolean` | `false` | Disable button interaction |
| `loading` | `boolean` | `false` | Show loading spinner + disable |
| `onClick` | `() => void` | — | Click handler |
| `children` | `ReactNode` | — | Button label or icon + text |
| `type` | `button` \| `submit` \| `reset` | `button` | HTML button type |
| `aria-label` | `string` | — | **Required** for icon-only buttons |

### States

| State | Visual | Behavior | CSS Class |
|-------|--------|----------|-----------|
| **Default** | Solid background, no shadow | Pointer cursor | `.btn-{variant}` |
| **Hover** | Background darker, shadow added | Slight lift (2px) | `:hover` |
| **Focus** (Keyboard) | Outline ring (blue) | — | `:focus` |
| **Active** | Background even darker | — | `:active` |
| **Disabled** | Opacity 0.6, grayed out | No-drop cursor | `:disabled` |
| **Loading** | Spinner icon + text faded | Disabled state | `.is-loading` |

### Design Tokens Used
- **Colors:** `--color-primary`, `--color-danger`, `--color-secondary`
- **Spacing:** `--space-sm` (8px padding), `--space-md` (12-16px padding)
- **Typography:** `--font-weight-bold` (600)
- **Radius:** `--radius-md` (6-8px)

### Accessibility

- **Role:** `button`
- **Keyboard:** 
  - `Tab` — focus button
  - `Enter` / `Space` — activate
  - `Escape` — cancel (if modal)
- **Screen Reader:** Announces as button + label text. If icon-only, **must have `aria-label`**
- **Focus Indicator:** Blue ring (min 3px)
- **Contrast:** All variants meet WCAG AA (4.5:1)

### Do's and Don'ts

| ✅ Do | ❌ Don't |
|------|---------|
| Use semantic variant (primary for submit) | Don't use primary for cancel actions |
| Add `aria-label` to icon-only buttons | Don't omit aria-label on icons |
| Show loading state during async actions | Don't disable button without feedback |
| Use disabled state for unavailable actions | Don't hide unavailable buttons |
| Stack buttons vertically on mobile | Don't show 4+ buttons in a row |

### Size Variants

```
Small (sm):    12px padding, 12px font
Medium (md):   12-16px padding, 14px font  [default]
Large (lg):    16-20px padding, 16px font
```

### Code Examples

#### React (Desktop)
```jsx
// Primary variant
<button 
  className="btn-primary" 
  onClick={handleSubmit}
  disabled={loading}
>
  {loading ? 'Lädt...' : 'Anmelden'}
</button>

// Icon-only button (requires aria-label)
<button 
  className="btn-text" 
  aria-label="Abmelden"
  onClick={handleLogout}
>
  ← Logout icon
</button>

// Danger action
<button 
  className="btn-danger"
  onClick={handleDelete}
>
  Löschen
</button>
```

#### React Native (Mobile)
```jsx
import { TouchableOpacity, Text } from 'react-native'

<TouchableOpacity 
  style={styles.btnPrimary}
  onPress={handleSubmit}
  disabled={loading}
  accessibilityLabel="Anmelden"
>
  <Text style={styles.btnText}>
    {loading ? 'Lädt...' : 'Anmelden'}
  </Text>
</TouchableOpacity>
```

---

## Input Component

### Description
Text input for forms. Supports validation states and helper text.

### Props / Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | `text` \| `email` \| `password` | `text` | Input type |
| `value` | `string` | `""` | Current value |
| `onChange` | `(e) => void` | — | Change handler |
| `placeholder` | `string` | — | Placeholder text |
| `label` | `string` | — | Input label (required for a11y) |
| `error` | `string` | — | Error message (triggers error state) |
| `disabled` | `boolean` | `false` | Disable input |
| `required` | `boolean` | `false` | Mark as required |
| `aria-label` | `string` | — | Accessible label (if no visible label) |

### States

| State | Visual | Example |
|-------|--------|---------|
| **Default** | Border gray, white background | User not interacting |
| **Focus** | Blue border, ring shadow | User typing |
| **Error** | Red border, error message below | Validation failed |
| **Disabled** | Gray background, no cursor | Not editable |
| **Filled** | Normal, with value visible | User entered data |

### Validation States

```
Default:   border: 1px solid #334155
Focus:     border: 1px solid #3b82f6, box-shadow: ring
Error:     border: 1px solid #dc2626, color: #fca5a5
Success:   border: 1px solid #10b981
```

### Do's and Don'ts

| ✅ Do | ❌ Don't |
|------|---------|
| Show error message below field | Don't only change border color |
| Use correct `type` (email, password) | Don't use text for passwords |
| Validate on blur (not on every keystroke) | Don't validate too aggressively |
| Show required indicator (*) | Don't rely on placeholder as label |
| Allow paste in password fields | Don't disable paste in passwords |

### Code Examples

#### React
```jsx
<div className="form-group">
  <label htmlFor="email">E-Mail</label>
  <input
    id="email"
    type="email"
    placeholder="your@email.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className={error ? 'input-error' : ''}
  />
  {error && <p className="error-message">{error}</p>}
</div>
```

---

## LoginForm Component

### Description
Full-page login/register form with email + password validation.

### Variants
- **Login Mode:** Email + Password, "Sign In" button
- **Register Mode:** Email + Password + Confirm, "Create Account" button

### Props / Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `onLogin` | `(email, pwd) => Promise` | — | Login handler |
| `onRegister` | `(email, pwd) => Promise` | — | Register handler |
| `loading` | `boolean` | `false` | Show loading state |
| `error` | `string` | `null` | Error message |

### States

| State | Shows |
|-------|-------|
| **Default** | Form, login mode |
| **Register Mode** | Extra password confirm field |
| **Loading** | Button disabled, loading text |
| **Error** | Red error box at top |
| **Success** | Redirects to dashboard |

### Validation Rules

```
Email:
- Must contain @
- Min 5 characters
- Pattern: /.+@.+\..+/

Password:
- Min 6 characters
- Max 128 characters

Register Only:
- Passwords must match
```

### Do's and Don'ts

| ✅ Do | ❌ Don't |
|------|---------|
| Show clear validation errors | Don't submit on Enter (wait for button) |
| Disable button while loading | Don't show password requirements as red |
| Remember email for next visit | Don't auto-login after registration |
| Show "forgot password?" link | Don't store passwords in localStorage |
| Link to T&C when registering | Don't force account creation |

### Code Example

```jsx
<LoginForm
  onLogin={async (email, pwd) => {
    const token = await api.login(email, pwd)
    localStorage.setItem('token', token)
  }}
  onRegister={async (email, pwd) => {
    await api.register(email, pwd)
    // Auto-login
    await onLogin(email, pwd)
  }}
  loading={isLoading}
  error={error?.message}
/>
```

---

## MatchList Component

### Description
Grid of match prediction cards showing probabilities and confidence scores.

### Props / Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `matches` | `Match[]` | `[]` | Array of match objects |
| `loading` | `boolean` | `false` | Show loading skeletons |
| `error` | `string` | `null` | Error message |
| `onSelectMatch` | `(match) => void` | — | Click handler |

### Match Object Structure

```typescript
interface Match {
  id: string
  home_team: string
  away_team: string
  kickoff: string
  league: string
  home_prob: number    // 0-1
  draw_prob: number    // 0-1
  away_prob: number    // 0-1
  confidence: number   // 0-1
}
```

### Layout

**Desktop:** 3-column grid (300px cards)  
**Tablet:** 2-column grid  
**Mobile:** 1-column (full width)

### Card Anatomy

```
┌─────────────────────────┐
│  Home vs Away (H vs A)  │  ← Team names + short codes
│  2025-04-26 | Bundesliga│  ← Date + League badge
├─────────────────────────┤
│ Heimsieg  Unentsch. Auswärts
│   65%        20%        15%    ← Predictions
├─────────────────────────┤
│  Konfidenz: 78%          │  ← Confidence score
└─────────────────────────┘
```

### States

| State | Shows |
|-------|-------|
| **Loading** | 8× skeleton cards, gray placeholder |
| **Empty** | "Keine Spiele gefunden" message |
| **With Data** | Grid of prediction cards |
| **Hover** | Card lifts, border highlights |

### Do's and Don'ts

| ✅ Do | ❌ Don't |
|------|---------|
| Show confidence as % | Don't show raw decimal (0.78) |
| Use consistent colors for outcomes | Don't change colors per match |
| Display skeleton during load | Don't show "Loading..." text |
| Make cards clickable | Don't disable click on hover |
| Responsive grid | Don't force 3 columns on mobile |

---

## Dashboard Component

### Description
Main authenticated view with navigation tabs and content area.

### Tabs

1. **Dashboard** — Upcoming matches list
2. **Weekend-Berechnung** — Calculator form + results
3. **Analytics** — Stats & trends (placeholder for v2)

### Props / Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `user` | `User` | — | Logged-in user object |
| `authToken` | `string` | — | JWT token for API calls |
| `apiBase` | `string` | `http://localhost:8000/api/v1` | API base URL |
| `onLogout` | `() => void` | — | Logout handler |

### Navigation Structure

```
Header (logo, user email, logout button)
    ↓
Tab Bar (Dashboard | Weekend | Analytics)
    ↓
Tab Content Area (matches list, calculator, etc.)
```

### Do's and Don'ts

| ✅ Do | ❌ Don't |
|------|---------|
| Show user email in header | Don't show user ID |
| Refresh data when tab changes | Don't cache forever |
| Show loading while fetching | Don't disable tab during load |
| Persist selected tab | Don't reset to first tab |
| Logout clears token | Don't keep token in memory |

---

## Component Status Summary

| Component | Mobile | Desktop | Documented | Accessible |
|-----------|--------|---------|---|---|
| Button | ✅ | ✅ | ✅ **THIS DOC** | 🟢 Good |
| Input | ✅ | ✅ | ✅ **THIS DOC** | 🟢 Good |
| LoginForm | ✅ | ✅ | ✅ **THIS DOC** | 🟡 Needs labels |
| MatchList | ✅ | ✅ | ✅ **THIS DOC** | 🟡 Needs alt text |
| Dashboard | ✅ | ✅ | ✅ **THIS DOC** | 🟡 Needs ARIA |
| Header | ✅ | ✅ | ⏳ TODO | ⏳ TODO |
| ErrorBoundary | ✅ | ✅ | ⏳ TODO | ⏳ TODO |
| Toast Notifications | ✅ | ✅ | ⏳ TODO | ⏳ TODO |

---

## Design System References

See also:
- `DESIGN_SYSTEM_AUDIT.md` — Full system audit with scores
- `design-tokens.ts` — Centralized color/spacing tokens (mobile)
- `mobile/src/theme/` — Mobile color definitions
- `desktop/src/*/*.css` — Desktop styles (to be migrated to tokens)

---

**Last Updated:** 2026-04-25  
**Next Review:** After token system implementation

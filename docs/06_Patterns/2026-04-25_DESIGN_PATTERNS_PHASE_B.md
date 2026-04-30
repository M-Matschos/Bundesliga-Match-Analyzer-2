# Design Patterns — Phase B Specification

**Status:** Design Phase (vor Implementierung)  
**Datum:** 2026-04-25  
**Version:** 1.0.0

---

## 📋 Overview

Phase B definiert 5 wiederverwendbare Design Patterns für consistent UI/UX across Desktop (React) + Mobile (React Native).

Jedes Pattern nutzt das unified **Design Token System** (Phase C2 ✅) und folgt dem **BEM Naming Convention**.

---

## 1️⃣ TABLE PATTERN

### Use Cases
- Match-Tabellen (Bundesliga, Tabellen-Positionen)
- Spieler-Listen (Team Roster, Injury Report)
- Statistik-Vergleiche (H2H Stats, Form Trends)
- Prognose-Tabellen (Confidence Ranking, Value Bets)

### Desktop (React) Component Props
```typescript
interface Table {
  columns: Column[]
  data: Row[]
  sortable?: boolean
  striped?: boolean
  hover?: boolean
  dense?: boolean
  loading?: boolean
  empty?: string
}

interface Column {
  key: string
  label: string
  width?: "auto" | "narrow" | "wide"
  align?: "left" | "center" | "right"
  sortable?: boolean
  render?: (value: any) => React.ReactNode
}

interface Row {
  id: string
  [key: string]: any
}
```

### Mobile (React Native) Component Props
Equivalent to Desktop but uses FlatList instead of HTML table.

### Variants

#### Basic Table
- Simple list of rows
- 2-3 columns (Team, Points, Win%)
- No sorting, no actions

#### Sortable Table
- Click column header to sort
- Visual indicator (↑/↓) on active column
- Bi-directional sort (ascending/descending)

#### Action Table
- Last column with action buttons (View, Edit, Delete)
- Icons from token system
- Tooltip on hover

#### Dense Table
- Reduced padding (var(--space-sm) instead of var(--space-md))
- Smaller font (var(--body-sm-size))
- For data-heavy views

### States
| State | Visual | Behavior |
|-------|--------|----------|
| **Default** | Rows with borders | Click = select/expand |
| **Hover** | Background: var(--color-primary-light) | Highlight row |
| **Loading** | Skeleton rows | Show 5-10 placeholder rows |
| **Empty** | Centered message | "No data found" |
| **Error** | Error banner above | Retry button |

### Styling
```css
.Table {
  width: 100%;
  border-collapse: collapse;
}

.Table__header {
  background: var(--color-surface);
  border-bottom: 2px solid var(--color-border);
  font-weight: 600;
  font-size: var(--label-md-size);
  color: var(--color-text-secondary);
}

.Table__row {
  border-bottom: 1px solid var(--color-border);
  transition: var(--transition);
}

.Table__row:hover {
  background: rgba(59, 130, 246, 0.05);
}

.Table__cell {
  padding: var(--space-md);
  color: var(--color-text-primary);
  font-size: var(--body-md-size);
}

.Table--striped .Table__row:nth-child(even) {
  background: rgba(30, 41, 59, 0.5);
}
```

---

## 2️⃣ MODAL PATTERN

### Use Cases
- Confirmation dialogs ("Delete match?")
- Detail views (Player bio, Match analysis)
- Forms (Create prediction, Place bet)
- Info panels (League rules, Model explanation)

### Desktop (React) Component Props
```typescript
interface Modal {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  title: string
  size?: "sm" | "md" | "lg"
  footer?: React.ReactNode
  children: React.ReactNode
  confirmText?: string
  cancelText?: string
  loading?: boolean
}
```

### Mobile (React Native) Component Props
Uses bottom-sheet style (slides up from bottom).

### Variants

#### Confirmation Modal
- Title + Message
- 2 buttons: Cancel | Confirm
- Red "Confirm" for destructive (delete)

#### Detail Modal
- Title + Header image (optional)
- Content (scrollable)
- No footer buttons

#### Form Modal
- Title
- Form fields
- Cancel | Submit buttons

#### Alert Modal
- Icon (⚠️ / ✓ / ℹ️)
- Message
- 1 button: OK

### States
| State | Visual | Behavior |
|-------|--------|----------|
| **Closed** | Hidden, overlay gone | |
| **Open** | Centered box, dim overlay | Focus trapped inside |
| **Loading** | Spinner on button | Buttons disabled |
| **Error** | Red border + error text | Can retry |

### Styling
```css
.Modal__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fade-in var(--duration-fast) var(--easing-ease-out);
}

.Modal {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: var(--space-lg);
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.Modal__header {
  font-size: var(--heading-md-size);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-lg);
}

.Modal__footer {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.Modal__footer button {
  flex: 1;
}
```

---

## 3️⃣ TOAST PATTERN

### Use Cases
- Success messages ("Prediction saved!")
- Error alerts ("API failed, retry?")
- Info notifications ("Weekend calc running...")
- Warnings ("Changes not saved")

### Desktop (React) Component Props
```typescript
interface Toast {
  id: string
  type: "success" | "error" | "info" | "warning"
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  autoClose?: number // ms, default 3000
  onClose: () => void
}

interface ToastProvider {
  success: (msg: string) => void
  error: (msg: string) => void
  info: (msg: string) => void
  warning: (msg: string) => void
}
```

### Mobile (React Native) Component Props
Slides in from top (not bottom like native Toasts).

### Variants

#### Success Toast
- Icon: ✓
- Color: var(--color-success)
- Auto-close: 3s

#### Error Toast
- Icon: ⚠️
- Color: var(--color-danger)
- Auto-close: 5s (longer for user to read)
- Optional "Retry" action button

#### Info Toast
- Icon: ℹ️
- Color: var(--color-info)
- Auto-close: 3s

#### Warning Toast
- Icon: ⚡
- Color: var(--color-warning)
- Auto-close: 4s

### States
| State | Visual | Behavior |
|-------|--------|----------|
| **Idle** | Not visible | |
| **Showing** | Slide in from top | Visible for duration |
| **Hovering** | Pause auto-close | Resume on mouse leave |
| **Closing** | Fade out, slide up | Remove from DOM |

### Styling
```css
.Toast {
  position: fixed;
  top: var(--space-lg);
  right: var(--space-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-success);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  box-shadow: var(--shadow-lg);
  z-index: 999;
  min-width: 300px;
  max-width: 400px;
  animation: slide-in-top var(--duration-fast) var(--easing-ease-out);
}

.Toast__icon {
  font-size: 20px;
  flex-shrink: 0;
}

.Toast__content {
  flex: 1;
  color: var(--color-text-primary);
  font-size: var(--body-md-size);
}

.Toast__action {
  padding: var(--space-xs) var(--space-md);
  background: transparent;
  color: var(--color-primary);
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: var(--transition);
}

.Toast__action:hover {
  color: var(--color-primary-hover);
}

.Toast--error {
  border-left-color: var(--color-danger);
}

.Toast--warning {
  border-left-color: var(--color-warning);
}

.Toast--info {
  border-left-color: var(--color-info);
}
```

---

## 4️⃣ LOADING & ERROR STATES PATTERN

### Loading States

#### Skeleton Screens
- Placeholder rows/cards with shimmer animation
- Match card skeleton: Logo + Teams + Stats placeholders
- Table skeleton: 5-10 rows, same width as real data

#### Spinner Overlay
- Full-screen dimmed overlay
- Centered spinner + "Loading..." text
- For long operations (Model training, Data sync)

#### Inline Spinner
- Small spinner + text in button
- Button disabled during load
- Example: "Submit" → "Submitting..." with spinner

### Error States

#### Error Banner
- Red background (rgba(220, 38, 38, 0.1))
- Red border-left
- Icon: ⚠️
- Message + optional "Retry" button
- Dismissible (X button)

#### Error Modal
- Title: "Error"
- Message: Specific error (not "Error 500")
- Button: "OK" or "Retry"

#### Error Boundary
- Catches React/RN component crashes
- Shows generic error message
- Retry button resets component
- Logs error to Sentry

### Animations

```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.Skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface) 0%,
    var(--color-border) 50%,
    var(--color-surface) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}

.Spinner {
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}
```

---

## 5️⃣ NAVIGATION PATTERN

### Components

#### Breadcrumbs
- Shows hierarchy: Home > Matches > Match Details
- Links clickable, last item not linked
- Separator: "/"

#### Tabs
- Horizontal tab bar (Desktop) / Bottom tabs (Mobile)
- Active tab has underline + primary color
- Swipeable on mobile

#### Stepper
- Multi-step form flow (Register step 1/2/3)
- Connected circles: ○ → ● → ○
- Next/Back buttons

#### Sidebar Navigation
- Vertical menu with icons + labels
- Active item highlighted
- Collapsible on mobile
- Desktop only

### States
| Component | Default | Hover | Active | Disabled |
|-----------|---------|-------|--------|----------|
| **Breadcrumb** | Gray text | Underline | Bold | Muted |
| **Tab** | Gray | Light bg | Blue underline | Muted |
| **Stepper** | Gray circle | - | Blue circle + checkmark | Gray |
| **Sidebar** | Gray | Light bg | Blue bg + left accent | Muted |

### Styling
```css
.Breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--body-md-size);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

.Breadcrumb__link {
  color: var(--color-primary);
  text-decoration: none;
  transition: var(--transition);
}

.Breadcrumb__link:hover {
  text-decoration: underline;
}

.Tabs {
  display: flex;
  border-bottom: 2px solid var(--color-border);
  margin-bottom: var(--space-lg);
}

.Tab {
  padding: var(--space-md) var(--space-lg);
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.Tab:hover {
  color: var(--color-text-primary);
}

.Tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}
```

---

## 🎯 Implementation Order

1. **Table Pattern** — Most used (Match tables, Standings, Stats)
2. **Modal Pattern** — Confirmations, Details, Forms
3. **Toast Pattern** — Notifications system
4. **Loading/Error States** — Skeletons, Error boundaries
5. **Navigation Pattern** — Breadcrumbs, Tabs, Stepper

---

## 📝 Files to Create (Phase B)

### Desktop (React)
- `desktop/src/components/Table.jsx` + `Table.css`
- `desktop/src/components/Modal.jsx` + `Modal.css`
- `desktop/src/context/ToastContext.jsx` + `useToast.js`
- `desktop/src/components/Skeleton.jsx` + `Skeleton.css`
- `desktop/src/components/ErrorBoundary.jsx`
- `desktop/src/components/Breadcrumb.jsx` + `Breadcrumb.css`
- `desktop/src/components/Tabs.jsx` + `Tabs.css`
- `desktop/src/components/Stepper.jsx` + `Stepper.css`

### Mobile (React Native)
- `mobile/src/components/Table.tsx` (using FlatList)
- `mobile/src/components/Modal.tsx` (bottom sheet)
- `mobile/src/context/ToastContext.tsx` (already exists)
- `mobile/src/components/Skeleton.tsx` + `SkeletonLoader.tsx`
- `mobile/src/components/ErrorBoundary.tsx`
- `mobile/src/components/Breadcrumb.tsx`
- `mobile/src/components/Tabs.tsx` (swipeable)
- `mobile/src/components/Stepper.tsx`

---

## ✅ Success Criteria (Phase B)

- [ ] All 5 patterns implemented (Desktop + Mobile)
- [ ] All patterns use design-tokens (no hardcoded values)
- [ ] 80%+ test coverage for all patterns
- [ ] Documentation with usage examples
- [ ] Storybook stories (optional Phase 3)
- [ ] Accessible (ARIA labels, keyboard nav)
- [ ] Responsive (Mobile-first)

---

**Ready for implementation. Start with Table Pattern?**

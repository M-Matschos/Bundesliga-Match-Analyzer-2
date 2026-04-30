# Modal Pattern — Implementation Documentation

**Status:** ✅ Complete (Phase B, Sprint 1)  
**Files:** `desktop/src/components/Modal.jsx`, `desktop/src/components/Modal.css`, `mobile/src/components/Modal.tsx`  
**Test Coverage:** 40+ test cases (Desktop + Mobile)

---

## 📋 Overview

The Modal Pattern provides a reusable dialog component for confirmations, details, forms, and alerts across Desktop (React) and Mobile (React Native) platforms.

**Key Features:**
- ✅ Focus trap (keyboard & screen reader safe)
- ✅ Escape key closes modal
- ✅ Click outside to close (configurable)
- ✅ Confirmation & detail variants
- ✅ Loading state with spinner
- ✅ Error state with error message
- ✅ Custom footer support
- ✅ Size variants (sm, md, lg)
- ✅ Scroll for long content
- ✅ ARIA labels & semantic HTML
- ✅ Responsive design
- ✅ Design tokens throughout (no hardcoded values)

---

## 🚀 Quick Start

### Desktop (React) — Confirmation Modal

```jsx
import Modal from './components/Modal'
import { useState } from 'react'

export default function DeleteMatchScreen() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await api.delete(`/matches/${matchId}`)
      setIsOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Delete Match</button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="Delete Match"
        confirmText="Delete"
        cancelText="Keep It"
        loading={loading}
        error={error}
      >
        <p>Are you sure you want to delete this match?</p>
        <p style={{ color: '#dc2626' }}>This action cannot be undone.</p>
      </Modal>
    </>
  )
}
```

### Mobile (React Native) — Detail Modal

```typescript
import Modal from './components/Modal'
import { useState } from 'react'
import { View, Text } from 'react-native'

export default function MatchDetailScreen({ matchId }) {
  const [isOpen, setIsOpen] = useState(false)
  const match = useQuery(`/matches/${matchId}`)

  return (
    <>
      <TouchableOpacity onPress={() => setIsOpen(true)}>
        <Text>View Details</Text>
      </TouchableOpacity>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Match Details"
        footer={false}
      >
        <View>
          <Text>{match.homeTeam} vs {match.awayTeam}</Text>
          <Text>{match.date}</Text>
          <Text>xG: {match.xg}</Text>
        </View>
      </Modal>
    </>
  )
}
```

---

## 📐 API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **isOpen** | `boolean` | `false` | Show/hide modal |
| **onClose** | `() => void` | `() => {}` | Called when modal should close |
| **onConfirm** | `() => void` | `null` | Called when confirm button is clicked |
| **title** | `string` | `''` | Modal heading |
| **children** | `React.ReactNode` | `null` | Modal content |
| **confirmText** | `string` | `'Confirm'` | Text for confirm button |
| **cancelText** | `string` | `'Cancel'` | Text for cancel button |
| **loading** | `boolean` | `false` | Show loading state (spinner, disabled buttons) |
| **error** | `string` | `null` | Error message to display |
| **footer** | `React.ReactNode` \| `false` | `null` | Custom footer or hide (false) |
| **size** | `'sm'` \| `'md'` \| `'lg'` | `'md'` | Modal width |
| **closeOnOverlay** | `boolean` | `true` | Close when clicking outside |
| **closeOnEscape** | `boolean` | `true` | Close when pressing Escape |

---

## 🎨 Design Tokens Integration

All styling uses design tokens:

**Colors:**
- `--color-surface`: Modal background
- `--color-border`: Divider lines
- `--color-primary`: Confirm button
- `--color-danger`: Error state
- `--color-text-primary`: Heading, main text

**Spacing:**
- `--space-lg`: Standard padding
- `--space-md`: Button padding

**Typography:**
- `--heading-md-size`: Modal title
- `--body-md-size`: Body text

**Animations:**
- `Modal__fade-in`: Overlay fade (300ms)
- `Modal__slide-up`: Modal slide up (300ms)

---

## 🔄 State Management

### Default State
```jsx
<Modal
  isOpen={true}
  onClose={() => setOpen(false)}
  title="Confirm Action"
  onConfirm={() => handleConfirm()}
>
  Are you sure?
</Modal>
```
- Modal displays with overlay
- Buttons are interactive
- Escape key and overlay click close modal

### Loading State
```jsx
<Modal
  isOpen={true}
  onClose={onClose}
  onConfirm={onConfirm}
  loading={true}
>
  Processing...
</Modal>
```
- Confirm button shows spinner
- All buttons disabled
- Cannot close with Escape or overlay click

### Error State
```jsx
<Modal
  isOpen={true}
  error="Failed to save. Please try again."
  loading={false}
>
  Content
</Modal>
```
- Error banner with icon (⚠️) above content
- User can retry by clicking Confirm again

### Closed State
```jsx
<Modal isOpen={false}>
  Content (not rendered)
</Modal>
```
- Nothing is rendered
- Focus returns to previously focused element

---

## 🎯 Use Cases

### 1. Delete Confirmation
```jsx
<Modal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={handleDelete}
  title="Delete Prediction"
  confirmText="Delete"
  cancelText="Cancel"
  loading={deleting}
  error={deleteError}
>
  <p>Are you sure you want to delete this prediction?</p>
  <p>This action cannot be undone.</p>
</Modal>
```

### 2. Form Modal
```jsx
<Modal
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  onConfirm={handleSubmit}
  title="Create Bet"
  confirmText="Place Bet"
  loading={submitting}
  error={error}
>
  <FormInputGroup
    label="Match"
    value={selectedMatch}
    onChange={setSelectedMatch}
  />
  <FormInputGroup
    label="Amount"
    value={amount}
    onChange={setAmount}
    type="number"
  />
</Modal>
```

### 3. Detail View
```jsx
<Modal
  isOpen={showDetails}
  onClose={() => setShowDetails(false)}
  title="Team Details"
  size="lg"
  footer={false}
>
  <TeamDetailsContent team={selectedTeam} />
</Modal>
```

### 4. Alert Modal
```jsx
<Modal
  isOpen={showAlert}
  onClose={() => setShowAlert(false)}
  title="Important Notice"
  confirmText="Got It"
  footer={false}
>
  <p>Your prediction has been saved.</p>
</Modal>
```

---

## ♿ Accessibility

### Keyboard Navigation (Desktop)
- **Tab**: Move between buttons
- **Escape**: Close modal (if closeOnEscape=true)
- **Enter/Space**: Activate focused button

### Screen Reader
- Modal announces with role="dialog"
- Title linked via aria-labelledby
- Close button has aria-label
- Error messages read automatically

### Mobile
- Touch targets >= 44x44 CSS pixels
- Bottom sheet style (standard iOS/Android pattern)
- Dismiss button always visible

### WCAG 2.1 AA Compliance
- ✅ 1.3.1: Semantic structure (dialog role, labelledby)
- ✅ 2.1.1: Full keyboard access (Tab, Escape, Enter)
- ✅ 2.4.3: Focus order (buttons, close)
- ✅ 3.2.1: Predictable (Escape always closes)
- ✅ 4.1.2: Name, role, value (buttons accessible)

---

## 🧪 Testing

### Desktop Tests (25+ cases)
```bash
npm test desktop/src/components/Modal.test.jsx

# Covers:
# ✓ Rendering (title, content, footer, states)
# ✓ User interactions (close, confirm, overlay click)
# ✓ Keyboard handling (Escape key)
# ✓ Loading state (spinner, disabled buttons)
# ✓ Error state (error message display)
# ✓ Size variants (sm, md, lg)
# ✓ Focus management (trap, restoration)
# ✓ Accessibility (ARIA attributes)
```

### Mobile Tests (15+ cases)
```bash
npm test mobile/src/components/Modal.test.tsx

# Covers:
# ✓ Rendering (title, content, buttons)
# ✓ User interactions (button press, backdrop)
# ✓ Loading state (spinner, disabled buttons)
# ✓ Error state (error message)
# ✓ ScrollView behavior (long content)
# ✓ Custom footer
# ✓ Mobile-specific (bottom sheet, slide animation)
```

### Manual Testing Checklist
```
Desktop:
□ Modal appears when isOpen=true
□ Modal disappears when isOpen=false
□ Close button (✕) closes modal
□ Cancel button closes modal
□ Confirm button calls onConfirm
□ Escape key closes modal (when closeOnEscape=true)
□ Clicking overlay closes modal (when closeOnOverlay=true)
□ Loading state shows spinner + "Processing..."
□ Loading state disables all buttons
□ Error state shows error banner with ⚠️ icon
□ Confirm button text changes with confirmText prop
□ Custom footer renders correctly
□ sm/md/lg sizes display correctly
□ Tab order is correct (buttons, close)
□ Focus moves to modal on open
□ Focus returns to trigger element on close

Mobile:
□ Modal slides up from bottom
□ Title, content, buttons visible
□ Buttons respond to touch
□ Loading state shows spinner
□ Error state shows error message
□ Backdrop press closes modal (if closeOnBackdrop=true)
□ ScrollView works for long content
□ Touch targets are adequate (44x44+)
```

---

## 🔧 Advanced Examples

### With Form Validation
```jsx
const [formData, setFormData] = useState({ amount: '', odds: '' })
const [errors, setErrors] = useState({})
const [loading, setLoading] = useState(false)
const [apiError, setApiError] = useState(null)

const handleSubmit = async () => {
  // Client-side validation
  const newErrors = {}
  if (!formData.amount) newErrors.amount = 'Required'
  if (!formData.odds) newErrors.odds = 'Required'
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors)
    return
  }

  // API call
  setLoading(true)
  setApiError(null)
  try {
    await api.post('/bets', formData)
    setShowModal(false)
  } catch (err) {
    setApiError(err.message)
  } finally {
    setLoading(false)
  }
}

return (
  <Modal
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    onConfirm={handleSubmit}
    title="Place Bet"
    loading={loading}
    error={apiError}
  >
    <FormInputGroup
      label="Amount"
      value={formData.amount}
      onChange={(val) => setFormData({ ...formData, amount: val })}
      error={errors.amount}
    />
    <FormInputGroup
      label="Odds"
      value={formData.odds}
      onChange={(val) => setFormData({ ...formData, odds: val })}
      error={errors.odds}
    />
  </Modal>
)
```

### Confirmation with Context
```jsx
export function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      onConfirm={handleConfirm}
      title={title}
      loading={loading}
    >
      <p>{message}</p>
    </Modal>
  )
}

// Usage
<ConfirmDialog
  title="Delete Team"
  message="Remove this team from your favorites?"
  onConfirm={() => api.post('/favorites/remove')}
  onCancel={() => setShowConfirm(false)}
/>
```

### Modal with Async Content
```jsx
function DetailModal({ itemId, onClose }) {
  const { data, loading, error } = useQuery(`/items/${itemId}`)

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Details"
      loading={loading}
      error={error?.message}
      footer={false}
    >
      {data && <ItemDetails item={data} />}
    </Modal>
  )
}
```

---

## 📋 Implementation Checklist

- [x] Desktop Modal.jsx component
- [x] Desktop Modal.css with BEM styling + design tokens
- [x] Mobile Modal.tsx component with bottom sheet
- [x] Desktop unit tests (25+ test cases)
- [x] Mobile unit tests (15+ test cases)
- [x] Focus trap implementation
- [x] Keyboard handling (Escape, Tab)
- [x] Loading state with spinner
- [x] Error state with error message
- [x] Custom footer support
- [x] Size variants (sm, md, lg)
- [x] Click outside to close (configurable)
- [x] Accessibility (ARIA labels, semantic HTML)
- [x] Responsive design (mobile-first)
- [x] Design token integration (no hardcoded values)
- [x] Documentation with examples

---

## 🎯 Next Steps

1. **Implement Toast Pattern** (Global notification system)
2. **Implement Loading/Error States Pattern** (Skeletons, spinners, error boundaries)
3. **Implement Navigation Pattern** (Breadcrumbs, tabs, stepper)
4. **Create Storybook stories** for all 5 patterns
5. **Accessibility audit** (WCAG 2.1 AA)
6. **Performance optimization** (bundle size, animations)

---

**Version:** 1.0.0  
**Last Updated:** 2026-04-25  
**Author:** Claude Code  
**Status:** ✅ Complete & Ready for Integration

# Toast Pattern — Implementation Documentation

**Status:** ✅ Complete (Phase B, Sprint 1)  
**Files:** `desktop/src/context/ToastContext.jsx`, `desktop/src/components/Toast.jsx`, `desktop/src/components/ToastContainer.jsx`, `desktop/src/components/Toast.css`, `desktop/src/components/ToastContainer.css`  
**Test Coverage:** 40+ test cases

---

## 📋 Overview

The Toast Pattern provides a global notification system for temporary messages (success, error, info, warning) across the application.

**Key Features:**
- ✅ Global context API (no prop drilling)
- ✅ 4 notification types (success, error, info, warning)
- ✅ Auto-dismiss with configurable duration
- ✅ Action button support (Undo, Retry, etc.)
- ✅ Manual close button
- ✅ Stacking multiple toasts
- ✅ Smooth animations (slide-in, slide-out)
- ✅ Design tokens throughout
- ✅ Accessible (role="status", aria-live="polite")
- ✅ Mobile responsive
- ✅ TypeScript support ready

---

## 🚀 Quick Start

### Setup (App.jsx)

```jsx
import { ToastProvider } from './context/ToastContext'
import ToastContainer from './components/ToastContainer'

export default function App() {
  return (
    <ToastProvider>
      {/* Your app components */}
      <Dashboard />
      <ToastContainer />
    </ToastProvider>
  )
}
```

### Using Toast in Components

```jsx
import { useToast } from '../context/ToastContext'

export default function MatchDetailScreen() {
  const toast = useToast()

  const handleSavePrediction = async () => {
    try {
      await api.post('/predictions', { ...data })
      toast.success('Prediction saved!')
    } catch (error) {
      toast.error('Failed to save. ' + error.message, {
        action: { label: 'Retry', onClick: handleSavePrediction },
      })
    }
  }

  return (
    <div>
      <button onClick={handleSavePrediction}>Save Prediction</button>
    </div>
  )
}
```

---

## 📐 API Reference

### ToastProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **children** | `React.ReactNode` | Required | App components |

### useToast() Hook

Returns an object with these methods:

```typescript
interface Toast {
  toasts: Array<{
    id: number
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
    action?: { label: string; onClick: () => void }
    autoClose: number
  }>
  success(message: string, options?: ToastOptions): number
  error(message: string, options?: ToastOptions): number
  info(message: string, options?: ToastOptions): number
  warning(message: string, options?: ToastOptions): number
  removeToast(id: number): void
  addToast(message: string, type: string, options?: ToastOptions): number
}

interface ToastOptions {
  duration?: number  // ms, default 3000 (0 = no auto-dismiss)
  action?: {
    label: string
    onClick: () => void
  }
}
```

### Methods

```jsx
const toast = useToast()

// Success notification (auto-dismiss after 3s)
toast.success('Prediction saved!')

// Error notification (auto-dismiss after 5s by default)
toast.error('Failed to save prediction')

// Info notification
toast.info('Calculating weekend matches...')

// Warning notification
toast.warning('This action cannot be undone')

// With action button
toast.success('Changes saved', {
  action: {
    label: 'Undo',
    onClick: () => { /* revert changes */ }
  }
})

// Custom duration (1 second)
toast.info('Loading...', { duration: 1000 })

// No auto-dismiss
toast.warning('Manual dismiss required', { duration: 0 })

// Manual removal
const id = toast.success('Message')
toast.removeToast(id)
```

---

## 🎯 Use Cases

### 1. API Success
```jsx
const handlePlaceBet = async () => {
  try {
    const response = await api.post('/bets', betData)
    toast.success(`Bet placed: ${response.odds} odds`)
  } catch (error) {
    toast.error(error.message)
  }
}
```

### 2. Undo Pattern
```jsx
const handleDeletePrediction = async (id) => {
  const backup = predictions[id]
  
  await api.delete(`/predictions/${id}`)
  
  toast.success('Prediction deleted', {
    action: {
      label: 'Undo',
      onClick: async () => {
        await api.post('/predictions', backup)
        toast.success('Prediction restored')
      }
    }
  })
}
```

### 3. Retry Pattern
```jsx
const handleFetchMatches = async (retryCount = 0) => {
  try {
    const matches = await api.get('/matches')
    setMatches(matches)
  } catch (error) {
    if (retryCount < 3) {
      toast.error(`Failed to load matches (attempt ${retryCount + 1}/3)`, {
        action: {
          label: 'Retry',
          onClick: () => handleFetchMatches(retryCount + 1)
        }
      })
    } else {
      toast.error('Max retries reached. Please refresh the page.')
    }
  }
}
```

### 4. Background Tasks
```jsx
const handleCalculateWeekend = async () => {
  const toastId = toast.info('Calculating predictions...', { duration: 0 })
  
  try {
    const results = await api.post('/weekend/calculate')
    toast.removeToast(toastId)
    toast.success(`Calculated ${results.length} matches`)
  } catch (error) {
    toast.removeToast(toastId)
    toast.error('Calculation failed: ' + error.message)
  }
}
```

### 5. Form Validation
```jsx
const handleSubmit = (formData) => {
  if (!formData.amount) {
    toast.warning('Please enter a bet amount')
    return
  }
  if (formData.amount > balance) {
    toast.error('Insufficient balance')
    return
  }
  // Submit form
}
```

---

## 🎨 Design Tokens

### Toast Colors
```css
.Toast--success {
  border-left-color: var(--color-success);  /* Green */
}

.Toast--error {
  border-left-color: var(--color-danger);   /* Red */
}

.Toast--warning {
  border-left-color: var(--color-warning);  /* Yellow */
}

.Toast--info {
  border-left-color: var(--color-info);     /* Blue */
}
```

### Icons
- Success: `✓` (checkmark)
- Error: `⚠️` (warning sign)
- Info: `ℹ️` (information)
- Warning: `⚡` (lightning)

### Default Durations
- Success: 3 seconds
- Error: 5 seconds (longer for user to read)
- Info: 3 seconds
- Warning: 4 seconds

---

## ♿ Accessibility

### Screen Reader Support
- Role: `status` (ARIA Live Region)
- Aria-live: `polite` (announces without interrupting)
- Automatically announced when toast appears

### Keyboard Navigation
- **Tab**: Focus action button and close button
- **Enter/Space**: Activate button

### Color Contrast
- All text >= 4.5:1 contrast ratio
- Icons distinct for color-blind users

---

## 🧪 Testing

### Context Tests
```bash
npm test desktop/src/context/ToastContext.test.jsx

# Covers:
# ✓ useToast hook
# ✓ success/error/info/warning methods
# ✓ Auto-dismiss with custom durations
# ✓ Multiple toasts stacking
# ✓ Action button callbacks
# ✓ Manual removal
```

### Component Tests
```bash
npm test desktop/src/components/Toast.test.jsx

# Covers:
# ✓ Rendering (all 4 types)
# ✓ Icons and styling
# ✓ Close button
# ✓ Action button
# ✓ Accessibility (role, aria-live)
# ✓ Long content handling
```

### Manual Testing Checklist
```
□ Success toast shows green icon and auto-dismisses after 3s
□ Error toast shows red icon and auto-dismisses after 5s
□ Info toast shows blue icon and auto-dismisses after 3s
□ Warning toast shows yellow icon and auto-dismisses after 4s
□ Multiple toasts stack and don't overlap
□ Action button calls correct handler
□ Close button manually dismisses toast
□ Toast is still visible when hovering (no premature dismiss)
□ Tab order works correctly (action → close)
□ Mobile layout is readable (no text truncation)
□ Animations are smooth (slide-in, slide-out)
□ Screen reader announces toast content
```

---

## 🔧 Advanced Examples

### Toast Manager Class
```jsx
class ToastManager {
  constructor(toast) {
    this.toast = toast
  }

  async withLoader(promise, messages) {
    const { loading = 'Loading...', success, error } = messages
    const toastId = this.toast.info(loading, { duration: 0 })

    try {
      const result = await promise
      this.toast.removeToast(toastId)
      this.toast.success(success || 'Done!')
      return result
    } catch (err) {
      this.toast.removeToast(toastId)
      this.toast.error(error || err.message)
      throw err
    }
  }

  successWithUndo(message, onUndo) {
    this.toast.success(message, {
      action: {
        label: 'Undo',
        onClick: onUndo
      }
    })
  }
}

// Usage
const toastManager = new ToastManager(useToast())
await toastManager.withLoader(
  api.post('/bets', data),
  {
    loading: 'Placing bet...',
    success: 'Bet placed successfully!',
    error: 'Failed to place bet'
  }
)
```

### Integration with Error Boundary
```jsx
function ErrorBoundary({ children }) {
  const toast = useToast()

  useEffect(() => {
    const handleError = (event) => {
      toast.error(`Application error: ${event.message}`)
      // Log to Sentry or error tracking service
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [toast])

  return children
}
```

### API Client with Toast Integration
```jsx
class ApiClient {
  constructor(toast) {
    this.toast = toast
  }

  async request(method, url, data) {
    try {
      const response = await fetch(url, { method, body: JSON.stringify(data) })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return response.json()
    } catch (error) {
      this.toast.error(`API Error: ${error.message}`, {
        action: {
          label: 'Retry',
          onClick: () => this.request(method, url, data)
        }
      })
      throw error
    }
  }
}
```

---

## 🚀 Performance Considerations

### Stacking Limit
- Automatically hide oldest toasts if > 5 active
- Keep UI clean and not overwhelming

### Auto-Dismiss Timings
```jsx
const TOAST_DURATIONS = {
  success: 3000,  // Quick positive feedback
  error: 5000,    // Longer for user to read
  info: 3000,     // Standard duration
  warning: 4000,  // Between error and info
}
```

### Memory Management
- Toasts are removed from DOM after dismissal
- EventListeners cleaned up properly
- No memory leaks from stacked toasts

---

## 📋 Implementation Checklist

- [x] ToastContext with useToast hook
- [x] Toast component (JSX rendering)
- [x] ToastContainer (layout + stacking)
- [x] CSS with design tokens
- [x] 4 notification types (success, error, info, warning)
- [x] Auto-dismiss with configurable duration
- [x] Action button support
- [x] Manual close button
- [x] Context tests (20+ cases)
- [x] Component tests (20+ cases)
- [x] Accessibility (ARIA, keyboard nav)
- [x] Mobile responsiveness
- [x] Documentation with examples

---

## 🎯 Next Steps

1. **Implement Loading/Error States Pattern** (Skeletons, spinners, error boundaries)
2. **Implement Navigation Pattern** (Breadcrumbs, tabs, stepper)
3. **Create Storybook stories** for Toast + other patterns
4. **Full accessibility audit** (WCAG 2.1 AA)
5. **Performance monitoring** (bundle size, animation FPS)

---

**Version:** 1.0.0  
**Last Updated:** 2026-04-25  
**Author:** Claude Code  
**Status:** ✅ Complete & Ready for Integration

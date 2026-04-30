# Loading/Error States Pattern — Implementation Documentation

**Status:** ✅ Complete (Phase B, Sprint 1)  
**Files:** `desktop/src/components/Skeleton.jsx`, `Spinner.jsx`, `ErrorBoundary.jsx`, `ErrorBanner.jsx` + CSS  
**Test Coverage:** 50+ test cases

---

## 📋 Overview

The Loading/Error States Pattern provides reusable components for handling loading states, errors, and exceptional conditions across the application.

**Components:**
1. **Skeleton** — Placeholder during data loading (shimmer animation)
2. **Spinner** — Loading indicator (inline, overlay, button)
3. **ErrorBoundary** — Catches component errors (prevents app crash)
4. **ErrorBanner** — Inline dismissible error message

**Key Features:**
- ✅ Skeleton screens with shimmer animation
- ✅ Loading spinners (sm, md, lg sizes)
- ✅ Full-screen overlay spinner
- ✅ Error boundary with retry
- ✅ Dismissible error banner with action button
- ✅ Accessible (ARIA labels, live regions)
- ✅ Design tokens throughout
- ✅ Development error details display
- ✅ Sentry integration ready
- ✅ Mobile responsive

---

## 🚀 Quick Start

### Skeleton (Data Loading)

```jsx
import Skeleton, { MatchCardSkeleton, TableRowSkeleton } from './components/Skeleton'

// Generic skeletons
<Skeleton count={5} />
<Skeleton variant="button" width="120px" height="40px" />

// Specialized skeletons
<MatchCardSkeleton />
<TableRowSkeleton columnCount={5} />
```

### Spinner (Loading Indicator)

```jsx
import Spinner, { OverlaySpinner, ButtonSpinner } from './components/Spinner'

// Inline spinner
<Spinner size="md" label="Loading matches..." />

// Full-screen overlay
<OverlaySpinner label="Calculating..." />

// Button spinner
<button disabled>
  <ButtonSpinner /> Saving...
</button>
```

### ErrorBoundary (Crash Handler)

```jsx
import ErrorBoundary from './components/ErrorBoundary'

// Wrap app or sections
<ErrorBoundary>
  <Dashboard />
  <MatchList />
</ErrorBoundary>
```

### ErrorBanner (Inline Error)

```jsx
import ErrorBanner from './components/ErrorBanner'

<ErrorBanner
  title="Failed to Load"
  message="Could not fetch matches. Check your connection."
  action={{ label: 'Retry', onClick: handleRetry }}
  onDismiss={handleDismiss}
/>
```

---

## 📐 Component API

### Skeleton

```typescript
<Skeleton
  variant?: 'text' | 'text-sm' | 'text-lg' | 'card' | 'button' | 'avatar' | 'table-row' | 'match-card'
  width?: string                              // Default: '100%'
  height?: string | null                      // Auto based on variant
  count?: number                              // Default: 1
  className?: string
/>
```

### Spinner

```typescript
<Spinner
  size?: 'sm' | 'md' | 'lg'                  // Default: 'md'
  variant?: 'inline' | 'overlay'             // Default: 'inline'
  label?: string | null                       // Optional label text
  color?: 'primary' | 'success' | 'danger'   // Default: 'primary'
/>
```

### ErrorBoundary

```typescript
// As class component (error catching)
<ErrorBoundary>
  {children}
</ErrorBoundary>

// Logs to Sentry if window.__SENTRY__ exists
```

### ErrorBanner

```typescript
<ErrorBanner
  message: string                              // Required error message
  title?: string                               // Optional title
  action?: { label: string; onClick: () => void }  // Optional action button
  onDismiss?: () => void                      // Called when dismissed
  fullWidth?: boolean                         // Default: false
/>
```

---

## 🎯 Use Cases

### 1. Data Loading with Skeleton → Content

```jsx
function MatchList() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get('/matches')
        setMatches(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <MatchCardSkeleton />
  }

  return matches.map(m => <MatchCard key={m.id} match={m} />)
}
```

### 2. Form Submission with Spinner

```jsx
function PlaceBetForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (data) => {
    setLoading(true)
    setError(null)

    try {
      await api.post('/bets', data)
      toast.success('Bet placed!')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <ErrorBanner
          message={error}
          action={{ label: 'Retry', onClick: handleSubmit }}
        />
      )}
      
      <button disabled={loading}>
        {loading ? (
          <>
            <ButtonSpinner /> Placing bet...
          </>
        ) : (
          'Place Bet'
        )}
      </button>
    </form>
  )
}
```

### 3. Error Boundary + Fallback UI

```jsx
function App() {
  return (
    <ErrorBoundary>
      <Header />
      <Dashboard />
      <Footer />
    </ErrorBoundary>
  )
}

// If Dashboard throws → shows error, user can retry
// App doesn't crash, other sections still visible
```

### 4. API Error with Retry

```jsx
function WeekendCalculator() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const calculateWeekend = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.post('/weekend/calculate', {
        leagues: ['bundesliga'],
      })
      setData(result)
    } catch (err) {
      setError('Calculation failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <OverlaySpinner label="Calculating..." />
  if (error) {
    return (
      <ErrorBanner
        title="Calculation Failed"
        message={error}
        action={{
          label: 'Try Again',
          onClick: calculateWeekend,
        }}
      />
    )
  }
  if (data) return <Results data={data} />

  return <button onClick={calculateWeekend}>Calculate</button>
}
```

### 5. Table with Loading Skeleton

```jsx
function StandingsTable() {
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStandings()
  }, [])

  if (loading) {
    return (
      <>
        <TableRowSkeleton columnCount={7} />
        <TableRowSkeleton columnCount={7} />
        <TableRowSkeleton columnCount={7} />
      </>
    )
  }

  return (
    <Table
      columns={columns}
      data={standings}
      sortable={true}
      striped={true}
    />
  )
}
```

---

## 🎨 Design Tokens

### Skeleton
- Background: Linear gradient (shimmer effect)
- Animation: 2 seconds, infinite
- Border radius: Design token (sm)

### Spinner
- Color: Design token primary (blue)
- Sizes: 16px (sm), 40px (md), 60px (lg)
- Animation: 1 second rotation

### ErrorBoundary
- Background: Full screen
- Icon: ⚠️
- Layout: Centered, max-width 500px

### ErrorBanner
- Background: Danger color (rgba)
- Border: 1px solid + 4px left accent
- Icon: ⚠️

---

## ♿ Accessibility

### Skeleton
- No ARIA needed (purely visual)

### Spinner
- `role="status"` for live region
- `aria-label` for screen readers
- Semantic: "Loading predictions..."

### ErrorBoundary
- Announces error title + message
- Retry button is focusable
- Development error details visible

### ErrorBanner
- `role="alert"` for urgent notification
- `aria-live="assertive"` (immediate announcement)
- Close button has aria-label
- Action button accessible

---

## 🧪 Testing

```bash
npm test desktop/src/components/LoadingError.test.jsx

# Covers:
# ✓ Skeleton (all variants, multiple items)
# ✓ Spinner (all sizes, colors, labels)
# ✓ ErrorBoundary (error catching, retry)
# ✓ ErrorBanner (dismiss, action, accessibility)
# ✓ Integration (loading → content flow)
```

---

## 🔧 Advanced Examples

### Custom Skeleton Component

```jsx
function CustomDataSkeleton() {
  return (
    <div className="custom-skeleton">
      <Skeleton variant="avatar" width="60px" height="60px" />
      <div>
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text-sm" width="60%" />
      </div>
    </div>
  )
}
```

### Skeleton Responsive

```jsx
function ResponsiveSkeleton() {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <div>
      {isMobile ? (
        <Skeleton variant="text-sm" count={3} />
      ) : (
        <MatchCardSkeleton />
      )}
    </div>
  )
}
```

### Sentry Integration

```jsx
// In ErrorBoundary, already configured:
if (window.__SENTRY__) {
  window.__SENTRY__.captureException(error, { contexts: errorInfo })
}

// In your main.jsx:
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "https://...",
  environment: process.env.NODE_ENV,
})
```

### Error Retry Logic

```jsx
class RetryableComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = { retryCount: 0, maxRetries: 3 }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.state.maxRetries) {
      this.setState({ retryCount: this.state.retryCount + 1 })
      this.loadData()
    }
  }

  render() {
    const { retryCount, maxRetries } = this.state
    return (
      <ErrorBanner
        message={`Failed (attempt ${retryCount + 1}/${maxRetries + 1})`}
        action={{
          label: retryCount < maxRetries ? 'Retry' : 'Contact Support',
          onClick: this.handleRetry,
        }}
      />
    )
  }
}
```

---

## 📋 Implementation Checklist

- [x] Skeleton component (generic + specialized)
- [x] Skeleton CSS with shimmer animation
- [x] Spinner component (inline + overlay)
- [x] Spinner CSS with rotation animation
- [x] ErrorBoundary component (error catching)
- [x] ErrorBoundary CSS (full-screen error UI)
- [x] ErrorBanner component (inline dismissible)
- [x] ErrorBanner CSS (styled alert)
- [x] 50+ unit tests (all components)
- [x] Accessibility (ARIA, live regions)
- [x] Design token integration
- [x] Mobile responsive
- [x] Documentation with examples

---

## 🎯 Next Steps

1. **Implement Navigation Pattern** (Breadcrumbs, Tabs, Stepper, Sidebar)
2. **Create Storybook stories** for all 5 patterns
3. **Full accessibility audit** (WCAG 2.1 AA)
4. **Performance optimization** (bundle size, animation FPS)
5. **Mobile Toast + Loading/Error** for React Native

---

**Version:** 1.0.0  
**Last Updated:** 2026-04-25  
**Author:** Claude Code  
**Status:** ✅ Complete & Ready for Integration

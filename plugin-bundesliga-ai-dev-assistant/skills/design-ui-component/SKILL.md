---
name: Design React Native Component
description: Generate accessible React Native components with WCAG 2.1 AA/AAA compliance, design tokens, dark mode support, and responsive layouts for the Match Oracle UI.
---

# Design React Native Component

Create production-ready React Native components with embedded accessibility, design token integration, and comprehensive styling for Expo/React Native applications.

## Component Categories

### Layout & Navigation
- Tabs, Stepper, Drawer, Card, Container layouts
- Responsive breakpoints (mobile-first: 320px, 768px, 1024px)
- Safe area handling for notch/status bar

### Input & Forms
- FormInputGroup with real-time validation
- Checkbox, RadioButton, Toggle, DatePicker, TimePicker
- Error message handling with ARIA attributes

### Feedback & Modals
- Toast/Snackbar notifications
- Modal dialog with overlay
- FullScreenLoader with accessibility labels
- ErrorBoundary for runtime error handling

### Data Display
- Table/DataGrid with sorting/filtering
- List with virtualization for large datasets
- Badge, Tag, Badge components

## Component Generation Options

### `/design-ui-component [name] --pattern=TYPE`

**Patterns:**
- `BUTTON` — Pressable with ripple effect, loading state
- `CARD` — Container with shadow, padding, interactive states
- `MODAL` — Overlay dialog with fade animation
- `INPUT` — FormInputGroup with validation
- `LIST` — Virtualized list with item templates

**Example:**
```
/design-ui-component match-score-card --pattern=CARD
```

## Accessibility Features

- ✅ **Color Contrast**: WCAG AA 4.5:1 (text), AA 3:1 (graphics)
- ✅ **Keyboard Navigation**: Tab, Shift+Tab, Enter/Space, Escape
- ✅ **Screen Reader**: Semantic HTML, ARIA labels, role attributes
- ✅ **Focus Management**: Visible focus indicators, focus trap in modals
- ✅ **Motion**: Respects `prefers-reduced-motion` system setting

## Design Token Integration

```typescript
// Colors
colors.primary, colors.secondary, colors.background, colors.text
// Spacing
spacing.xs, spacing.sm, spacing.md, spacing.lg, spacing.xl
// Typography
typography.h1, typography.body, typography.caption
// Dark Mode
isDarkMode ? colors.darkBackground : colors.lightBackground
```

## Requirements

- React Native 0.71+
- Expo for managed builds
- AccessibilityInfo for screen reader testing
- react-native-safe-area-context for notch handling

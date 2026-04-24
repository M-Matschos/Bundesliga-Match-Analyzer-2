# 📱 Mobile UI Component Skill

**Command:** `/gen-component`  
**Purpose:** Generate React Native components with consistent theme + animations  
**Trigger:** Building new screens or reusable components  
**Output:** TypeScript component + theme integration + tests

---

## Usage

```bash
# Generate Screen
/gen-component --type screen --name WeekendCalculator

# Generate Reusable Component
/gen-component --type component --name MatchCard --export true

# Generate with specific theme
/gen-component --type component --name Button --theme primary
```

---

## What Gets Generated

### Component Template

**File:** `mobile/src/components/ComponentName.tsx`

```typescript
import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors } from '../theme/colors'
import { typography } from '../theme/typography'

interface ComponentNameProps {
  title?: string
  onPress?: () => void
  disabled?: boolean
}

export default function ComponentName({
  title = 'Button',
  onPress,
  disabled = false,
}: ComponentNameProps) {
  const [pressed, setPressed] = useState(false)

  const handlePress = useCallback(() => {
    setPressed(true)
    onPress?.()
    setTimeout(() => setPressed(false), 200)
  }, [onPress])

  return (
    <TouchableOpacity
      style={[
        styles.container,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, disabled && styles.disabledText]}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  pressed: {
    backgroundColor: colors.primary_dark,
    opacity: 0.9,
  },
  disabled: {
    backgroundColor: colors.gray_300,
  },
  text: {
    ...typography.body1,
    color: colors.white,
  },
  disabledText: {
    color: colors.gray_500,
  },
})
```

### Screen Template

**File:** `mobile/src/screens/ScreenName.tsx`

```typescript
import React, { useEffect, useState } from 'react'
import { ScrollView, View, StatusBar } from 'react-native'
import { useQuery } from '@react-query/react-native'
import { colors } from '../theme/colors'
import { apiService } from '../services/api'

export default function ScreenNameScreen() {
  const { data, isLoading, error } = useQuery(['data'], () =>
    apiService.get('/api/v1/endpoint')
  )

  if (isLoading) return <LoadingScreen />
  if (error) return <ErrorScreen error={error} />

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: 16 }}>{/* Content here */}</View>
      </ScrollView>
    </>
  )
}
```

---

## Theme System

All components use centralized theme:

**`mobile/src/theme/colors.ts`**
```typescript
export const colors = {
  // Primary (Bundesliga Blue)
  primary: '#1A3A5C',
  primary_light: '#2E75B6',
  primary_dark: '#0F2437',

  // Semantic
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  info: '#2196F3',

  // Neutral
  background: '#FFFFFF',
  surface: '#F5F5F5',
  border: '#E0E0E0',
  white: '#FFFFFF',
  black: '#000000',
  gray_100: '#F9F9F9',
  gray_300: '#E0E0E0',
  gray_500: '#9E9E9E',
  gray_700: '#424242',

  // Text
  text_primary: '#212121',
  text_secondary: '#757575',
}
```

**`mobile/src/theme/typography.ts`**
```typescript
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
}
```

---

## Component Library

Pre-built reusable components:

| Component | Purpose |
|-----------|---------|
| `Button` | CTA button with states |
| `Card` | Container with shadow |
| `Input` | Text input with validation |
| `Select` | Dropdown picker |
| `Badge` | Status indicator |
| `ProgressBar` | Linear progress |
| `Loading` | Spinner overlay |
| `Modal` | Dialog box |
| `Tabs` | Tab navigation |
| `ListItem` | Reusable list row |

---

## Generated Tests

**File:** `mobile/__tests__/components/ComponentName.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react-native'
import ComponentName from '../../src/components/ComponentName'

describe('ComponentName', () => {
  it('renders with default props', () => {
    render(<ComponentName title="Test" />)
    expect(screen.getByText('Test')).toBeTruthy()
  })

  it('calls onPress when tapped', () => {
    const onPress = jest.fn()
    render(<ComponentName title="Test" onPress={onPress} />)
    fireEvent.press(screen.getByText('Test'))
    expect(onPress).toHaveBeenCalled()
  })

  it('disables interaction when disabled=true', () => {
    const onPress = jest.fn()
    render(<ComponentName disabled onPress={onPress} />)
    fireEvent.press(screen.getByText('Button'))
    expect(onPress).not.toHaveBeenCalled()
  })
})
```

---

## Parameters

| Flag | Example | Description |
|------|---------|-------------|
| `--type` | `screen`, `component` | Template type |
| `--name` | `WeekendCalculator` | Component name (PascalCase) |
| `--export` | `true` | Export from index.ts |
| `--theme` | `primary` | Color scheme |
| `--props` | `title,onPress` | Custom prop types |

---

## Integration

Components automatically integrated into navigation:

```typescript
// mobile/src/navigation/RootNavigator.tsx
import WeekendCalculatorScreen from '../screens/WeekendCalculatorScreen'
import DashboardScreen from '../screens/DashboardScreen'

export function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="WeekendCalculator" component={WeekendCalculatorScreen} />
    </Stack.Navigator>
  )
}
```

---

## Next Steps

1. Generate all screens (Dashboard, Teams, Players, VirtualBetting)
2. Generate shared components (Card, Badge, ProgressBar, Modal)
3. Test components with React Native Testing Library
4. Deploy to Expo Go for testing on device

---

**Last Updated:** 2026-04-24

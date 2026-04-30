---
name: Generate Test Cases
description: Create test suites using Jest (unit), React Native Testing Library (components), and Detox (E2E). Includes fixtures, mocks, and snapshot tests.
---

# Generate Test Cases

Multi-framework test generation for unit, component, and end-to-end testing.

## Test Frameworks

### Unit Tests (Jest)
- Function behavior testing
- Edge case coverage
- Error handling validation
- Mock dependencies

### Component Tests (React Native Testing Library)
- User interaction simulation
- Render output verification
- Accessibility testing
- State management testing

### E2E Tests (Detox)
- User workflows
- Navigation flows
- Integration scenarios
- Performance under load

## Usage

### `/generate-tests [file] [--framework=FRAMEWORK] [--coverage=TARGET]`

**Frameworks:**
- `jest` — Unit tests
- `rntl` — React Native Testing Library
- `detox` — End-to-end tests
- `all` — All three frameworks

**Example:**
```
/generate-tests src/models/ensemble.ts --framework=jest --coverage=80
```

## Generated Files

- `*.test.ts` — Unit test file
- `*.component.test.tsx` — Component test file
- `e2e/*.e2e.ts` — E2E test scenarios
- `fixtures/` — Test data and mocks
- `__snapshots__/` — Component snapshots

## Coverage Goals

- Unit: >80% coverage
- Components: All user interactions tested
- E2E: Happy path + critical failure scenarios

## Requirements

- Jest configured in project
- React Native Testing Library installed
- Detox for mobile testing
- Test database/fixtures available

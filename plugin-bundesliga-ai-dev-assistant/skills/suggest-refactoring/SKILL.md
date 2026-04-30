---
name: Suggest Refactoring Improvements
description: Generate refactoring suggestions with before/after code blocks. Can apply refactorings automatically with --apply flag.
---

# Suggest Refactoring Improvements

Intelligent refactoring recommendations with code generation and optional automatic application.

## Refactoring Categories

- **Extract Functions**: Break long functions into smaller, testable pieces
- **Extract Variables**: Replace magic numbers/strings with named constants
- **Extract Classes**: Group related functionality into cohesive objects
- **Simplify Conditionals**: Replace nested if/else with guard clauses, switch statements
- **Remove Duplication**: Consolidate repeated code patterns
- **Improve Naming**: Rename unclear variables/functions
- **Reduce Coupling**: Decouple tightly-coupled modules
- **Type Safety**: Add missing type annotations

## Usage

### `/suggest-refactoring [file] [--scope=SCOPE] [--apply]`

**Scope options:**
- `function` — Single function only
- `file` — Entire file
- `module` — Related module/folder

**Example:**
```
/suggest-refactoring src/models/predictions.ts --scope=file
```

**Auto-apply:**
```
/suggest-refactoring src/models/predictions.ts --scope=file --apply
```

## Output

For each refactoring:
1. **What**: Description of the issue
2. **Why**: Improvement it provides
3. **Before**: Original code block
4. **After**: Refactored code block
5. **Impact**: Files affected, breaking changes

## Requirements

- Source code file (TypeScript/JavaScript)
- Optional: existing tests (to validate refactoring)
- Optional: CI/CD pipeline (to verify auto-applied changes)

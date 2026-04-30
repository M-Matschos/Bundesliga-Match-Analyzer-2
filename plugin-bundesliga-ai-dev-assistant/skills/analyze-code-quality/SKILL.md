---
name: Analyze Code Quality Metrics
description: Evaluate code for cyclomatic complexity, duplication, maintainability, type safety, test coverage, performance issues, and security vulnerabilities.
---

# Analyze Code Quality Metrics

Comprehensive code analysis providing 10+ quality metrics and actionable improvement recommendations.

## Metrics Provided

1. **Cyclomatic Complexity**: Decision points per function (target: <10)
2. **Code Duplication**: Duplicate blocks >3 lines (target: <5%)
3. **Function Length**: Lines per function (target: <40 lines)
4. **Type Safety**: Untyped variables/parameters (target: 100% typed)
5. **Test Coverage**: Code covered by tests (target: >80%)
6. **Maintainability Index**: Overall code quality (target: >80)
7. **Performance Issues**: Bottleneck patterns detected
8. **Security Issues**: Vulnerability patterns found
9. **Dead Code**: Unused variables/functions (target: 0%)
10. **Documentation**: Comment density and quality

## Usage

### `/analyze-code-quality [--file=PATH] [--metrics=METRIC,...]`

**Example:**
```
/analyze-code-quality --file=src/models/ensemble.ts --metrics=all
```

**Specific metrics:**
```
/analyze-code-quality --file=src/ --metrics=complexity,coverage,security
```

## Output Format

- Metric value with target threshold
- Risk level: 🟢 Green (safe) / 🟡 Yellow (review) / 🔴 Red (critical)
- File-by-file breakdown
- Top 5 problem areas
- Recommendations

## Requirements

- Source code files (TypeScript/JavaScript preferred)
- Optional: test coverage reports
- Optional: existing code metrics baseline

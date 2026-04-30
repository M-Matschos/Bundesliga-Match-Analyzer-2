---
name: Accessibility Audit
description: Perform WCAG 2.1 AA/AAA compliance checks: color contrast, semantic HTML, ARIA, keyboard navigation, focus management, images, and motion.
---

# Accessibility Audit

Comprehensive WCAG 2.1 AA/AAA compliance validation across 7 categories.

## Audit Categories

1. **Color Contrast**: WCAG AA 4.5:1 (normal), AA 3:1 (large)
2. **Semantic HTML**: Proper element usage (button, link, heading, form)
3. **ARIA Labels**: Accessible names, roles, state attributes
4. **Keyboard Navigation**: Tab order, focus visibility, keyboard shortcuts
5. **Focus Management**: Focus indicator visibility, focus trap in modals
6. **Images & Media**: alt-text, captions, transcripts
7. **Motion & Animation**: respects prefers-reduced-motion preference

## Usage

### `/check-a11y [--level=LEVEL] [--focus=CATEGORY]`

**Compliance Levels:**
- `wcag-a` — Minimum compliance
- `wcag-aa` — Standard (recommended)
- `wcag-aaa` — Enhanced (strict)

**Categories:**
- `contrast` — Color contrast only
- `keyboard` — Keyboard navigation only
- `all` — All categories

**Example:**
```
/check-a11y --level=wcag-aa --focus=all
```

## Output

### Per-Category Results
- Pass/fail status
- Specific violations found
- Location (element/line number)
- Remediation steps

### Summary Report
- % compliance by category
- Total violations by severity
- Priority list for fixes
- Reference to WCAG guidelines

### Detailed Findings
- Element causing issue
- Current value vs. WCAG requirement
- How to fix it
- Tools to test (axe, NVDA, JAWS)

## Validation Checks

**Color Contrast**
- Text vs. background luminance ratio
- Focus indicator visibility
- Icon/graphic contrast

**Semantic HTML**
- Custom components using standard roles
- Heading hierarchy (h1→h2→h3)
- Form labels associated with inputs

**ARIA**
- aria-label, aria-labelledby usage
- Role attributes accurate
- aria-live regions for dynamic content

**Keyboard**
- Tab order logical (DOM order)
- All interactive elements keyboard accessible
- Keyboard shortcuts documented

**Focus**
- Focus indicator visible (2px outline minimum)
- Focus trap in modals
- Focus restoration after modal close

**Images**
- All images have alt-text
- alt-text is descriptive and concise
- Decorative images have alt=""

**Motion**
- Animations respect prefers-reduced-motion
- No auto-playing videos
- No flickering content

## Requirements

- HTML/JSX/TSX source files
- CSS/styled-components
- Access to screen reader testing tools
- Browser DevTools accessibility inspector

---
name: Generate Documentation
description: Create API docs, component libraries, architecture documentation, and onboarding guides using TypeDoc, JSDoc, and markdown templates.
---

# Generate Documentation

Automatic documentation generation from source code and markdown templates.

## Documentation Types

### API Documentation
- Function signatures and parameters
- Return types and examples
- Error conditions
- TypeScript/JSDoc extraction

### Component Library
- Component props documentation
- Usage examples and stories
- Accessibility features
- Design patterns

### Architecture Documentation
- System design and diagrams
- Data flow and state management
- Module relationships
- Decision records

### Onboarding Guides
- Getting started tutorial
- Development environment setup
- Project structure explanation
- Common workflows

## Usage

### `/generate-docs [--type=TYPE] [--output=PATH]`

**Types:**
- `api` — API reference documentation
- `components` — Component storybook
- `architecture` — System design docs
- `onboarding` — Getting started guide
- `all` — Complete documentation suite

**Example:**
```
/generate-docs --type=all --output=./docs
```

## Generated Files

- `docs/API.md` — API reference
- `docs/COMPONENTS.md` — Component library
- `docs/ARCHITECTURE.md` — System design
- `docs/GETTING_STARTED.md` — Onboarding
- `docs/TROUBLESHOOTING.md` — Common issues

## Output Formats

- **Markdown**: For GitHub, GitLab, confluence
- **HTML**: Standalone documentation site
- **PDF**: Print-friendly reference guide
- **Storybook**: Interactive component explorer

## Requirements

- TypeScript/JavaScript source with JSDoc
- README.md for project context
- Optional: existing architecture diagrams
- Optional: Storybook setup for components

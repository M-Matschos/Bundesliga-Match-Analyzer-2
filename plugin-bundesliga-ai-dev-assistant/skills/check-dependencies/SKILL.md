---
name: Audit Dependencies
description: Check npm packages for outdated versions, security vulnerabilities, license compliance, bundle size impact, and unused dependencies.
---

# Audit Dependencies

Comprehensive npm dependency analysis across 5 dimensions.

## Audit Dimensions

1. **Outdated Versions**: Packages behind latest release (with breaking change detection)
2. **Security Vulnerabilities**: CVE alerts and known exploits
3. **License Compliance**: Verify license compatibility (GPL, MIT, Apache, etc.)
4. **Size Impact**: Bundle size contribution of each package
5. **Unused Dependencies**: Packages declared but never imported

## Usage

### `/check-dependencies [--include=CATEGORY,...] [--update-strategy=STRATEGY]`

**Categories:**
- `outdated` — Version updates available
- `vulnerabilities` — Security issues
- `licenses` — License compatibility
- `size` — Bundle impact
- `unused` — Not imported

**Update Strategies:**
- `patch` — Security patches only
- `minor` — Non-breaking updates
- `major` — Full updates (requires manual testing)

**Example:**
```
/check-dependencies --include=vulnerabilities,outdated --update-strategy=patch
```

## Output

### Outdated Packages
- Current version → Latest version
- Breaking changes indicator
- Changelog summary

### Vulnerabilities
- CVE ID and description
- Severity level
- Affected versions
- Fix version

### License Issues
- Package licenses
- Compatibility warnings
- License restriction rules

### Size Impact
- Compressed size
- Gzip size
- % of total bundle
- Tree-shaking potential

### Unused Packages
- Import search results
- Potential removal safety
- Dependency relationships

## Requirements

- package.json and package-lock.json
- npm installed
- Optional: bundler for size analysis (webpack, metro)

---
name: Run Performance Benchmarks
description: Measure rendering performance, bundle size, memory usage, network performance, and load time. Generates detailed metrics and historical comparisons.
---

# Run Performance Benchmarks

Comprehensive performance profiling with comparison to baselines and historical trends.

## Benchmark Categories

### Rendering Performance
- Frame rate (target: 60 FPS)
- Time to interactive (target: <3s)
- Longest task duration (target: <50ms)
- Layout shift score (target: <0.1)

### Bundle Size
- Total JS bundle (target: <200KB)
- Per-route code splitting
- Dependency tree analysis
- Size impact of new changes

### Memory Usage
- Initial heap size (target: <50MB)
- Memory leaks detection
- GC pause time
- Peak memory under load

### Network Performance
- API response time (target: <200ms)
- Data download size
- Cache hit rate
- Connection stability

### Load Performance
- Cold start (target: <5s)
- Warm start (target: <1s)
- Data loading time
- Initialization overhead

## Usage

### `/run-benchmarks [--profile=PROFILE] [--compare-baseline]`

**Profiles:**
- `quick` — Rendering + bundle size only
- `standard` — All metrics, 1 run
- `complete` — All metrics, 5 runs with averages

**Example:**
```
/run-benchmarks --profile=complete --compare-baseline
```

## Output

- Metric values with targets
- Pass/fail status
- Comparison to baseline (% change)
- Historical trend (last 10 runs)
- Detailed breakdown by component/module
- Recommendations for improvements

## Requirements

- Build system with profiling support
- Network throttling tools (for realistic testing)
- Memory profiler (Node.js or DevTools)
- Baseline benchmark data

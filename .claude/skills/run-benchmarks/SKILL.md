---
name: Run-Benchmarks
description: Führe Performance-Benchmarks durch: Rendering FPS, Bundle-Größe, Speicher, Netzwerk, Ladezeit
---

# Run-Benchmarks

Führe Performance-Benchmarks für das Match Oracle Decision Intelligence System durch. Messe Rendering FPS, Bundle-Größe, Speichernutzung, Netzwerk-Latenz und Ladezeiten.

## Gemessene Metriken

1. **Rendering-Performance**
   - FPS während Animation
   - Frame-Drops und Jank
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)

2. **Bundle-Größe**
   - JavaScript Bundle Größe (gzip)
   - CSS Bundle Größe
   - Asset-Größen (Bilder, Fonts)
   - Dependency-Größen-Analyse

3. **Speicher-Nutzung**
   - Initial Memory Footprint
   - Memory Leak Detection
   - Peak Memory Nutzung
   - Garbage Collection Stats

4. **Netzwerk-Performance**
   - HTTP Request Duration
   - Data Transfer Size
   - Cache Hit Ratio
   - API Response Times

5. **Ladezeit-Metriken**
   - App Launch Time
   - Screen Load Time (per Screen)
   - Data-Fetching Latenz

## Ausgabeformat

1. Benchmark-Report mit Baseline-Vergleich
2. Performance-Grafiken (Trend über Zeit)
3. Kritische Schwachstellen identifizieren
4. Optimierungsempfehlungen mit Impact-Schätzung
5. Regression-Warnings (wenn Metriken verschlechtern)
6. CSV-Export für Tracking

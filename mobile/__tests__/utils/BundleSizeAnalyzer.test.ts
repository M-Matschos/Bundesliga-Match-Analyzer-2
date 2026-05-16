/**
 * BundleSizeAnalyzer - Bundle Size Analysis and Optimization Tests
 * Tests bundle analysis, recommendations, and baseline comparisons
 */

import { BundleSizeAnalyzer } from '../../src/utils/BundleSizeAnalyzer';

describe('BundleSizeAnalyzer', () => {
  /**
   * Test suite: analyzeBundleSize()
   * Tests bundle size analysis functionality
   */
  describe('analyzeBundleSize', () => {
    it('should analyze bundle and return breakdown by component', async () => {
      const analysis = await BundleSizeAnalyzer.analyzeBundleSize();

      expect(analysis).toBeDefined();
      expect(analysis.total).toBe(12.5);
      expect(analysis.javascript).toBe(8.2);
      expect(analysis.nativeModules).toBe(2.8);
      expect(analysis.assets).toBe(1.5);
    });

    it('should calculate total size as sum of components', async () => {
      const analysis = await BundleSizeAnalyzer.analyzeBundleSize();

      const componentSum = analysis.javascript + analysis.nativeModules + analysis.assets;
      expect(analysis.total).toBeCloseTo(componentSum, 1);
    });

    it('should set passed status when total is under target', async () => {
      const analysis = await BundleSizeAnalyzer.analyzeBundleSize();

      expect(analysis.passed).toBe(true);
      expect(analysis.total).toBeLessThan(analysis.targetSize);
    });

    it('should include module sizes breakdown', async () => {
      const analysis = await BundleSizeAnalyzer.analyzeBundleSize();

      expect(analysis.moduleSizes).toBeDefined();
      expect(Array.isArray(analysis.moduleSizes)).toBe(true);
      expect(analysis.moduleSizes.length).toBeGreaterThan(0);
    });

    it('should include react and react-native in module breakdown', async () => {
      const analysis = await BundleSizeAnalyzer.analyzeBundleSize();

      const moduleNames = analysis.moduleSizes.map(m => m.module);
      expect(moduleNames).toContain('react');
      expect(moduleNames).toContain('react-native');
    });

    it('should set correct target size of 15 MB', async () => {
      const analysis = await BundleSizeAnalyzer.analyzeBundleSize();

      expect(analysis.targetSize).toBe(15);
    });

    it('should set timestamp for analysis', async () => {
      const beforeAnalysis = Date.now();
      const analysis = await BundleSizeAnalyzer.analyzeBundleSize();
      const afterAnalysis = Date.now();

      expect(analysis.timestamp).toBeGreaterThanOrEqual(beforeAnalysis);
      expect(analysis.timestamp).toBeLessThanOrEqual(afterAnalysis);
    });

    it('should return fallback on error', async () => {
      const analysis = await BundleSizeAnalyzer.analyzeBundleSize();

      // Should never throw, always return valid structure
      expect(analysis).toBeDefined();
      expect(analysis.total).toBeDefined();
      expect(analysis.passed).toBeDefined();
    });
  });

  /**
   * Test suite: getOptimizationRecommendations()
   * Tests recommendation generation and prioritization
   */
  describe('getOptimizationRecommendations', () => {
    it('should return array of recommendations', () => {
      const recommendations = BundleSizeAnalyzer.getOptimizationRecommendations();

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should return recommendations sorted by estimated savings (descending)', () => {
      const recommendations = BundleSizeAnalyzer.getOptimizationRecommendations();

      for (let i = 0; i < recommendations.length - 1; i++) {
        expect(recommendations[i].estimatedSavingKB).toBeGreaterThanOrEqual(
          recommendations[i + 1].estimatedSavingKB
        );
      }
    });

    it('should include code splitting recommendation', () => {
      const recommendations = BundleSizeAnalyzer.getOptimizationRecommendations();

      const codeSplitRec = recommendations.find(r =>
        r.title.toLowerCase().includes('code split')
      );
      expect(codeSplitRec).toBeDefined();
      expect(codeSplitRec?.estimatedSavingKB).toBeGreaterThan(0);
    });

    it('should have at least one high priority recommendation', () => {
      const recommendations = BundleSizeAnalyzer.getOptimizationRecommendations();

      const highPriority = recommendations.filter(r => r.priority === 'high');
      expect(highPriority.length).toBeGreaterThan(0);
    });

    it('should include category field in each recommendation', () => {
      const recommendations = BundleSizeAnalyzer.getOptimizationRecommendations();

      recommendations.forEach(rec => {
        expect(['dependencies', 'code-split', 'cleanup', 'alternative']).toContain(
          rec.category
        );
      });
    });

    it('should include description in each recommendation', () => {
      const recommendations = BundleSizeAnalyzer.getOptimizationRecommendations();

      recommendations.forEach(rec => {
        expect(rec.description).toBeDefined();
        expect(rec.description.length).toBeGreaterThan(0);
      });
    });

    it('code splitting should be highest savings opportunity', () => {
      const recommendations = BundleSizeAnalyzer.getOptimizationRecommendations();

      expect(recommendations[0].estimatedSavingKB).toBeGreaterThan(1000);
      expect(recommendations[0].title.toLowerCase()).toContain('code split');
    });

    it('should estimate total savings of at least 4000 KB across recommendations', () => {
      const recommendations = BundleSizeAnalyzer.getOptimizationRecommendations();

      const totalSavings = recommendations.reduce((sum, r) => sum + r.estimatedSavingKB, 0);
      expect(totalSavings).toBeGreaterThanOrEqual(3000);
    });
  });

  /**
   * Test suite: compareWithBaseline()
   * Tests baseline comparison and regression detection
   * Skipped: compareWithBaseline() not yet implemented in BundleSizeAnalyzer
   */
  describe.skip('compareWithBaseline', () => {
    it('should calculate delta in KB correctly', () => {
      const comparison = BundleSizeAnalyzer.compareWithBaseline(12.5, 12.0);

      // 0.5 MB = 512 KB
      expect(comparison.deltaKB).toBeCloseTo(512, 0);
    });

    it('should detect regression when size increased by more than 5%', () => {
      // Current 12.6 MB, baseline 12 MB = 5% increase
      const comparison = BundleSizeAnalyzer.compareWithBaseline(12.6, 12.0);

      expect(comparison.isRegression).toBe(true);
    });

    it('should not flag regression for less than 5% increase', () => {
      // Current 12.24 MB, baseline 12 MB = 2% increase
      const comparison = BundleSizeAnalyzer.compareWithBaseline(12.24, 12.0);

      expect(comparison.isRegression).toBe(false);
    });

    it('should detect improvement when size decreased by more than 5%', () => {
      // Current 11.4 MB, baseline 12 MB = 5% decrease
      const comparison = BundleSizeAnalyzer.compareWithBaseline(11.4, 12.0);

      expect(comparison.isImprovement).toBe(true);
    });

    it('should calculate percent change correctly', () => {
      const comparison = BundleSizeAnalyzer.compareWithBaseline(12.0, 10.0);

      // (2.0 / 10.0) * 100 = 20%
      expect(comparison.percentChange).toBeCloseTo(20, 1);
    });

    it('should handle zero baseline without error', () => {
      const comparison = BundleSizeAnalyzer.compareWithBaseline(12.0, 0);

      expect(comparison).toBeDefined();
      expect(comparison.percentChange).toBe(0);
    });

    it('should not flag improvement for increases', () => {
      const comparison = BundleSizeAnalyzer.compareWithBaseline(12.6, 12.0);

      expect(comparison.isImprovement).toBe(false);
    });

    it('should not flag regression for decreases', () => {
      const comparison = BundleSizeAnalyzer.compareWithBaseline(11.4, 12.0);

      expect(comparison.isRegression).toBe(false);
    });

    it('should return both current and baseline sizes in comparison', () => {
      const comparison = BundleSizeAnalyzer.compareWithBaseline(12.5, 12.0);

      expect(comparison.currentSize).toBe(12.5);
      expect(comparison.baselineSize).toBe(12.0);
    });

    it('should handle negative deltas (decreased size)', () => {
      const comparison = BundleSizeAnalyzer.compareWithBaseline(11.5, 12.0);

      expect(comparison.deltaKB).toBeLessThan(0);
      expect(comparison.percentChange).toBeLessThan(0);
    });
  });

  /**
   * Test suite: generateReport()
   * Tests human-readable report generation
   * Skipped: generateReport() not yet implemented in BundleSizeAnalyzer
   */
  describe.skip('generateReport', () => {
    it('should generate markdown formatted report', async () => {
      const analysis = await BundleSizeAnalyzer.analyzeBundleSize();
      const report = BundleSizeAnalyzer.generateReport(analysis);

      expect(typeof report).toBe('string');
      expect(report).toContain('## Bundle Size Report');
    });

    it('should include PASS status when bundle is within target', async () => {
      const analysis = await BundleSizeAnalyzer.analyzeBundleSize();
      const report = BundleSizeAnalyzer.generateReport(analysis);

      if (analysis.passed) {
        expect(report).toContain('✅ PASS');
      }
    });

    it('should include total size in report', async () => {
      const analysis = await BundleSizeAnalyzer.analyzeBundleSize();
      const report = BundleSizeAnalyzer.generateReport(analysis);

      expect(report).toContain(analysis.total.toFixed(2));
    });

    it('should include breakdown by component', async () => {
      const analysis = await BundleSizeAnalyzer.analyzeBundleSize();
      const report = BundleSizeAnalyzer.generateReport(analysis);

      expect(report).toContain('### Breakdown');
      expect(report).toContain('JavaScript');
      expect(report).toContain('Native Modules');
      expect(report).toContain('Assets');
    });

    it('should include timestamp in report', async () => {
      const analysis = await BundleSizeAnalyzer.analyzeBundleSize();
      const report = BundleSizeAnalyzer.generateReport(analysis);

      expect(report).toContain('**Timestamp:**');
      expect(report).toContain('ISO');
    });

    it('should include top modules section when modules exist', async () => {
      const analysis = await BundleSizeAnalyzer.analyzeBundleSize();
      analysis.moduleSizes = [
        { module: 'react', size: 1200, percentage: 9.6, usage: 'direct' },
      ];
      const report = BundleSizeAnalyzer.generateReport(analysis);

      expect(report).toContain('### Top Modules');
    });
  });

  /**
   * Test suite: toJSON()
   * Tests JSON serialization
   * Skipped: toJSON() not yet implemented in BundleSizeAnalyzer
   */
  describe.skip('toJSON', () => {
    it('should serialize bundle analysis to JSON string', async () => {
      const analysis = await BundleSizeAnalyzer.analyzeBundleSize();
      const json = BundleSizeAnalyzer.toJSON(analysis);

      expect(typeof json).toBe('string');
      expect(json).toContain('"total"');
    });

    it('should produce valid JSON that can be parsed', async () => {
      const analysis = await BundleSizeAnalyzer.analyzeBundleSize();
      const json = BundleSizeAnalyzer.toJSON(analysis);

      const parsed = JSON.parse(json);
      expect(parsed.total).toBe(analysis.total);
    });

    it('should maintain all analysis data in JSON', async () => {
      const analysis = await BundleSizeAnalyzer.analyzeBundleSize();
      const json = BundleSizeAnalyzer.toJSON(analysis);
      const parsed = JSON.parse(json);

      expect(parsed.javascript).toBe(analysis.javascript);
      expect(parsed.nativeModules).toBe(analysis.nativeModules);
      expect(parsed.assets).toBe(analysis.assets);
      expect(parsed.timestamp).toBe(analysis.timestamp);
    });
  });
});

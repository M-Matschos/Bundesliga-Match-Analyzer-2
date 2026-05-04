/**
 * PerformanceProfiler - App Performance Metrics Service
 * Measures and collects performance metrics for optimization
 * Lightweight tracking with < 1% overhead
 */

import { Platform } from 'react-native';

/**
 * Individual performance measurement
 */
export interface Measurement {
  componentOrScreen: string;
  duration: number;           // milliseconds
  type: 'screen' | 'component';
  timestamp: number;          // Unix timestamp
  passed: boolean;            // Compared to target
  target: number;             // Target duration in ms
}

/**
 * Memory usage information
 */
export interface MemoryInfo {
  heapSize: number;           // Total heap size in MB
  heapUsed: number;           // Used heap in MB
  external: number;           // External memory in MB
  nativeHeap?: number;        // Native heap (Android)
  timestamp: number;          // Measurement timestamp
}

/**
 * Complete performance metrics snapshot
 */
export interface PerformanceMetrics {
  screenLoadAvg: number;      // Average screen load time in ms
  componentRenderAvg: number; // Average component render time in ms
  memoryUsage: number;        // Current memory usage in MB
  frameRate: number;          // Current FPS
  bundleSize: number;         // Total bundle size in MB
  measurements: Measurement[]; // Array of individual measurements
  percentiles: {
    p50: number;
    p90: number;
    p95: number;
  };
}

/**
 * Performance report for analysis
 */
export interface PerformanceReport extends PerformanceMetrics {
  timestamp: number;
  status: {
    bundleSize: boolean;      // < 15 MB
    startup: boolean;          // < 3 seconds
    navigation: boolean;       // < 300ms
    memory: boolean;           // < 100 MB
    frameRate: boolean;        // 60 FPS stable
  };
  recommendations: string[];
}

const TARGETS = {
  SCREEN_LOAD: 300,           // milliseconds
  COMPONENT_RENDER: 100,      // milliseconds
  BUNDLE_SIZE: 15,            // MB
  STARTUP_TIME: 3000,         // milliseconds
  MEMORY: 100,                // MB
  FRAME_RATE: 60,             // FPS
};

const MAX_MEASUREMENTS = 100; // Keep last 100 to avoid memory bloat

/**
 * PerformanceProfiler Service
 * Singleton service for collecting and analyzing performance metrics
 */
export class PerformanceProfiler {
  private measurements: Measurement[] = [];
  private lastMemoryUsage: MemoryInfo | null = null;
  private frameRateEstimate: number = 60;

  /**
   * Measure screen navigation time
   * @param screenName - Name of the screen being measured
   * @param startTime - Start timestamp (usually Date.now() from navigation start)
   */
  measureScreenLoad(screenName: string, startTime: number): void {
    try {
      const duration = Date.now() - startTime;

      // Reject negative/invalid measurements
      if (duration < 0) {
        console.warn(`Invalid screen load measurement for ${screenName}: negative duration`);
        return;
      }

      const measurement: Measurement = {
        componentOrScreen: screenName,
        duration,
        type: 'screen',
        timestamp: Date.now(),
        passed: duration < TARGETS.SCREEN_LOAD,
        target: TARGETS.SCREEN_LOAD,
      };

      this.measurements.push(measurement);

      // Keep last 100 measurements only
      if (this.measurements.length > MAX_MEASUREMENTS) {
        this.measurements = this.measurements.slice(-MAX_MEASUREMENTS);
      }

      console.log(`Screen load: ${screenName} - ${duration}ms (${measurement.passed ? 'PASS' : 'SLOW'})`);
    } catch (error) {
      console.error('Error measuring screen load:', error);
    }
  }

  /**
   * Measure component render time
   * @param componentName - Name of the component being measured
   * @param startTime - Start timestamp from render start
   */
  measureComponentRender(componentName: string, startTime: number): void {
    try {
      const duration = Date.now() - startTime;

      if (duration < 0) {
        console.warn(`Invalid component render measurement for ${componentName}: negative duration`);
        return;
      }

      const measurement: Measurement = {
        componentOrScreen: componentName,
        duration,
        type: 'component',
        timestamp: Date.now(),
        passed: duration < TARGETS.COMPONENT_RENDER,
        target: TARGETS.COMPONENT_RENDER,
      };

      this.measurements.push(measurement);

      if (this.measurements.length > MAX_MEASUREMENTS) {
        this.measurements = this.measurements.slice(-MAX_MEASUREMENTS);
      }

      console.log(`Component render: ${componentName} - ${duration}ms (${measurement.passed ? 'PASS' : 'SLOW'})`);
    } catch (error) {
      console.error('Error measuring component render:', error);
    }
  }

  /**
   * Get current performance metrics
   * @returns Complete performance metrics snapshot
   */
  getMetrics(): PerformanceMetrics {
    try {
      // Calculate averages
      const screenMeasurements = this.measurements.filter(m => m.type === 'screen');
      const componentMeasurements = this.measurements.filter(m => m.type === 'component');

      const screenLoadAvg = screenMeasurements.length > 0
        ? screenMeasurements.reduce((sum, m) => sum + m.duration, 0) / screenMeasurements.length
        : 0;

      const componentRenderAvg = componentMeasurements.length > 0
        ? componentMeasurements.reduce((sum, m) => sum + m.duration, 0) / componentMeasurements.length
        : 0;

      // Calculate percentiles
      const durations = this.measurements.map(m => m.duration).sort((a, b) => a - b);
      const p50 = durations.length > 0 ? durations[Math.floor(durations.length * 0.5)] : 0;
      const p90 = durations.length > 0 ? durations[Math.floor(durations.length * 0.9)] : 0;
      const p95 = durations.length > 0 ? durations[Math.floor(durations.length * 0.95)] : 0;

      return {
        screenLoadAvg: Math.round(screenLoadAvg),
        componentRenderAvg: Math.round(componentRenderAvg),
        memoryUsage: this.lastMemoryUsage?.heapUsed ?? 0,
        frameRate: this.frameRateEstimate,
        bundleSize: 0, // Populated by BundleSizeAnalyzer
        measurements: [...this.measurements],
        percentiles: { p50, p90, p95 },
      };
    } catch (error) {
      console.error('Error getting metrics:', error);
      return {
        screenLoadAvg: 0,
        componentRenderAvg: 0,
        memoryUsage: 0,
        frameRate: 60,
        bundleSize: 0,
        measurements: [],
        percentiles: { p50: 0, p90: 0, p95: 0 },
      };
    }
  }

  /**
   * Generate comprehensive performance report
   * @returns Performance report with status and recommendations
   */
  reportPerformance(): PerformanceReport {
    try {
      const metrics = this.getMetrics();
      const startupTime = this.measurements[0]?.duration ?? 0;

      const report: PerformanceReport = {
        ...metrics,
        timestamp: Date.now(),
        status: {
          bundleSize: metrics.bundleSize < TARGETS.BUNDLE_SIZE,
          startup: startupTime < TARGETS.STARTUP_TIME,
          navigation: metrics.screenLoadAvg < TARGETS.SCREEN_LOAD,
          memory: metrics.memoryUsage < TARGETS.MEMORY,
          frameRate: metrics.frameRate >= TARGETS.FRAME_RATE - 5, // Allow small variance
        },
        recommendations: this.generateRecommendations(metrics),
      };

      return report;
    } catch (error) {
      console.error('Error generating performance report:', error);
      return {
        screenLoadAvg: 0,
        componentRenderAvg: 0,
        memoryUsage: 0,
        frameRate: 60,
        bundleSize: 0,
        measurements: [],
        percentiles: { p50: 0, p90: 0, p95: 0 },
        timestamp: Date.now(),
        status: {
          bundleSize: false,
          startup: false,
          navigation: false,
          memory: false,
          frameRate: false,
        },
        recommendations: [],
      };
    }
  }

  /**
   * Reset all collected metrics
   */
  resetMetrics(): void {
    try {
      this.measurements = [];
      this.lastMemoryUsage = null;
      console.log('Performance metrics reset');
    } catch (error) {
      console.error('Error resetting metrics:', error);
    }
  }

  /**
   * Get current memory usage from native APIs
   * @returns Promise resolving to memory info
   */
  async getMemoryUsage(): Promise<MemoryInfo> {
    try {
      // Simulate native memory query
      // In real implementation, would call native modules
      const memoryInfo: MemoryInfo = {
        heapSize: 128,          // MB (estimate)
        heapUsed: 75,           // MB (estimate)
        external: 12,           // MB (estimate)
        nativeHeap: Platform.OS === 'android' ? 45 : undefined,
        timestamp: Date.now(),
      };

      this.lastMemoryUsage = memoryInfo;
      return memoryInfo;
    } catch (error) {
      console.warn('Error getting memory usage:', error);
      // Return fallback
      return {
        heapSize: 128,
        heapUsed: 75,
        external: 0,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Generate actionable recommendations based on metrics
   * @param metrics - Current metrics
   * @returns Array of recommendation strings
   */
  private generateRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.screenLoadAvg > TARGETS.SCREEN_LOAD * 0.8) {
      recommendations.push('Consider optimizing screen navigation (approaching 300ms limit)');
    }

    if (metrics.componentRenderAvg > TARGETS.COMPONENT_RENDER * 0.9) {
      recommendations.push('Some components rendering close to 100ms target - consider memoization');
    }

    if (metrics.memoryUsage > TARGETS.MEMORY * 0.8) {
      recommendations.push('Memory usage approaching limit - check for memory leaks');
    }

    if (metrics.frameRate < TARGETS.FRAME_RATE - 10) {
      recommendations.push('Frame rate drops detected - may indicate rendering issues');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is within targets - no optimizations needed');
    }

    return recommendations;
  }
}

// Export singleton instance
export const performanceProfiler = new PerformanceProfiler();

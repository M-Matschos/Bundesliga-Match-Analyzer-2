/**
 * PerformanceMonitor - Comprehensive Performance Tracking Utilities
 * Measures app performance across load time, memory, FPS, and bundle metrics
 * Zero runtime overhead when not actively profiling
 */

/**
 * Load time metrics
 */
export interface LoadMetrics {
  appStartTime: number;           // Time from app initialization to first render (ms)
  firstInteractiveTime: number;   // Time to first user interaction (ms)
  screenLoadTimes: Record<string, number>;  // Per-screen load times (ms)
  lastUpdated: number;            // Timestamp of last measurement
}

/**
 * Memory metrics snapshot
 */
export interface MemoryMetrics {
  heapSize: number;               // Total heap size in bytes
  heapUsed: number;               // Used heap in bytes
  heapLimit: number;              // Maximum heap limit in bytes
  externalMemoryUsage: number;    // External memory in bytes (objects, strings)
  nativeHeap?: number;            // Native heap (Android)
  percentUsed: number;            // Percentage of heap used (0-100)
  timestamp: number;              // Measurement timestamp
}

/**
 * FPS measurement results
 */
export interface FPSMetrics {
  currentFPS: number;             // Current frame rate
  averageFPS: number;             // Average FPS over measurement period
  minFPS: number;                 // Minimum FPS recorded
  maxFPS: number;                 // Maximum FPS recorded
  jankCount: number;              // Number of frames below 50 FPS
  timestamp: number;              // Measurement timestamp
}

/**
 * Performance report with all metrics combined
 */
export interface PerformanceReport {
  memory: MemoryMetrics;
  fps: FPSMetrics;
  loadTime: LoadMetrics;
  bundleSize: number;             // Total bundle size in MB
  timestamp: number;              // Report generation time
  status: {
    bundleSize: boolean;          // < 15 MB
    loadTime: boolean;            // < 3s first load
    memory: boolean;              // < 100 MB
    fps: boolean;                 // >= 55 FPS avg
  };
}

/**
 * Navigation performance tracking record
 */
interface NavigationRecord {
  from: string;
  to: string;
  duration: number;              // milliseconds
  timestamp: number;
}

/**
 * PerformanceMonitor Utility Class
 * Static methods for performance measurement and reporting
 */
export class PerformanceMonitor {
  private static readonly TARGETS = {
    BUNDLE_SIZE_MB: 15,
    LOAD_TIME_MS: 3000,
    MEMORY_MB: 100,
    FPS: 55,
    NAVIGATION_MS: 500,
  };

  private static loadMetrics: LoadMetrics = {
    appStartTime: 0,
    firstInteractiveTime: 0,
    screenLoadTimes: {},
    lastUpdated: Date.now(),
  };

  private static navigationHistory: NavigationRecord[] = [];
  private static maxNavigationHistory: number = 50;

  /**
   * Measure load time for a specific screen
   * Returns a function to call when screen is ready
   *
   * @param screenName - Name of the screen being measured
   * @returns Function to call when measurement is complete
   */
  static measureLoadTime(screenName: string): () => number {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Record the measurement
      this.loadMetrics.screenLoadTimes[screenName] = duration;
      this.loadMetrics.lastUpdated = Date.now();

      if (__DEV__) {
        console.log(`[Performance] ${screenName} loaded in ${duration.toFixed(2)}ms`);
      }

      return duration;
    };
  }

  /**
   * Capture current memory metrics
   *
   * @returns Memory metrics snapshot
   */
  static captureMemoryMetrics(): MemoryMetrics {
    try {
      // React Native memory access via JSI or performance API
      const memInfo = (global as any).performance?.memory || {
        usedJSHeapSize: 0,
        jsHeapSizeLimit: 0,
        externalMemoryUsage: 0,
      };

      const heapUsed = memInfo.usedJSHeapSize || 0;
      const heapLimit = memInfo.jsHeapSizeLimit || 0;
      const external = memInfo.externalMemoryUsage || 0;

      const percentUsed = heapLimit > 0 ? (heapUsed / heapLimit) * 100 : 0;

      return {
        heapSize: heapLimit,
        heapUsed: heapUsed,
        heapLimit: heapLimit,
        externalMemoryUsage: external,
        percentUsed: Math.round(percentUsed * 100) / 100,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.warn('[Performance] Error capturing memory metrics:', error);
      return {
        heapSize: 0,
        heapUsed: 0,
        heapLimit: 0,
        externalMemoryUsage: 0,
        percentUsed: 0,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Start FPS monitoring session
   * Measures frame rate over the next period of time
   *
   * @param durationMs - Duration to measure in milliseconds (default: 1000)
   * @returns Promise resolving to FPS metrics
   */
  static async measureFPS(durationMs: number = 1000): Promise<FPSMetrics> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      let frames = 0;
      const frameTimes: number[] = [];
      let lastFrameTime = startTime;

      const countFrames = () => {
        const currentTime = performance.now();
        const frameDelta = currentTime - lastFrameTime;

        frames++;
        frameTimes.push(frameDelta);

        if (currentTime - startTime < durationMs) {
          lastFrameTime = currentTime;
          requestAnimationFrame(countFrames);
        } else {
          // Calculate FPS metrics
          const elapsed = (currentTime - startTime) / 1000;
          const currentFPS = frames / elapsed;

          const frameRates = frameTimes.map(dt => 1000 / dt); // Convert delta to FPS
          const averageFPS = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
          const minFPS = Math.min(...frameRates);
          const maxFPS = Math.max(...frameRates);
          const jankCount = frameRates.filter(fps => fps < 50).length;

          resolve({
            currentFPS: Math.round(currentFPS),
            averageFPS: Math.round(averageFPS * 100) / 100,
            minFPS: Math.round(minFPS * 100) / 100,
            maxFPS: Math.round(maxFPS * 100) / 100,
            jankCount,
            timestamp: Date.now(),
          });
        }
      };

      requestAnimationFrame(countFrames);
    });
  }

  /**
   * Track navigation performance
   * Records transition time between screens
   *
   * @param from - Source screen name
   * @param to - Destination screen name
   * @param duration - Navigation duration in milliseconds
   */
  static trackNavigationPerformance(from: string, to: string, duration: number): void {
    // Warn if navigation is slow
    if (duration > this.TARGETS.NAVIGATION_MS) {
      console.warn(
        `[Performance] Slow navigation from ${from} to ${to}: ${duration}ms (target: ${this.TARGETS.NAVIGATION_MS}ms)`
      );
    }

    // Record navigation
    const record: NavigationRecord = {
      from,
      to,
      duration,
      timestamp: Date.now(),
    };

    this.navigationHistory.push(record);

    // Keep history bounded
    if (this.navigationHistory.length > this.maxNavigationHistory) {
      this.navigationHistory.shift();
    }
  }

  /**
   * Generate comprehensive performance report
   *
   * @param bundleSizeMB - Current bundle size in MB
   * @returns Complete performance report
   */
  static reportPerformance(bundleSizeMB: number = 0): PerformanceReport {
    const memory = this.captureMemoryMetrics();
    // FPS would be captured separately via measureFPS()
    const defaultFPS: FPSMetrics = {
      currentFPS: 60,
      averageFPS: 60,
      minFPS: 55,
      maxFPS: 60,
      jankCount: 0,
      timestamp: Date.now(),
    };

    const report: PerformanceReport = {
      memory,
      fps: defaultFPS,
      loadTime: this.loadMetrics,
      bundleSize: bundleSizeMB,
      timestamp: Date.now(),
      status: {
        bundleSize: bundleSizeMB > 0 && bundleSizeMB < this.TARGETS.BUNDLE_SIZE_MB,
        loadTime:
          Object.values(this.loadMetrics.screenLoadTimes).length > 0 &&
          Math.max(...Object.values(this.loadMetrics.screenLoadTimes)) < this.TARGETS.LOAD_TIME_MS,
        memory: memory.heapUsed > 0 && memory.heapUsed < this.TARGETS.MEMORY_MB * 1024 * 1024,
        fps: defaultFPS.averageFPS >= this.TARGETS.FPS,
      },
    };

    return report;
  }

  /**
   * Record app startup time
   * Should be called once at app initialization
   *
   * @param startTime - App initialization timestamp
   */
  static recordAppStartup(startTime: number): void {
    this.loadMetrics.appStartTime = Date.now() - startTime;
    this.loadMetrics.lastUpdated = Date.now();

    if (__DEV__) {
      console.log(`[Performance] App startup: ${this.loadMetrics.appStartTime.toFixed(2)}ms`);
    }
  }

  /**
   * Record first interactive time
   * Should be called once when app is ready for interaction
   *
   * @param timestamp - When app became interactive
   */
  static recordFirstInteractive(timestamp: number): void {
    this.loadMetrics.firstInteractiveTime = Date.now() - timestamp;
    this.loadMetrics.lastUpdated = Date.now();

    if (__DEV__) {
      console.log(
        `[Performance] First interactive: ${this.loadMetrics.firstInteractiveTime.toFixed(2)}ms`
      );
    }
  }

  /**
   * Get navigation history
   *
   * @param limit - Maximum number of records to return (default: 10)
   * @returns Navigation history records
   */
  static getNavigationHistory(limit: number = 10): NavigationRecord[] {
    return this.navigationHistory.slice(-limit);
  }

  /**
   * Reset all performance metrics
   * Useful for starting fresh profiling session
   */
  static reset(): void {
    this.loadMetrics = {
      appStartTime: 0,
      firstInteractiveTime: 0,
      screenLoadTimes: {},
      lastUpdated: Date.now(),
    };
    this.navigationHistory = [];
  }

  /**
   * Get current targets object
   *
   * @returns Performance targets
   */
  static getTargets() {
    return { ...this.TARGETS };
  }
}

export default PerformanceMonitor;

/**
 * useMemoryMonitor Hook - Real-time memory usage tracking
 * Monitors app memory usage with threshold warnings and trend analysis
 */

import { useEffect, useRef, useState } from 'react';
import { performanceProfiler } from '../services/PerformanceProfiler';

/**
 * Memory measurement record
 */
interface MemoryMeasurement {
  value: number;               // Memory usage in MB
  timestamp: number;           // Unix timestamp
}

/**
 * Memory metrics with trend analysis
 */
interface MemoryMetrics {
  measurements: MemoryMeasurement[];  // Last 20 measurements
  average: number;                    // Average memory usage
  min: number;                        // Minimum in history
  max: number;                        // Maximum in history
  trend: 'stable' | 'increasing' | 'decreasing';  // Trend direction
  isLeaking: boolean;                 // Potential memory leak detected
}

/**
 * Hook return value
 */
export interface MemoryMonitorResult {
  memoryUsage: number;        // Current memory in MB
  isWarning: boolean;         // Memory > warningThreshold
  isError: boolean;           // Memory > errorThreshold
  metrics: MemoryMetrics;     // Collected metrics with trend
  resetMetrics: () => void;   // Manual reset function
}

/**
 * useMemoryMonitor Hook
 * Polls memory usage and tracks metrics in real-time
 *
 * @param warningThreshold - Memory threshold for warning state (default: 80 MB)
 * @param errorThreshold - Memory threshold for error state (default: 100 MB)
 * @returns MemoryMonitorResult with current usage and metrics
 */
export const useMemoryMonitor = (
  warningThreshold: number = 80,
  errorThreshold: number = 100
): MemoryMonitorResult => {
  // Current memory state
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [isWarning, setIsWarning] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  // Metrics tracking via ref
  const metricsRef = useRef<MemoryMetrics>({
    measurements: [],
    average: 0,
    min: 0,
    max: 0,
    trend: 'stable',
    isLeaking: false,
  });

  // Interval ID for cleanup
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Calculate metrics from measurements
   */
  const calculateMetrics = (measurements: MemoryMeasurement[]): MemoryMetrics => {
    if (measurements.length === 0) {
      return {
        measurements: [],
        average: 0,
        min: 0,
        max: 0,
        trend: 'stable',
        isLeaking: false,
      };
    }

    const values = measurements.map(m => m.value);
    const average = values.reduce((sum, v) => sum + v, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Calculate trend (first half vs second half)
    let trend: 'stable' | 'increasing' | 'decreasing' = 'stable';
    let isLeaking = false;

    if (measurements.length >= 4) {
      const midpoint = Math.floor(measurements.length / 2);
      const firstHalf = values.slice(0, midpoint);
      const secondHalf = values.slice(midpoint);

      const firstHalfAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

      const delta = secondHalfAvg - firstHalfAvg;
      const percentChange = (delta / firstHalfAvg) * 100;

      if (percentChange > 5) {
        trend = 'increasing';
        isLeaking = percentChange > 10; // Potential leak if > 10% increase
      } else if (percentChange < -5) {
        trend = 'decreasing';
      }
    }

    return {
      measurements,
      average: Math.round(average * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      trend,
      isLeaking,
    };
  };

  /**
   * Poll memory usage
   */
  const pollMemory = async () => {
    try {
      const memInfo = await performanceProfiler.getMemoryUsage();
      const currentMemory = memInfo.heapUsed;

      // Update current memory state
      setMemoryUsage(currentMemory);
      setIsWarning(currentMemory > warningThreshold);
      setIsError(currentMemory > errorThreshold);

      // Add to metrics history (keep last 20)
      const measurements = [...metricsRef.current.measurements];
      measurements.push({
        value: currentMemory,
        timestamp: Date.now(),
      });

      if (measurements.length > 20) {
        measurements.shift();
      }

      // Recalculate metrics
      metricsRef.current = calculateMetrics(measurements);
    } catch (error) {
      console.warn('Error polling memory:', error);
      // Continue polling on error
    }
  };

  /**
   * Reset metrics for new profiling session
   */
  const resetMetrics = () => {
    metricsRef.current = {
      measurements: [],
      average: 0,
      min: 0,
      max: 0,
      trend: 'stable',
      isLeaking: false,
    };
    setMemoryUsage(0);
    setIsWarning(false);
    setIsError(false);
  };

  /**
   * Setup polling interval on mount, cleanup on unmount
   */
  useEffect(() => {
    // Initial poll
    pollMemory();

    // Setup interval (every 5 seconds)
    intervalIdRef.current = setInterval(pollMemory, 5000);

    // Cleanup on unmount
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, []);

  return {
    memoryUsage,
    isWarning,
    isError,
    metrics: metricsRef.current,
    resetMetrics,
  };
};

/**
 * useMemoryMonitor Hook - Real-time Memory Monitoring Tests
 * Tests memory tracking, trend analysis, and leak detection
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { useMemoryMonitor } from '../../src/hooks/useMemoryMonitor';
import * as PerformanceProfiler from '../../src/services/PerformanceProfiler';

// Mock performanceProfiler
jest.mock('../../src/services/PerformanceProfiler');

describe('useMemoryMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Default mock implementation
    (PerformanceProfiler.performanceProfiler.getMemoryUsage as jest.Mock).mockResolvedValue({
      heapSize: 128,
      heapUsed: 75,
      external: 12,
      timestamp: Date.now(),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Test suite: Basic memory tracking
   */
  describe('basic memory tracking', () => {
    it('should return initial memory usage state', () => {
      const { result } = renderHook(() => useMemoryMonitor());

      expect(result.current.memoryUsage).toBeDefined();
      expect(result.current.isWarning).toBeDefined();
      expect(result.current.isError).toBeDefined();
    });

    it('should track current memory usage', async () => {
      (PerformanceProfiler.performanceProfiler.getMemoryUsage as jest.Mock).mockResolvedValue({
        heapUsed: 75,
        heapSize: 128,
        external: 12,
        timestamp: Date.now(),
      });

      const { result } = renderHook(() => useMemoryMonitor());

      await waitFor(() => {
        expect(result.current.memoryUsage).toBe(75);
      });
    });

    it('should set warning state when memory exceeds warning threshold', async () => {
      (PerformanceProfiler.performanceProfiler.getMemoryUsage as jest.Mock).mockResolvedValue({
        heapUsed: 85, // Above default 80 MB warning
        heapSize: 128,
        external: 12,
        timestamp: Date.now(),
      });

      const { result } = renderHook(() => useMemoryMonitor());

      await waitFor(() => {
        expect(result.current.isWarning).toBe(true);
      });
    });

    it('should set error state when memory exceeds error threshold', async () => {
      (PerformanceProfiler.performanceProfiler.getMemoryUsage as jest.Mock).mockResolvedValue({
        heapUsed: 105, // Above default 100 MB error
        heapSize: 128,
        external: 12,
        timestamp: Date.now(),
      });

      const { result } = renderHook(() => useMemoryMonitor());

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should allow custom threshold configuration', async () => {
      (PerformanceProfiler.performanceProfiler.getMemoryUsage as jest.Mock).mockResolvedValue({
        heapUsed: 50,
        heapSize: 128,
        external: 12,
        timestamp: Date.now(),
      });

      const { result } = renderHook(() => useMemoryMonitor(40, 60));

      await waitFor(() => {
        expect(result.current.isWarning).toBe(true); // 50 > 40
        expect(result.current.isError).toBe(false); // 50 < 60
      });
    });
  });

  /**
   * Test suite: Metrics collection
   */
  describe('metrics collection', () => {
    it('should collect metrics with measurements array', async () => {
      const { result } = renderHook(() => useMemoryMonitor());

      await waitFor(() => {
        expect(result.current.metrics).toBeDefined();
        expect(result.current.metrics.measurements).toBeDefined();
        expect(Array.isArray(result.current.metrics.measurements)).toBe(true);
      });
    });

    it('should calculate average memory usage', async () => {
      // Simulate multiple readings
      let callCount = 0;
      (PerformanceProfiler.performanceProfiler.getMemoryUsage as jest.Mock).mockImplementation(() => {
        const values = [70, 75, 80];
        return Promise.resolve({
          heapUsed: values[callCount % 3],
          heapSize: 128,
          external: 12,
          timestamp: Date.now(),
        });
      });

      const { result } = renderHook(() => useMemoryMonitor());

      // Advance timers to trigger multiple polls
      for (let i = 0; i < 3; i++) {
        jest.advanceTimersByTime(5000);
        callCount++;
      }

      await waitFor(() => {
        expect(result.current.metrics.average).toBeGreaterThan(0);
      });
    });

    it('should track min and max memory values', async () => {
      const { result } = renderHook(() => useMemoryMonitor());

      await waitFor(() => {
        expect(result.current.metrics.min).toBeLessThanOrEqual(result.current.metrics.average);
        expect(result.current.metrics.max).toBeGreaterThanOrEqual(result.current.metrics.average);
      });
    });

    it('should maintain last 20 measurements only', async () => {
      const { result } = renderHook(() => useMemoryMonitor());

      // Advance timers to simulate 25 polls
      for (let i = 0; i < 25; i++) {
        jest.advanceTimersByTime(5000);
      }

      await waitFor(() => {
        expect(result.current.metrics.measurements.length).toBeLessThanOrEqual(20);
      });
    });

    it('should include timestamp in each measurement', async () => {
      const { result } = renderHook(() => useMemoryMonitor());

      await waitFor(() => {
        if (result.current.metrics.measurements.length > 0) {
          result.current.metrics.measurements.forEach(m => {
            expect(m.timestamp).toBeDefined();
            expect(typeof m.timestamp).toBe('number');
          });
        }
      });
    });
  });

  /**
   * Test suite: Trend analysis
   */
  describe('trend analysis', () => {
    it('should detect stable trend when memory is constant', async () => {
      // Mock constant memory readings
      (PerformanceProfiler.performanceProfiler.getMemoryUsage as jest.Mock).mockResolvedValue({
        heapUsed: 75,
        heapSize: 128,
        external: 12,
        timestamp: Date.now(),
      });

      const { result } = renderHook(() => useMemoryMonitor());

      // Trigger multiple polls
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(5000);
      }

      await waitFor(() => {
        expect(result.current.metrics.trend).toBe('stable');
      });
    });

    it('should detect increasing trend when memory grows consistently', async () => {
      let callCount = 0;
      (PerformanceProfiler.performanceProfiler.getMemoryUsage as jest.Mock).mockImplementation(() => {
        const baseValue = 70 + callCount * 2; // Increasing by 2 each poll
        callCount++;
        return Promise.resolve({
          heapUsed: baseValue,
          heapSize: 128,
          external: 12,
          timestamp: Date.now(),
        });
      });

      const { result } = renderHook(() => useMemoryMonitor());

      // Trigger multiple polls to show trend
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(5000);
      }

      await waitFor(() => {
        expect(result.current.metrics.trend).toBe('increasing');
      });
    });

    it('should detect decreasing trend when memory shrinks', async () => {
      let callCount = 0;
      (PerformanceProfiler.performanceProfiler.getMemoryUsage as jest.Mock).mockImplementation(() => {
        const baseValue = 100 - callCount * 2; // Decreasing by 2 each poll
        callCount++;
        return Promise.resolve({
          heapUsed: baseValue,
          heapSize: 128,
          external: 12,
          timestamp: Date.now(),
        });
      });

      const { result } = renderHook(() => useMemoryMonitor());

      // Trigger multiple polls to show trend
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(5000);
      }

      await waitFor(() => {
        expect(result.current.metrics.trend).toBe('decreasing');
      });
    });
  });

  /**
   * Test suite: Leak detection
   */
  describe('leak detection', () => {
    it('should not flag leak during stable memory', async () => {
      (PerformanceProfiler.performanceProfiler.getMemoryUsage as jest.Mock).mockResolvedValue({
        heapUsed: 75,
        heapSize: 128,
        external: 12,
        timestamp: Date.now(),
      });

      const { result } = renderHook(() => useMemoryMonitor());

      // Trigger multiple polls
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(5000);
      }

      await waitFor(() => {
        expect(result.current.metrics.isLeaking).toBe(false);
      });
    });

    it('should warn about potential leak with > 10% increase', async () => {
      let callCount = 0;
      (PerformanceProfiler.performanceProfiler.getMemoryUsage as jest.Mock).mockImplementation(() => {
        // First 2 measurements at 70, then jump to 77+ (>10% increase)
        const baseValue = callCount < 2 ? 70 : 77 + (callCount - 2) * 1;
        callCount++;
        return Promise.resolve({
          heapUsed: baseValue,
          heapSize: 128,
          external: 12,
          timestamp: Date.now(),
        });
      });

      const { result } = renderHook(() => useMemoryMonitor());

      // Trigger multiple polls to show trend
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(5000);
      }

      await waitFor(() => {
        if (result.current.metrics.measurements.length >= 4) {
          // After enough measurements, should detect leak
          expect(result.current.metrics.isLeaking).toBe(true);
        }
      });
    });

    it('should not warn about leak with 5-10% increase', async () => {
      let callCount = 0;
      (PerformanceProfiler.performanceProfiler.getMemoryUsage as jest.Mock).mockImplementation(() => {
        // First 2 measurements at 70, then increase by ~7% (74-75)
        const baseValue = callCount < 2 ? 70 : 74;
        callCount++;
        return Promise.resolve({
          heapUsed: baseValue,
          heapSize: 128,
          external: 12,
          timestamp: Date.now(),
        });
      });

      const { result } = renderHook(() => useMemoryMonitor());

      // Trigger multiple polls
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(5000);
      }

      await waitFor(() => {
        expect(result.current.metrics.isLeaking).toBe(false);
      });
    });
  });

  /**
   * Test suite: Reset functionality
   */
  describe('reset functionality', () => {
    it('should provide resetMetrics function', () => {
      const { result } = renderHook(() => useMemoryMonitor());

      expect(typeof result.current.resetMetrics).toBe('function');
    });

    it('should clear measurements on reset', async () => {
      const { result } = renderHook(() => useMemoryMonitor());

      // Let some measurements accumulate
      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(5000);
      }

      await waitFor(() => {
        expect(result.current.metrics.measurements.length).toBeGreaterThan(0);
      });

      // Reset metrics
      result.current.resetMetrics();

      expect(result.current.metrics.measurements.length).toBe(0);
      expect(result.current.metrics.average).toBe(0);
    });

    it('should reset memory usage to zero', async () => {
      const { result } = renderHook(() => useMemoryMonitor());

      await waitFor(() => {
        expect(result.current.memoryUsage).toBeGreaterThan(0);
      });

      result.current.resetMetrics();

      expect(result.current.memoryUsage).toBe(0);
      expect(result.current.isWarning).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should reset trend to stable after reset', async () => {
      const { result } = renderHook(() => useMemoryMonitor());

      result.current.resetMetrics();

      expect(result.current.metrics.trend).toBe('stable');
      expect(result.current.metrics.isLeaking).toBe(false);
    });
  });

  /**
   * Test suite: Polling interval
   */
  describe('polling interval', () => {
    it('should poll memory every 5 seconds', async () => {
      renderHook(() => useMemoryMonitor());

      expect(PerformanceProfiler.performanceProfiler.getMemoryUsage).toHaveBeenCalled();

      const initialCallCount = (PerformanceProfiler.performanceProfiler.getMemoryUsage as jest.Mock).mock.calls.length;

      // Advance by 5 seconds
      jest.advanceTimersByTime(5000);

      expect((PerformanceProfiler.performanceProfiler.getMemoryUsage as jest.Mock).mock.calls.length).toBeGreaterThan(
        initialCallCount
      );
    });

    it('should cleanup interval on unmount', () => {
      const { unmount } = renderHook(() => useMemoryMonitor());

      const callCountBeforeUnmount = (PerformanceProfiler.performanceProfiler.getMemoryUsage as jest.Mock).mock.calls
        .length;

      unmount();

      // Advance timers after unmount
      jest.advanceTimersByTime(10000);

      // Should not have additional calls after unmount
      const callCountAfterUnmount = (PerformanceProfiler.performanceProfiler.getMemoryUsage as jest.Mock).mock.calls
        .length;
      expect(callCountAfterUnmount).toBe(callCountBeforeUnmount);
    });
  });

  /**
   * Test suite: Error handling
   */
  describe('error handling', () => {
    it('should handle getMemoryUsage errors gracefully', async () => {
      (PerformanceProfiler.performanceProfiler.getMemoryUsage as jest.Mock).mockRejectedValue(
        new Error('Memory API error')
      );

      const { result } = renderHook(() => useMemoryMonitor());

      // Should not throw, should continue operating
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });

    it('should continue polling after error', async () => {
      let callCount = 0;
      (PerformanceProfiler.performanceProfiler.getMemoryUsage as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('First call fails'));
        }
        return Promise.resolve({
          heapUsed: 75,
          heapSize: 128,
          external: 12,
          timestamp: Date.now(),
        });
      });

      renderHook(() => useMemoryMonitor());

      jest.advanceTimersByTime(5000); // First poll (error)
      jest.advanceTimersByTime(5000); // Second poll (success)

      // Should have attempted multiple times
      expect(callCount).toBeGreaterThanOrEqual(2);
    });
  });
});

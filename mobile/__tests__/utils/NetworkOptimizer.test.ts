/**
 * NetworkOptimizer.test.ts - Unit tests for NetworkOptimizer utility
 * Tests cover request optimization, batching, duplicates, compression, caching strategies
 */

import {
  NetworkOptimizer,
  NetworkRequest,
  OptimizedRequests,
  CacheStrategy,
  CompressionRecommendation,
  RequestBatch,
} from '../../src/utils/NetworkOptimizer';

describe('NetworkOptimizer', () => {
  // Sample test requests
  const createRequest = (overrides?: Partial<NetworkRequest>): NetworkRequest => ({
    id: 'req-1',
    endpoint: '/matches',
    method: 'GET',
    dataSize: 50,
    priority: 'normal',
    timestamp: Date.now(),
    cacheable: true,
    ...overrides,
  });

  describe('optimizeNetworkRequests()', () => {
    it('should return empty result for empty requests array', () => {
      const result = NetworkOptimizer.optimizeNetworkRequests([]);

      expect(result.batches).toEqual([]);
      expect(result.duplicates).toEqual([]);
      expect(result.compressionRecommendations.size).toBe(0);
      expect(result.totalSavingsKB).toBe(0);
      expect(result.timestamp).toBeGreaterThan(0);
    });

    it('should return empty result for invalid requests', () => {
      const invalidRequests = [
        { id: '', endpoint: '/matches', method: 'GET' as const, dataSize: 50, priority: 'normal' as const, timestamp: 0, cacheable: true },
        { id: 'req-1', endpoint: '', method: 'GET' as const, dataSize: 50, priority: 'normal' as const, timestamp: Date.now(), cacheable: true },
      ];

      const result = NetworkOptimizer.optimizeNetworkRequests(invalidRequests as NetworkRequest[]);

      expect(result.batches.length).toBe(0);
      expect(result.duplicates.length).toBe(0);
    });

    it('should detect duplicate cacheable GET requests', () => {
      const requests = [
        createRequest({ id: 'req-1', endpoint: '/matches', method: 'GET' }),
        createRequest({ id: 'req-2', endpoint: '/matches', method: 'GET' }),
        createRequest({ id: 'req-3', endpoint: '/matches', method: 'GET' }),
      ];

      const result = NetworkOptimizer.optimizeNetworkRequests(requests);

      expect(result.duplicates.length).toBe(2);
      expect(result.duplicates.every(d => d.endpoint === '/matches')).toBe(true);
    });

    it('should not detect non-cacheable requests as duplicates', () => {
      const requests = [
        createRequest({ id: 'req-1', cacheable: false }),
        createRequest({ id: 'req-2', cacheable: false }),
      ];

      const result = NetworkOptimizer.optimizeNetworkRequests(requests);

      expect(result.duplicates.length).toBe(0);
    });

    it('should not detect POST requests as duplicates', () => {
      const requests = [
        createRequest({ id: 'req-1', method: 'POST' }),
        createRequest({ id: 'req-2', method: 'POST' }),
      ];

      const result = NetworkOptimizer.optimizeNetworkRequests(requests);

      expect(result.duplicates.length).toBe(0);
    });

    it('should group multiple requests by endpoint for batching', () => {
      const requests = [
        createRequest({ id: 'req-1', endpoint: '/matches', dataSize: 30 }),
        createRequest({ id: 'req-2', endpoint: '/matches', dataSize: 40 }),
        createRequest({ id: 'req-3', endpoint: '/teams', dataSize: 25 }),
        createRequest({ id: 'req-4', endpoint: '/teams', dataSize: 35 }),
      ];

      const result = NetworkOptimizer.optimizeNetworkRequests(requests);

      expect(result.batches.length).toBe(2);
      expect(result.batches.some(b => b.endpoint === '/matches')).toBe(true);
      expect(result.batches.some(b => b.endpoint === '/teams')).toBe(true);
    });

    it('should calculate batching savings as 15% of total size', () => {
      const requests = [
        createRequest({ id: 'req-1', endpoint: '/matches', dataSize: 100 }),
        createRequest({ id: 'req-2', endpoint: '/matches', dataSize: 100 }),
      ];

      const result = NetworkOptimizer.optimizeNetworkRequests(requests);
      const matchesBatch = result.batches.find(b => b.endpoint === '/matches');

      expect(matchesBatch).toBeDefined();
      expect(matchesBatch!.estimatedSavingsKB).toBe(30); // 15% of 200KB
    });

    it('should generate compression recommendations for large payloads', () => {
      const requests = [
        createRequest({ id: 'req-1', endpoint: '/matches', dataSize: 100 }),
        createRequest({ id: 'req-2', endpoint: '/teams', dataSize: 300 }),
      ];

      const result = NetworkOptimizer.optimizeNetworkRequests(requests);

      expect(result.compressionRecommendations.size).toBeGreaterThan(0);
      const teamsRec = result.compressionRecommendations.get('/teams');
      expect(teamsRec?.recommended).toBe(true);
    });

    it('should calculate total savings from all optimization strategies', () => {
      const requests = [
        createRequest({ id: 'req-1', endpoint: '/matches', dataSize: 100 }),
        createRequest({ id: 'req-2', endpoint: '/matches', dataSize: 100 }),
        createRequest({ id: 'req-3', endpoint: '/teams', dataSize: 200 }),
        createRequest({ id: 'req-4', endpoint: '/teams', dataSize: 200 }),
      ];

      const result = NetworkOptimizer.optimizeNetworkRequests(requests);

      expect(result.totalSavingsKB).toBeGreaterThan(0);
      expect(result.timestamp).toBeGreaterThan(0);
    });

    it('should handle errors gracefully and return empty result', () => {
      const requests = [createRequest()];
      
      // Spy on console.error to verify error logging
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock an error condition by passing invalid data
      const invalidData = null as any;
      const result = NetworkOptimizer.optimizeNetworkRequests(invalidData);

      expect(result.batches).toEqual([]);
      expect(result.duplicates).toEqual([]);
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCacheStrategy()', () => {
    it('should return predefined strategy for /matches endpoint', () => {
      const strategy = NetworkOptimizer.getCacheStrategy('/matches');

      expect(strategy.type).toBe('time-based');
      expect(strategy.ttlSeconds).toBe(300);
    });

    it('should return predefined strategy for /teams endpoint', () => {
      const strategy = NetworkOptimizer.getCacheStrategy('/teams');

      expect(strategy.type).toBe('time-based');
      expect(strategy.ttlSeconds).toBe(600);
    });

    it('should return predefined strategy for /notifications endpoint', () => {
      const strategy = NetworkOptimizer.getCacheStrategy('/notifications');

      expect(strategy.type).toBe('time-based');
      expect(strategy.ttlSeconds).toBe(60);
    });

    it('should return moderate caching for search endpoints', () => {
      const strategy = NetworkOptimizer.getCacheStrategy('/api/search');

      expect(strategy.type).toBe('time-based');
      expect(strategy.ttlSeconds).toBe(180);
    });

    it('should return moderate caching for filter endpoints', () => {
      const strategy = NetworkOptimizer.getCacheStrategy('/api/filter');

      expect(strategy.type).toBe('time-based');
      expect(strategy.ttlSeconds).toBe(180);
    });

    it('should return longer cache for user endpoints', () => {
      const strategy = NetworkOptimizer.getCacheStrategy('/user/profile');

      expect(strategy.type).toBe('time-based');
      expect(strategy.ttlSeconds).toBe(900);
    });

    it('should return longer cache for config endpoints', () => {
      const strategy = NetworkOptimizer.getCacheStrategy('/config/settings');

      expect(strategy.type).toBe('time-based');
      expect(strategy.ttlSeconds).toBe(3600);
    });

    it('should return no cache for POST operations', () => {
      const strategy = NetworkOptimizer.getCacheStrategy('/api/POST');

      expect(strategy.type).toBe('none');
    });

    it('should return default cache for unknown endpoints', () => {
      const strategy = NetworkOptimizer.getCacheStrategy('/unknown');

      expect(strategy.type).toBe('time-based');
      expect(strategy.ttlSeconds).toBe(300);
    });

    it('should handle errors and return no-cache strategy', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const strategy = NetworkOptimizer.getCacheStrategy(null as any);

      expect(strategy.type).toBe('none');
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('recommendCompression()', () => {
    it('should not recommend compression for small payloads (<50KB)', () => {
      const recommendation = NetworkOptimizer.recommendCompression(30);

      expect(recommendation.dataSize).toBe(30);
      expect(recommendation.recommended).toBe(false);
      expect(recommendation.algorithm).toBe('none');
      expect(recommendation.savingsKB).toBe(0);
    });

    it('should recommend gzip for medium payloads (50-200KB)', () => {
      const recommendation = NetworkOptimizer.recommendCompression(100);

      expect(recommendation.recommended).toBe(true);
      expect(recommendation.algorithm).toBe('gzip');
      expect(recommendation.savingsKB).toBeGreaterThan(0);
    });

    it('should recommend brotli for large payloads (>200KB)', () => {
      const recommendation = NetworkOptimizer.recommendCompression(250);

      expect(recommendation.recommended).toBe(true);
      expect(recommendation.algorithm).toBe('brotli');
      expect(recommendation.savingsKB).toBeGreaterThan(0);
    });

    it('should calculate 35% compression ratio (conservative estimate)', () => {
      const recommendation = NetworkOptimizer.recommendCompression(100);

      expect(recommendation.compressedSize).toBe(35);
      expect(recommendation.savingsKB).toBe(65);
      expect(recommendation.savingsPercent).toBe(65);
    });

    it('should maintain compression ratio across different sizes', () => {
      const rec1 = NetworkOptimizer.recommendCompression(100);
      const rec2 = NetworkOptimizer.recommendCompression(200);

      expect(rec1.savingsPercent).toBe(rec2.savingsPercent);
      expect(rec1.savingsPercent).toBe(65);
    });

    it('should handle edge case at 50KB threshold', () => {
      const recommendation = NetworkOptimizer.recommendCompression(50);

      // Source uses strict `>` so exactly 50KB is NOT recommended
      expect(recommendation.recommended).toBe(false);
      expect(recommendation.algorithm).toBe('none');
    });

    it('should handle edge case at 200KB threshold for algorithm selection', () => {
      const rec199 = NetworkOptimizer.recommendCompression(199);
      const rec200 = NetworkOptimizer.recommendCompression(200);

      expect(rec199.algorithm).toBe('gzip');
      expect(rec200.algorithm).toBe('brotli');
    });

    it('should return valid compression recommendation structure', () => {
      const recommendation = NetworkOptimizer.recommendCompression(100);

      expect(recommendation).toHaveProperty('dataSize');
      expect(recommendation).toHaveProperty('compressedSize');
      expect(recommendation).toHaveProperty('savingsKB');
      expect(recommendation).toHaveProperty('savingsPercent');
      expect(recommendation).toHaveProperty('recommended');
      expect(recommendation).toHaveProperty('algorithm');
    });
  });

  describe('Integration Tests', () => {
    it('should optimize a realistic request batch', () => {
      const requests: NetworkRequest[] = [
        // Duplicate cacheable GET requests
        createRequest({ id: 'req-1', endpoint: '/matches', dataSize: 50, cacheable: true, method: 'GET' }),
        createRequest({ id: 'req-2', endpoint: '/matches', dataSize: 50, cacheable: true, method: 'GET' }),
        createRequest({ id: 'req-3', endpoint: '/matches', dataSize: 50, cacheable: true, method: 'GET' }),
        
        // Large payload needing compression
        createRequest({ id: 'req-4', endpoint: '/teams', dataSize: 250, cacheable: true, method: 'GET' }),
        
        // Non-cacheable POST
        createRequest({ id: 'req-5', endpoint: '/matches', dataSize: 100, cacheable: false, method: 'POST' }),
      ];

      const result = NetworkOptimizer.optimizeNetworkRequests(requests);

      expect(result.duplicates.length).toBe(2);
      expect(result.batches.length).toBeGreaterThan(0);
      expect(result.compressionRecommendations.size).toBeGreaterThan(0);
      expect(result.totalSavingsKB).toBeGreaterThan(0);
      expect(result.timestamp).toBeGreaterThan(0);
    });

    it('should provide cache strategy for endpoint during optimization', () => {
      const strategy = NetworkOptimizer.getCacheStrategy('/matches');
      expect(strategy).toBeDefined();
      expect(strategy.ttlSeconds).toBeGreaterThan(0);
    });

    it('should recommend compression for /predictions endpoint data', () => {
      const requests = [
        createRequest({ id: 'req-1', endpoint: '/predictions', dataSize: 150, cacheable: true }),
      ];

      const result = NetworkOptimizer.optimizeNetworkRequests(requests);
      const prediction = result.compressionRecommendations.get('/predictions');

      expect(prediction?.recommended).toBe(true);
    });

    it('should detect duplicate requests and suggest batching simultaneously', () => {
      const requests = [
        createRequest({ id: 'req-1', endpoint: '/matches', dataSize: 100 }),
        createRequest({ id: 'req-2', endpoint: '/matches', dataSize: 100 }),
        createRequest({ id: 'req-3', endpoint: '/matches', dataSize: 100 }),
      ];

      const result = NetworkOptimizer.optimizeNetworkRequests(requests);

      expect(result.duplicates.length).toBeGreaterThan(0);
      expect(result.batches.length).toBeGreaterThan(0);
      expect(result.totalSavingsKB).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('should handle negative dataSize gracefully', () => {
      const requests = [
        createRequest({ id: 'req-1', dataSize: -50 }),
      ];

      // Should filter out invalid requests
      const result = NetworkOptimizer.optimizeNetworkRequests(requests);
      expect(result.batches.length).toBe(0);
    });

    it('should handle zero dataSize', () => {
      const requests = [
        createRequest({ id: 'req-1', dataSize: 0 }),
      ];

      const result = NetworkOptimizer.optimizeNetworkRequests(requests);
      expect(result).toBeDefined();
    });

    it('should handle very large dataSize (>1000MB)', () => {
      const recommendation = NetworkOptimizer.recommendCompression(1000000);

      expect(recommendation.recommended).toBe(true);
      expect(recommendation.algorithm).toBe('brotli');
      expect(recommendation.savingsKB).toBeGreaterThan(0);
    });

    it('should handle endpoints with special characters', () => {
      const strategy1 = NetworkOptimizer.getCacheStrategy('/api/v2/users/:id/profile');
      const strategy2 = NetworkOptimizer.getCacheStrategy('/api/search?q=test&limit=10');

      expect(strategy1.type).toBe('time-based');
      expect(strategy2.type).toBe('time-based');
    });

    it('should handle mixed case endpoints', () => {
      const strategy = NetworkOptimizer.getCacheStrategy('/Matches');

      expect(strategy).toBeDefined();
    });

    it('should handle empty endpoint string', () => {
      const requests = [
        createRequest({ id: 'req-1', endpoint: '' }),
      ];

      const result = NetworkOptimizer.optimizeNetworkRequests(requests);
      expect(result.batches.length).toBe(0);
    });

    it('should handle whitespace-only endpoints', () => {
      const strategy = NetworkOptimizer.getCacheStrategy('   ');

      expect(strategy.type).toBe('time-based');
    });
  });
});

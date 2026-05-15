/**
 * NetworkOptimizer - Network Request Optimization Utility
 * Optimizes network requests through caching, batching, and compression strategies
 */

/**
 * Individual network request
 */
export interface NetworkRequest {
  id: string;                    // Unique request ID
  endpoint: string;              // API endpoint URL
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  dataSize: number;              // Request payload size in KB
  priority: 'low' | 'normal' | 'high';
  timestamp: number;             // Request timestamp (Unix ms)
  cacheable: boolean;            // Can be cached
}

/**
 * Cache strategy for endpoint
 */
export interface CacheStrategy {
  type: 'none' | 'time-based' | 'size-based' | 'conditional';
  ttlSeconds?: number;           // Time-to-live in seconds (for time-based)
  maxSizeKB?: number;            // Maximum cache size (for size-based)
  validateHeader?: string;       // Header to validate (for conditional)
}

/**
 * Optimized request group for batching
 */
export interface RequestBatch {
  endpoint: string;              // Common endpoint
  requests: NetworkRequest[];    // Grouped requests
  estimatedSavingsKB: number;   // Network savings from batching
  canBatch: boolean;             // Is batching possible for this group
}

/**
 * Compression recommendation
 */
export interface CompressionRecommendation {
  dataSize: number;              // Original size in KB
  compressedSize: number;        // Estimated compressed size in KB
  savingsKB: number;             // Savings in KB
  savingsPercent: number;        // Percentage savings
  recommended: boolean;          // True if size > 50KB
  algorithm: 'gzip' | 'brotli' | 'none';
}

/**
 * Optimized requests result
 */
export interface OptimizedRequests {
  batches: RequestBatch[];       // Batched request groups
  duplicates: NetworkRequest[];  // Cached/duplicate requests found
  compressionRecommendations: Map<string, CompressionRecommendation>;
  totalSavingsKB: number;        // Total network savings
  timestamp: number;             // Analysis timestamp
}

/**
 * NetworkOptimizer Utility
 * Analyzes and optimizes network requests for performance
 */
export class NetworkOptimizer {
  private static readonly BATCHING_THRESHOLD = 50; // KB per batch
  private static readonly COMPRESSION_THRESHOLD = 50; // KB minimum for compression
  private static readonly CACHE_STRATEGIES: Map<string, CacheStrategy> = new Map([
    ['/matches', { type: 'time-based', ttlSeconds: 300 }],
    ['/teams', { type: 'time-based', ttlSeconds: 600 }],
    ['/players', { type: 'time-based', ttlSeconds: 600 }],
    ['/notifications', { type: 'time-based', ttlSeconds: 60 }],
    ['/predictions', { type: 'time-based', ttlSeconds: 120 }],
  ]);

  /**
   * Analyze and optimize network requests
   * @param requests - Array of pending network requests
   * @returns Optimized requests with batching and caching recommendations
   */
  static optimizeNetworkRequests(requests: NetworkRequest[]): OptimizedRequests {
    try {
      // Filter valid requests
      const validRequests = requests.filter(r => this.isValidRequest(r));

      if (validRequests.length === 0) {
        return {
          batches: [],
          duplicates: [],
          compressionRecommendations: new Map(),
          totalSavingsKB: 0,
          timestamp: Date.now(),
        };
      }

      // 1. Detect duplicates and cached requests
      const duplicates = this.detectDuplicates(validRequests);

      // 2. Group requests for batching
      const batches = this.groupForBatching(validRequests);

      // 3. Generate compression recommendations
      const compressionRecs = this.generateCompressionRecommendations(validRequests);

      // 4. Calculate total savings
      const batchingSavings = batches.reduce((sum, b) => sum + b.estimatedSavingsKB, 0);
      const compressionSavings = Array.from(compressionRecs.values())
        .reduce((sum, c) => sum + c.savingsKB, 0);
      const duplicateSavings = duplicates.length > 0
        ? duplicates.reduce((sum, d) => sum + d.dataSize, 0)
        : 0;

      return {
        batches,
        duplicates,
        compressionRecommendations: compressionRecs,
        totalSavingsKB: Math.round(batchingSavings + compressionSavings + duplicateSavings),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error optimizing network requests:', error);
      // Return fallback with no optimizations
      return {
        batches: [],
        duplicates: [],
        compressionRecommendations: new Map(),
        totalSavingsKB: 0,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Get cache strategy for endpoint
   * @param endpoint - API endpoint path
   * @returns Cache strategy configuration
   */
  static getCacheStrategy(endpoint: string): CacheStrategy {
    try {
      // Check if endpoint has predefined strategy
      const predefined = this.CACHE_STRATEGIES.get(endpoint);
      if (predefined) {
        return predefined;
      }

      // Determine strategy based on endpoint type
      if (endpoint.includes('/search') || endpoint.includes('/filter')) {
        // Search results: moderate caching
        return { type: 'time-based', ttlSeconds: 180 };
      } else if (endpoint.includes('/user') || endpoint.includes('/profile')) {
        // User data: longer cache
        return { type: 'time-based', ttlSeconds: 900 };
      } else if (endpoint.includes('/config') || endpoint.includes('/settings')) {
        // Config: extended cache
        return { type: 'time-based', ttlSeconds: 3600 };
      } else if (endpoint.includes('POST') || endpoint.includes('PUT') || endpoint.includes('DELETE')) {
        // Mutating operations: no cache
        return { type: 'none' };
      } else {
        // Default: moderate cache
        return { type: 'time-based', ttlSeconds: 300 };
      }
    } catch (error) {
      console.error('Error getting cache strategy:', error);
      return { type: 'none' };
    }
  }

  /**
   * Recommend compression algorithm based on data size
   * @param dataSize - Size in KB
   * @returns Recommended compression algorithm and savings
   */
  static recommendCompression(dataSize: number): CompressionRecommendation {
    const recommended = dataSize > this.COMPRESSION_THRESHOLD;

    if (!recommended) {
      return {
        dataSize,
        compressedSize: dataSize,
        savingsKB: 0,
        savingsPercent: 0,
        recommended: false,
        algorithm: 'none',
      };
    }

    // Estimate compression ratio based on data type
    // JSON typically compresses 60-70%, binary data 30-50%
    const estimatedRatio = 0.35; // Conservative 35% of original
    const compressedSize = Math.round(dataSize * estimatedRatio);
    const savingsKB = dataSize - compressedSize;
    const savingsPercent = Math.round(((dataSize - compressedSize) / dataSize) * 100);

    return {
      dataSize,
      compressedSize,
      savingsKB,
      savingsPercent,
      recommended: dataSize >= 50, // Recommend compression only if >= 50KB
      algorithm: dataSize >= 200 ? 'brotli' : 'gzip', // Brotli for 200KB+
    };
  }

  // Private helper methods

  /**
   * Validate request structure
   */
  private static isValidRequest(req: NetworkRequest): boolean {
    return (
      req.id &&
      req.endpoint &&
      req.method &&
      req.dataSize >= 0 &&
      req.timestamp > 0 &&
      typeof req.cacheable === 'boolean'
    );
  }

  /**
   * Detect duplicate and cached requests
   */
  private static detectDuplicates(requests: NetworkRequest[]): NetworkRequest[] {
    try {
      const seen = new Set<string>();
      const duplicates: NetworkRequest[] = [];

      for (const req of requests) {
        // Key: endpoint + method (cacheable GET requests can be merged)
        const key = `${req.endpoint}:${req.method}`;

        if (req.cacheable && req.method === 'GET' && seen.has(key)) {
          duplicates.push(req);
        } else if (req.cacheable && req.method === 'GET') {
          seen.add(key);
        }
      }

      return duplicates;
    } catch (error) {
      console.error('Error detecting duplicates:', error);
      return [];
    }
  }

  /**
   * Group requests for batching
   */
  private static groupForBatching(requests: NetworkRequest[]): RequestBatch[] {
    try {
      const grouped = new Map<string, NetworkRequest[]>();

      // Group by endpoint
      for (const req of requests) {
        const endpoint = req.endpoint;
        if (!grouped.has(endpoint)) {
          grouped.set(endpoint, []);
        }
        grouped.get(endpoint)!.push(req);
      }

      // Create batches
      const batches: RequestBatch[] = [];
      for (const [endpoint, reqs] of grouped) {
        if (reqs.length > 1) {
          const totalSize = reqs.reduce((sum, r) => sum + r.dataSize, 0);
          const estimatedSavings = Math.round(totalSize * 0.15); // 15% overhead reduction through batching

          batches.push({
            endpoint,
            requests: reqs,
            estimatedSavingsKB: estimatedSavings,
            canBatch: totalSize < this.BATCHING_THRESHOLD,
          });
        }
      }

      return batches;
    } catch (error) {
      console.error('Error grouping for batching:', error);
      return [];
    }
  }

  /**
   * Generate compression recommendations for requests
   */
  private static generateCompressionRecommendations(
    requests: NetworkRequest[]
  ): Map<string, CompressionRecommendation> {
    try {
      const recommendations = new Map<string, CompressionRecommendation>();

      // Group by endpoint and recommend compression
      const endpointSizes = new Map<string, number>();
      for (const req of requests) {
        const current = endpointSizes.get(req.endpoint) || 0;
        endpointSizes.set(req.endpoint, current + req.dataSize);
      }

      // Generate recommendations for each endpoint
      for (const [endpoint, totalSize] of endpointSizes) {
        const rec = this.recommendCompression(totalSize);
        recommendations.set(endpoint, rec);
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating compression recommendations:', error);
      return new Map();
    }
  }
}

const cache = new Map();

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 300000; // 5 minutes in milliseconds
  }

  set(key, value, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, {
      value,
      expiresAt
    });
    
    // Auto-cleanup expired entries
    setTimeout(() => {
      this.delete(key);
    }, ttl);
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  getStats() {
    const now = Date.now();
    let validItems = 0;
    let expiredItems = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        expiredItems++;
      } else {
        validItems++;
      }
    }
    
    return {
      totalItems: this.cache.size,
      validItems,
      expiredItems
    };
  }

  // Clean up expired entries manually
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    return keysToDelete.length;
  }
}

const cacheManager = new CacheManager();

// Middleware for caching API responses
const cacheMiddleware = (ttl) => {
  return (req, res, next) => {
    // Create cache key from request URL and query parameters
    const cacheKey = `${req.originalUrl}${JSON.stringify(req.query)}`;
    
    // Try to get cached response
    const cachedResponse = cacheManager.get(cacheKey);
    
    if (cachedResponse) {
      console.log(`📋 Cache HIT for ${cacheKey}`);
      return res.json({
        ...cachedResponse,
        cached: true,
        cacheTimestamp: new Date().toISOString()
      });
    }
    
    console.log(`🔄 Cache MISS for ${cacheKey}`);
    
    // Store original res.json method
    const originalJson = res.json;
    
    // Override res.json to cache the response
    res.json = function(data) {
      // Cache the response data
      cacheManager.set(cacheKey, data, ttl);
      console.log(`💾 Cached response for ${cacheKey}`);
      
      // Call original res.json
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Periodic cleanup of expired cache entries
setInterval(() => {
  const deletedCount = cacheManager.cleanup();
  if (deletedCount > 0) {
    console.log(`🧹 Cleaned up ${deletedCount} expired cache entries`);
  }
}, 60000); // Run every minute

module.exports = {
  cacheManager,
  cacheMiddleware
};
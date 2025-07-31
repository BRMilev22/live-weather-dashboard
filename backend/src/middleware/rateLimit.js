class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.windowMs = 60000; // 1 minute window
    this.maxRequests = 100; // Max requests per window per IP
    this.weatherApiLimit = 10; // Max weather API calls per minute per IP
  }

  // General rate limiting
  isRateLimited(ip, limit = this.maxRequests) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(ip)) {
      this.requests.set(ip, []);
    }
    
    const ipRequests = this.requests.get(ip);
    
    // Remove old requests outside the current window
    const validRequests = ipRequests.filter(timestamp => timestamp > windowStart);
    
    // Update the requests array
    this.requests.set(ip, validRequests);
    
    // Check if limit is exceeded
    if (validRequests.length >= limit) {
      return {
        limited: true,
        resetTime: Math.min(...validRequests) + this.windowMs,
        requestsRemaining: 0
      };
    }
    
    // Add current request timestamp
    validRequests.push(now);
    this.requests.set(ip, validRequests);
    
    return {
      limited: false,
      resetTime: now + this.windowMs,
      requestsRemaining: limit - validRequests.length
    };
  }

  // Specific rate limiting for weather API calls
  isWeatherApiLimited(ip) {
    return this.isRateLimited(`weather_${ip}`, this.weatherApiLimit);
  }

  // Get rate limit status
  getStatus(ip) {
    const generalLimit = this.isRateLimited(ip, this.maxRequests);
    const weatherLimit = this.isWeatherApiLimited(ip);
    
    return {
      general: {
        remaining: generalLimit.requestsRemaining,
        resetTime: generalLimit.resetTime,
        limited: generalLimit.limited
      },
      weatherApi: {
        remaining: weatherLimit.requestsRemaining,
        resetTime: weatherLimit.resetTime,
        limited: weatherLimit.limited
      }
    };
  }

  // Cleanup old entries
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    let cleanedCount = 0;
    
    for (const [ip, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      
      if (validRequests.length === 0) {
        this.requests.delete(ip);
        cleanedCount++;
      } else if (validRequests.length !== requests.length) {
        this.requests.set(ip, validRequests);
      }
    }
    
    return cleanedCount;
  }
}

const rateLimiter = new RateLimiter();

// General rate limiting middleware
const rateLimitMiddleware = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const result = rateLimiter.isRateLimited(ip);
  
  // Add rate limit headers
  res.set({
    'X-RateLimit-Limit': rateLimiter.maxRequests,
    'X-RateLimit-Remaining': result.requestsRemaining,
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
  });
  
  if (result.limited) {
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      resetTime: new Date(result.resetTime).toISOString(),
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
    });
  }
  
  next();
};

// Weather API specific rate limiting
const weatherApiRateLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const result = rateLimiter.isWeatherApiLimited(ip);
  
  // Add weather API specific headers
  res.set({
    'X-Weather-RateLimit-Limit': rateLimiter.weatherApiLimit,
    'X-Weather-RateLimit-Remaining': result.requestsRemaining,
    'X-Weather-RateLimit-Reset': new Date(result.resetTime).toISOString()
  });
  
  if (result.limited) {
    console.log(`🚫 Weather API rate limit exceeded for IP: ${ip}`);
    return res.status(429).json({
      error: 'Weather API rate limit exceeded',
      message: 'Too many weather API requests. Please try again later.',
      resetTime: new Date(result.resetTime).toISOString(),
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
    });
  }
  
  console.log(`✅ Weather API request allowed for IP: ${ip} (${result.requestsRemaining} remaining)`);
  next();
};

// Periodic cleanup
setInterval(() => {
  const cleanedCount = rateLimiter.cleanup();
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} old rate limit entries`);
  }
}, 300000); // Run every 5 minutes

module.exports = {
  rateLimiter,
  rateLimitMiddleware,
  weatherApiRateLimit
};
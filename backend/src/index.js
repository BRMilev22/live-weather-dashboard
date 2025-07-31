const express = require('express');
const cors = require('cors');
require('dotenv').config();
const weatherService = require('./services/weatherService');
const { cacheMiddleware, cacheManager } = require('./middleware/cache');
const { rateLimitMiddleware, weatherApiRateLimit, rateLimiter } = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Apply general rate limiting to all routes
app.use(rateLimitMiddleware);

app.get('/api/health', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  res.json({ 
    status: 'OK', 
    message: 'Live Weather Dashboard API is running',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.OPENWEATHER_API_KEY,
    cache: cacheManager.getStats(),
    rateLimit: rateLimiter.getStatus(ip)
  });
});

app.get('/api/weather', weatherApiRateLimit, cacheMiddleware(300000), async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    // Default coordinates (Bulgarian Black Sea coast) if not provided  
    const latitude = lat || 42.34;
    const longitude = lon || 27.19;

    let weatherData;

    // Use real API if key is available, otherwise use mock data
    if (process.env.OPENWEATHER_API_KEY) {
      console.log(`🌤️  Fetching real weather data for ${latitude}, ${longitude}`);
      weatherData = await weatherService.getComprehensiveWeatherData(latitude, longitude);
    } else {
      console.log('⚠️  No API key found, using mock data');
      weatherData = weatherService.getMockWeatherData(parseFloat(latitude), parseFloat(longitude));
    }

    res.json(weatherData);
  } catch (error) {
    console.error('Error in /api/weather:', error.message);
    
    // Fallback to mock data on error
    console.log('📋 Falling back to mock data');
    const mockData = weatherService.getMockWeatherData();
    res.json(mockData);
  }
});

app.get('/api/search-location', weatherApiRateLimit, cacheMiddleware(600000), async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    if (!process.env.OPENWEATHER_API_KEY) {
      return res.status(503).json({ 
        error: 'Location search requires API key',
        suggestions: [
          { name: 'Sredets', country: 'BG', lat: 42.6500, lon: 25.3167 },
          { name: 'Sofia', country: 'BG', lat: 42.6977, lon: 23.3219 },
          { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
          { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060 },
          { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 }
        ]
      });
    }

    const locations = await weatherService.getLocationByName(query);
    res.json({ locations });
  } catch (error) {
    console.error('Error in /api/search-location:', error.message);
    res.status(500).json({ error: 'Failed to search locations' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

app.listen(PORT, () => {
  console.log(`🌤️  Live Weather Dashboard API running on port ${PORT}`);
  console.log(`🔑 API Key: ${process.env.OPENWEATHER_API_KEY ? '✅ Available' : '❌ Not set (using mock data)'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
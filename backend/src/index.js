const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Live Weather Dashboard API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/weather', (req, res) => {
  const mockWeatherData = {
    location: {
      city: 'San Francisco',
      country: 'US',
      coordinates: { lat: 37.7749, lon: -122.4194 }
    },
    current: {
      temperature: 22,
      humidity: 65,
      windSpeed: 12,
      windDirection: 'NW',
      pressure: 1013,
      visibility: 10,
      uvIndex: 5,
      condition: 'Partly Cloudy',
      icon: 'partly-cloudy'
    },
    forecast: [
      {
        date: new Date().toISOString().split('T')[0],
        high: 24,
        low: 18,
        condition: 'Partly Cloudy',
        precipitation: 10
      },
      {
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        high: 26,
        low: 20,
        condition: 'Sunny',
        precipitation: 0
      },
      {
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        high: 23,
        low: 17,
        condition: 'Light Rain',
        precipitation: 70
      }
    ],
    hourly: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      temperature: 18 + Math.random() * 8,
      humidity: 50 + Math.random() * 30,
      windSpeed: 5 + Math.random() * 15,
      precipitation: Math.random() * 100
    })),
    lastUpdated: new Date().toISOString()
  };
  
  res.json(mockWeatherData);
});

app.listen(PORT, () => {
  console.log(`🌤️  Live Weather Dashboard API running on port ${PORT}`);
});
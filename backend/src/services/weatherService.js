const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.geocodingUrl = 'https://api.openweathermap.org/geo/1.0';
  }

  async getCurrentWeather(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat: lat,
          lon: lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return this.formatCurrentWeather(response.data);
    } catch (error) {
      console.error('Error fetching current weather:', error.message);
      throw new Error('Failed to fetch current weather data');
    }
  }

  async getForecast(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat: lat,
          lon: lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return this.formatForecast(response.data);
    } catch (error) {
      console.error('Error fetching forecast:', error.message);
      throw new Error('Failed to fetch forecast data');
    }
  }

  async getLocationByName(cityName) {
    try {
      const response = await axios.get(`${this.geocodingUrl}/direct`, {
        params: {
          q: cityName,
          limit: 5,
          appid: this.apiKey
        }
      });

      return response.data.map(location => ({
        name: location.name,
        country: location.country,
        state: location.state,
        lat: location.lat,
        lon: location.lon
      }));
    } catch (error) {
      console.error('Error searching location:', error.message);
      throw new Error('Failed to search location');
    }
  }

  async getComprehensiveWeatherData(lat, lon) {
    try {
      const [currentWeather, forecast] = await Promise.all([
        this.getCurrentWeather(lat, lon),
        this.getForecast(lat, lon)
      ]);

      // Get location name from reverse geocoding
      const locationResponse = await axios.get(`${this.geocodingUrl}/reverse`, {
        params: {
          lat: lat,
          lon: lon,
          limit: 1,
          appid: this.apiKey
        }
      });

      const locationData = locationResponse.data[0] || {};

      return {
        location: {
          city: locationData.name || 'Unknown',
          country: locationData.country || 'Unknown',
          coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) }
        },
        current: currentWeather,
        forecast: forecast.daily,
        hourly: forecast.hourly,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching comprehensive weather data:', error.message);
      throw error;
    }
  }

  formatCurrentWeather(data) {
    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      windDirection: this.getWindDirection(data.wind.deg || 0),
      pressure: data.main.pressure,
      visibility: Math.round((data.visibility || 10000) / 1000), // Convert m to km
      uvIndex: 0, // UV index not available in current weather, would need separate call
      condition: this.capitalizeWords(data.weather[0].description),
      icon: this.mapWeatherIcon(data.weather[0].icon)
    };
  }

  formatForecast(data) {
    const hourly = data.list.slice(0, 24).map((item, index) => ({
      hour: (new Date().getHours() + index) % 24,
      temperature: Math.round(item.main.temp),
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind.speed * 3.6),
      precipitation: item.pop * 100 // Probability of precipitation as percentage
    }));

    // Group by day for daily forecast
    const daily = [];
    const processedDays = new Set();
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!processedDays.has(date) && daily.length < 5) {
        daily.push({
          date: date,
          high: Math.round(item.main.temp_max),
          low: Math.round(item.main.temp_min),
          condition: this.capitalizeWords(item.weather[0].description),
          precipitation: Math.round(item.pop * 100)
        });
        processedDays.add(date);
      }
    });

    return { hourly, daily };
  }

  getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  mapWeatherIcon(iconCode) {
    const iconMap = {
      '01d': 'sunny',
      '01n': 'clear-night',
      '02d': 'partly-cloudy',
      '02n': 'partly-cloudy-night',
      '03d': 'cloudy',
      '03n': 'cloudy',
      '04d': 'cloudy',
      '04n': 'cloudy',
      '09d': 'rainy',
      '09n': 'rainy',
      '10d': 'rainy',
      '10n': 'rainy',
      '11d': 'stormy',
      '11n': 'stormy',
      '13d': 'snowy',
      '13n': 'snowy',
      '50d': 'fog',
      '50n': 'fog'
    };
    return iconMap[iconCode] || 'partly-cloudy';
  }

  capitalizeWords(str) {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  // Mock method for development when API key is not available
  getMockWeatherData(lat = 37.7749, lon = -122.4194) {
    return {
      location: {
        city: 'San Francisco',
        country: 'US',
        coordinates: { lat, lon }
      },
      current: {
        temperature: Math.round(18 + Math.random() * 10),
        humidity: Math.round(50 + Math.random() * 30),
        windSpeed: Math.round(5 + Math.random() * 15),
        windDirection: 'NW',
        pressure: Math.round(1010 + Math.random() * 10),
        visibility: Math.round(8 + Math.random() * 4),
        uvIndex: Math.round(Math.random() * 10),
        condition: 'Partly Cloudy',
        icon: 'partly-cloudy'
      },
      forecast: [
        {
          date: new Date().toISOString().split('T')[0],
          high: Math.round(22 + Math.random() * 6),
          low: Math.round(15 + Math.random() * 5),
          condition: 'Partly Cloudy',
          precipitation: Math.round(Math.random() * 30)
        },
        {
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          high: Math.round(24 + Math.random() * 6),
          low: Math.round(17 + Math.random() * 5),
          condition: 'Sunny',
          precipitation: Math.round(Math.random() * 10)
        },
        {
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          high: Math.round(21 + Math.random() * 6),
          low: Math.round(14 + Math.random() * 5),
          condition: 'Light Rain',
          precipitation: Math.round(60 + Math.random() * 30)
        }
      ],
      hourly: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        temperature: Math.round(16 + Math.random() * 8 + Math.sin(i * Math.PI / 12) * 4),
        humidity: Math.round(45 + Math.random() * 35 + Math.cos(i * Math.PI / 8) * 10),
        windSpeed: Math.round(3 + Math.random() * 12 + Math.sin(i * Math.PI / 6) * 3),
        precipitation: Math.random() * 100
      })),
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = new WeatherService();
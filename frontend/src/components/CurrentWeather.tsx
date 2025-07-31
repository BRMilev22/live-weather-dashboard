import React from 'react';
import { CurrentWeather as CurrentWeatherType, WeatherLocation } from '../types/weather';

interface CurrentWeatherProps {
  data?: CurrentWeatherType;
  location?: WeatherLocation;
  loading?: boolean;
  lastUpdated?: string;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  data,
  location,
  loading = false,
  lastUpdated
}) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getWeatherIcon = (condition: string) => {
    const icons: { [key: string]: string } = {
      'sunny': '☀️',
      'partly-cloudy': '⛅',
      'cloudy': '☁️',
      'rainy': '🌧️',
      'stormy': '⛈️',
      'snowy': '❄️',
      'fog': '🌫️',
      'default': '🌤️'
    };
    return icons[condition.toLowerCase()] || icons.default;
  };

  if (loading) {
    return (
      <div className="current-weather loading">
        <div className="weather-header">
          <div className="location-skeleton"></div>
          <div className="time-skeleton"></div>
        </div>
        <div className="weather-main">
          <div className="temp-skeleton"></div>
          <div className="condition-skeleton"></div>
        </div>
        <div className="weather-details">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="detail-skeleton"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || !location) {
    return (
      <div className="current-weather placeholder">
        <div className="weather-placeholder">
          <div className="weather-icon-large">🌡️</div>
          <p>Current weather data will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="current-weather">
      <div className="weather-header">
        <div className="location-info">
          <h2>{location.city}, {location.country}</h2>
          <div className="coordinates">
            {location.coordinates.lat.toFixed(2)}°, {location.coordinates.lon.toFixed(2)}°
          </div>
        </div>
        {lastUpdated && (
          <div className="last-updated">
            <span className="update-indicator"></span>
            {formatTime(lastUpdated)}
          </div>
        )}
      </div>

      <div className="weather-main">
        <div className="temperature-section">
          <div className="temperature">
            {Math.round(data.temperature)}°
          </div>
          <div className="weather-condition">
            <span className="weather-icon">
              {getWeatherIcon(data.icon)}
            </span>
            <span className="condition-text">{data.condition}</span>
          </div>
        </div>
      </div>

      <div className="weather-details">
        <div className="detail-item">
          <div className="detail-icon">💧</div>
          <div className="detail-content">
            <span className="detail-label">Humidity</span>
            <span className="detail-value">{data.humidity}%</span>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">💨</div>
          <div className="detail-content">
            <span className="detail-label">Wind</span>
            <span className="detail-value">{data.windSpeed} km/h {data.windDirection}</span>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">📊</div>
          <div className="detail-content">
            <span className="detail-label">Pressure</span>
            <span className="detail-value">{data.pressure} hPa</span>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">👁️</div>
          <div className="detail-content">
            <span className="detail-label">Visibility</span>
            <span className="detail-value">{data.visibility} km</span>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">☀️</div>
          <div className="detail-content">
            <span className="detail-label">UV Index</span>
            <span className="detail-value">{data.uvIndex}</span>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">🌡️</div>
          <div className="detail-content">
            <span className="detail-label">Feels Like</span>
            <span className="detail-value">{Math.round(data.temperature + 2)}°</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;
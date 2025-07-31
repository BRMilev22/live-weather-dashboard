import React from 'react';
import { WeatherForecast as WeatherForecastType } from '../types/weather';

interface WeatherForecastProps {
  data?: WeatherForecastType[];
  loading?: boolean;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({
  data,
  loading = false
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getWeatherIcon = (condition: string) => {
    const icons: { [key: string]: string } = {
      'sunny': '☀️',
      'clear': '☀️',
      'partly cloudy': '⛅',
      'cloudy': '☁️',
      'overcast': '☁️',
      'light rain': '🌦️',
      'rain': '🌧️',
      'heavy rain': '🌧️',
      'thunderstorm': '⛈️',
      'snow': '❄️',
      'fog': '🌫️',
      'mist': '🌫️',
      'drizzle': '🌦️'
    };
    return icons[condition.toLowerCase()] || '🌤️';
  };

  const getPrecipitationColor = (precipitation: number) => {
    if (precipitation < 20) return 'rgba(79, 172, 254, 0.3)';
    if (precipitation < 50) return 'rgba(254, 225, 64, 0.3)';
    if (precipitation < 80) return 'rgba(251, 146, 60, 0.3)';
    return 'rgba(239, 68, 68, 0.3)';
  };

  if (loading) {
    return (
      <div className="weather-forecast">
        <h3>5-Day Forecast</h3>
        <div className="forecast-grid">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="forecast-card loading">
              <div className="forecast-date-skeleton"></div>
              <div className="forecast-icon-skeleton"></div>
              <div className="forecast-temps-skeleton">
                <div className="temp-skeleton"></div>
                <div className="temp-skeleton"></div>
              </div>
              <div className="forecast-condition-skeleton"></div>
              <div className="forecast-precipitation-skeleton"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="weather-forecast">
        <h3>5-Day Forecast</h3>
        <div className="forecast-placeholder">
          <div className="forecast-placeholder-icon">📅</div>
          <p>Weather forecast will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-forecast">
      <h3>5-Day Forecast</h3>
      <div className="forecast-grid">
        {data.slice(0, 5).map((forecast, index) => (
          <div 
            key={forecast.date} 
            className="forecast-card"
            style={{ 
              animationDelay: `${index * 0.1}s` 
            }}
          >
            <div className="forecast-date">
              {formatDate(forecast.date)}
            </div>
            
            <div className="forecast-icon">
              {getWeatherIcon(forecast.condition)}
            </div>
            
            <div className="forecast-temps">
              <span className="high-temp">{forecast.high}°</span>
              <span className="low-temp">{forecast.low}°</span>
            </div>
            
            <div className="forecast-condition">
              {forecast.condition}
            </div>
            
            <div className="forecast-precipitation">
              <div 
                className="precipitation-bar"
                style={{ 
                  width: `${forecast.precipitation}%`,
                  backgroundColor: getPrecipitationColor(forecast.precipitation)
                }}
              ></div>
              <span className="precipitation-text">
                {forecast.precipitation}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherForecast;
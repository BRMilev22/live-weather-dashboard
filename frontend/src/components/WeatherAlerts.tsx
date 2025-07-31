import React, { useState, useEffect } from 'react';
import { CurrentWeather } from '../types/weather';

interface WeatherAlert {
  id: string;
  type: 'warning' | 'watch' | 'info' | 'severe';
  title: string;
  message: string;
  timestamp: string;
  priority: number;
}

interface WeatherAlertsProps {
  currentWeather?: CurrentWeather;
  location?: { city: string; country: string };
}

const WeatherAlerts: React.FC<WeatherAlertsProps> = ({
  currentWeather,
  location
}) => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Generate alerts based on current weather conditions
  useEffect(() => {
    if (!currentWeather) return;

    const newAlerts: WeatherAlert[] = [];
    const now = new Date().toISOString();

    // Temperature alerts
    if (currentWeather.temperature > 35) {
      newAlerts.push({
        id: 'heat-warning',
        type: 'warning',
        title: 'Extreme Heat Warning',
        message: `Temperature is ${currentWeather.temperature}°C. Stay hydrated and avoid prolonged outdoor activities.`,
        timestamp: now,
        priority: 3
      });
    } else if (currentWeather.temperature < -10) {
      newAlerts.push({
        id: 'cold-warning',
        type: 'warning',
        title: 'Extreme Cold Warning',
        message: `Temperature is ${currentWeather.temperature}°C. Dress warmly and limit outdoor exposure.`,
        timestamp: now,
        priority: 3
      });
    }

    // Wind alerts
    if (currentWeather.windSpeed > 50) {
      newAlerts.push({
        id: 'wind-severe',
        type: 'severe',
        title: 'Severe Wind Alert',
        message: `Wind speed is ${currentWeather.windSpeed} km/h. Avoid outdoor activities and secure loose objects.`,
        timestamp: now,
        priority: 4
      });
    } else if (currentWeather.windSpeed > 30) {
      newAlerts.push({
        id: 'wind-warning',
        type: 'warning',
        title: 'High Wind Advisory',
        message: `Wind speed is ${currentWeather.windSpeed} km/h. Use caution when driving or walking outdoors.`,
        timestamp: now,
        priority: 2
      });
    }

    // Visibility alerts
    if (currentWeather.visibility < 1) {
      newAlerts.push({
        id: 'visibility-severe',
        type: 'severe',
        title: 'Dense Fog Warning',
        message: `Visibility is only ${currentWeather.visibility} km. Drive slowly and use fog lights.`,
        timestamp: now,
        priority: 4
      });
    } else if (currentWeather.visibility < 3) {
      newAlerts.push({
        id: 'visibility-warning',
        type: 'warning',
        title: 'Low Visibility Advisory',
        message: `Visibility is reduced to ${currentWeather.visibility} km. Drive with caution.`,
        timestamp: now,
        priority: 2
      });
    }

    // UV Index alerts
    if (currentWeather.uvIndex > 8) {
      newAlerts.push({
        id: 'uv-warning',
        type: 'warning',
        title: 'High UV Index Alert',
        message: `UV Index is ${currentWeather.uvIndex}. Use sunscreen and seek shade during peak hours.`,
        timestamp: now,
        priority: 2
      });
    }

    // Humidity alerts
    if (currentWeather.humidity > 85) {
      newAlerts.push({
        id: 'humidity-info',
        type: 'info',
        title: 'High Humidity Notice',
        message: `Humidity is ${currentWeather.humidity}%. It may feel warmer than the actual temperature.`,
        timestamp: now,
        priority: 1
      });
    }

    // Weather condition alerts
    if (currentWeather.condition.toLowerCase().includes('storm') || 
        currentWeather.condition.toLowerCase().includes('thunder')) {
      newAlerts.push({
        id: 'storm-severe',
        type: 'severe',
        title: 'Thunderstorm Alert',
        message: 'Thunderstorms in the area. Seek shelter indoors and avoid using electrical devices.',
        timestamp: now,
        priority: 4
      });
    }

    // Sort alerts by priority (highest first)
    newAlerts.sort((a, b) => b.priority - a.priority);

    setAlerts(newAlerts);
  }, [currentWeather]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getAlertIcon = (type: WeatherAlert['type']) => {
    const icons = {
      severe: '🚨',
      warning: '⚠️',
      watch: '👀',
      info: 'ℹ️'
    };
    return icons[type];
  };

  const getAlertColor = (type: WeatherAlert['type']) => {
    const colors = {
      severe: 'rgba(239, 68, 68, 0.15)',
      warning: 'rgba(245, 158, 11, 0.15)',
      watch: 'rgba(79, 172, 254, 0.15)',
      info: 'rgba(34, 197, 94, 0.15)'
    };
    return colors[type];
  };

  const getAlertBorderColor = (type: WeatherAlert['type']) => {
    const colors = {
      severe: 'rgba(239, 68, 68, 0.4)',
      warning: 'rgba(245, 158, 11, 0.4)',
      watch: 'rgba(79, 172, 254, 0.4)',
      info: 'rgba(34, 197, 94, 0.4)'
    };
    return colors[type];
  };

  const activeAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  if (activeAlerts.length === 0) {
    return (
      <div className="weather-alerts">
        <div className="no-alerts">
          <div className="no-alerts-icon">✅</div>
          <p>No weather alerts for {location?.city || 'your location'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-alerts">
      <h3>Weather Alerts</h3>
      <div className="alerts-container">
        {activeAlerts.map((alert, index) => (
          <div
            key={alert.id}
            className={`alert-card alert-${alert.type}`}
            style={{
              backgroundColor: getAlertColor(alert.type),
              borderColor: getAlertBorderColor(alert.type),
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div className="alert-header">
              <div className="alert-title">
                <span className="alert-icon">{getAlertIcon(alert.type)}</span>
                <span className="alert-title-text">{alert.title}</span>
              </div>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="alert-dismiss"
                title="Dismiss alert"
              >
                ✕
              </button>
            </div>
            
            <div className="alert-message">
              {alert.message}
            </div>
            
            <div className="alert-timestamp">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherAlerts;
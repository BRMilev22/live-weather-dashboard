import React from 'react';

interface WeatherMapProps {
  title?: string;
}

const WeatherMap: React.FC<WeatherMapProps> = ({ title = "Weather Map" }) => {
  return (
    <div className="weather-map">
      <h3>{title}</h3>
      <div className="map-placeholder">
        <div className="placeholder-content">
          <div className="map-icon">🗺️</div>
          <p>Interactive weather map will be displayed here</p>
          <div className="placeholder-features">
            <span>• Real-time weather overlay</span>
            <span>• Temperature heatmap</span>
            <span>• Storm tracking</span>
            <span>• Satellite imagery</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherMap;
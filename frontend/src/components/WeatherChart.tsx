import React from 'react';

interface WeatherChartProps {
  title?: string;
}

const WeatherChart: React.FC<WeatherChartProps> = ({ title = "Weather Chart" }) => {
  return (
    <div className="weather-chart">
      <h3>{title}</h3>
      <div className="chart-placeholder">
        <div className="placeholder-content">
          <div className="chart-icon">📊</div>
          <p>Interactive weather charts will be displayed here</p>
          <div className="placeholder-features">
            <span>• Temperature trends</span>
            <span>• Humidity levels</span>
            <span>• Precipitation data</span>
            <span>• Wind patterns</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherChart;
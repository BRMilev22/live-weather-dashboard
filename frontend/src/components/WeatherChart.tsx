import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { HourlyWeather } from '../types/weather';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeatherChartProps {
  title?: string;
  data?: HourlyWeather[];
  loading?: boolean;
}

const WeatherChart: React.FC<WeatherChartProps> = ({ 
  title = "Weather Analytics", 
  data,
  loading = false 
}) => {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const [chartData, setChartData] = useState<ChartData<'line'> | null>(null);

  useEffect(() => {
    if (data && data.length > 0) {
      const labels = data.map(item => {
        const hour = item.hour;
        return hour === 0 ? '12 AM' : 
               hour < 12 ? `${hour} AM` : 
               hour === 12 ? '12 PM' : 
               `${hour - 12} PM`;
      });

      const temperatures = data.map(item => item.temperature);
      const humidity = data.map(item => item.humidity);
      const windSpeed = data.map(item => item.windSpeed);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Temperature (°C)',
            data: temperatures,
            borderColor: 'rgba(79, 172, 254, 1)',
            backgroundColor: 'rgba(79, 172, 254, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgba(79, 172, 254, 1)',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: 'rgba(79, 172, 254, 1)',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 3,
          },
          {
            label: 'Humidity (%)',
            data: humidity,
            borderColor: 'rgba(240, 147, 251, 1)',
            backgroundColor: 'rgba(240, 147, 251, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgba(240, 147, 251, 1)',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: 'rgba(240, 147, 251, 1)',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 3,
          },
          {
            label: 'Wind Speed (km/h)',
            data: windSpeed,
            borderColor: 'rgba(254, 225, 64, 1)',
            backgroundColor: 'rgba(254, 225, 64, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            pointBackgroundColor: 'rgba(254, 225, 64, 1)',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: 'rgba(254, 225, 64, 1)',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 3,
          }
        ]
      });
    }
  }, [data]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: 'Inter',
            size: 12,
            weight: '500'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        titleFont: {
          family: 'Inter',
          size: 14,
          weight: '600'
        },
        bodyFont: {
          family: 'Inter',
          size: 12,
          weight: '400'
        },
        displayColors: true,
        boxPadding: 4,
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: 'Inter',
            size: 11,
            weight: '400'
          },
          maxRotation: 0,
        },
        border: {
          display: false,
        }
      },
      y: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: 'Inter',
            size: 11,
            weight: '400'
          },
        },
        border: {
          display: false,
        }
      }
    },
    elements: {
      line: {
        borderJoinStyle: 'round',
        borderCapStyle: 'round',
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    }
  };

  if (loading) {
    return (
      <div className="weather-chart">
        <h3>{title}</h3>
        <div className="chart-container">
          <div className="loading-skeleton"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="weather-chart">
        <h3>{title}</h3>
        <div className="chart-placeholder">
          <div className="placeholder-content">
            <div className="chart-icon">📊</div>
            <p>Interactive weather charts will be displayed here</p>
            <div className="placeholder-features">
              <span>Temperature trends</span>
              <span>Humidity levels</span>
              <span>Precipitation data</span>
              <span>Wind patterns</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-chart">
      <h3>{title}</h3>
      <div className="chart-container">
        {chartData && (
          <Line 
            ref={chartRef}
            data={chartData} 
            options={options}
          />
        )}
      </div>
    </div>
  );
};

export default WeatherChart;
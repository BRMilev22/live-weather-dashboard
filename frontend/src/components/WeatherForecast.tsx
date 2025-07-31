import React from 'react';
import { WeatherForecast as WeatherForecastType } from '../types/weather';
import AnimatedWeatherIcon from './AnimatedWeatherIcon';

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
      return 'Fri';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short'
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
    return icons[condition.toLowerCase()] || '☁️';
  };

  if (loading) {
    return (
      <div className="space-y-0">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="grid grid-cols-5 items-center gap-3 py-3 animate-pulse">
            <div className="h-4 bg-white/20 rounded w-12"></div>
            <div className="h-6 w-6 bg-white/20 rounded-full mx-auto"></div>
            <div className="h-4 bg-white/20 rounded w-8 justify-self-end"></div>
            <div className="h-1 bg-white/20 rounded-full mx-2"></div>
            <div className="h-4 bg-white/20 rounded w-8 justify-self-end"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        <p>Weather forecast will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {data.slice(0, 5).map((forecast, index) => (
        <div 
          key={forecast.date} 
          className="grid grid-cols-5 items-center gap-3 py-3 hover:bg-white/5 rounded-lg -mx-2 px-2 transition-all duration-300 animate-fade-in hover:scale-[1.02] group cursor-pointer"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Day */}
          <div className="text-base font-normal text-white group-hover:text-white/90 transition-colors duration-200">
            {formatDate(forecast.date)}
          </div>
          
          {/* Weather Icon */}
          <div className="text-center">
            <AnimatedWeatherIcon condition={forecast.condition} size="md" />
          </div>
          
          {/* Low Temperature */}
          <div className="text-base text-white/60 text-right group-hover:text-white/80 transition-colors duration-200">
            {forecast.low}°
          </div>
          
          {/* Temperature Range Bar */}
          <div className="flex items-center px-2">
            <div className="w-full h-1 bg-white/20 rounded-full relative overflow-hidden group-hover:h-1.5 transition-all duration-200">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 rounded-full transition-all duration-500 animate-shimmer"
                style={{
                  width: '60%',
                  marginLeft: '20%',
                  backgroundSize: '200px 100%'
                }}
              ></div>
            </div>
          </div>
          
          {/* High Temperature */}
          <div className="text-base font-medium text-white text-right group-hover:scale-105 transition-all duration-200">
            {forecast.high}°
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeatherForecast;
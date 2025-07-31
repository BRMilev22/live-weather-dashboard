import React from 'react';

interface AnimatedWeatherIconProps {
  condition: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
}

const AnimatedWeatherIcon: React.FC<AnimatedWeatherIconProps> = ({
  condition,
  size = 'md',
  animate = true
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xl';
      case 'md': return 'text-2xl';
      case 'lg': return 'text-4xl';
      case 'xl': return 'text-6xl';
      default: return 'text-2xl';
    }
  };

  const getAnimationClass = () => {
    if (!animate) return '';
    
    const condition_lower = condition?.toLowerCase() || '';
    
    if (condition_lower.includes('rain') || condition_lower.includes('drizzle')) {
      return 'animate-bounce';
    }
    if (condition_lower.includes('snow')) {
      return 'animate-float';
    }
    if (condition_lower.includes('thunder')) {
      return 'animate-pulse';
    }
    if (condition_lower.includes('wind')) {
      return 'animate-weather-icon';
    }
    return 'animate-float';
  };

  const getWeatherIcon = (condition: string) => {
    const icons: { [key: string]: string } = {
      'clear': '☀️',
      'sunny': '☀️',
      'partly cloudy': '⛅',
      'cloudy': '☁️',
      'overcast': '☁️',
      'rain': '🌧️',
      'drizzle': '🌦️',
      'snow': '❄️',
      'thunderstorm': '⛈️',
      'fog': '🌫️',
      'wind': '💨',
      'mist': '🌫️',
    };
    
    const condition_lower = condition?.toLowerCase() || '';
    for (const [key, icon] of Object.entries(icons)) {
      if (condition_lower.includes(key)) {
        return icon;
      }
    }
    return '☁️';
  };

  return (
    <div className={`${getSizeClasses()} ${getAnimationClass()} inline-block transform-gpu`}>
      {getWeatherIcon(condition)}
    </div>
  );
};

export default AnimatedWeatherIcon;
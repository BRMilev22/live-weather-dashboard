import React, { useState, useEffect } from 'react'
import WeatherForecast from './components/WeatherForecast'
import AddLocationModal from './components/AddLocationModal'
import AnimatedWeatherIcon from './components/AnimatedWeatherIcon'
import { useLocationManager } from './hooks/useLocationManager'
import { useGeolocation } from './hooks/useGeolocation'

function App() {
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const { 
    savedLocations, 
    activeLocationId, 
    activeLocation, 
    addLocation, 
    removeLocation, 
    setActiveLocationId,
    updateLocationWeather 
  } = useLocationManager();
  
  const { 
    location: geoLocation, 
    getCurrentPosition,
    supported: geoSupported 
  } = useGeolocation();

  // Auto-add current location when geolocation is available
  useEffect(() => {
    if (geoLocation && savedLocations.length === 0) {
      // Use reverse geocoding to get location name
      addLocation('Current Location', 'My Location', geoLocation.latitude, geoLocation.longitude, true);
    }
  }, [geoLocation, savedLocations.length, addLocation]);

  // Auto-fetch current location on first load
  useEffect(() => {
    if (geoSupported && savedLocations.length === 0) {
      getCurrentPosition();
    }
  }, [geoSupported, savedLocations.length, getCurrentPosition]);

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
    };
    
    const condition_lower = condition?.toLowerCase() || '';
    for (const [key, icon] of Object.entries(icons)) {
      if (condition_lower.includes(key)) {
        return icon;
      }
    }
    return '☁️';
  };

  const getHourlyForecast = () => {
    if (!activeLocation?.weatherData?.hourly) return [];
    
    const now = new Date();
    const currentHour = now.getHours();
    
    return activeLocation.weatherData.hourly.slice(0, 12).map((item, index) => ({
      time: index === 0 ? 'Now' : `${String((currentHour + index) % 24).padStart(2, '0')}:${index === 0 ? '31' : '00'}`,
      icon: getWeatherIcon(item.condition || 'cloudy'),
      temp: Math.round(item.temperature)
    }));
  };

  const handleAddLocation = async (name: string, country: string, lat: number, lon: number) => {
    await addLocation(name, country, lat, lon);
    setShowAddLocationModal(false);
  };

  const handleLocationClick = (locationId: string) => {
    setActiveLocationId(locationId);
  };

  const currentWeatherData = activeLocation?.weatherData;
  const currentLocation = activeLocation;

  return (
    <div className="flex h-screen bg-gradient-to-b from-slate-600 via-slate-700 to-blue-600 text-white font-sf overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-80 bg-black/20 backdrop-blur-xl border-r border-white/10 p-5 overflow-y-auto">        
        {/* Saved Locations */}
        <div className="space-y-3">
          {savedLocations.map((location, index) => (
            <div 
              key={location.id}
              onClick={() => handleLocationClick(location.id)}
              className={`rounded-2xl p-5 border transition-all duration-300 cursor-pointer group animate-fade-in hover:scale-[1.02] hover:shadow-lg ${
                activeLocationId === location.id
                  ? 'bg-white/20 border-white/20 hover:bg-white/25 shadow-lg scale-[1.01]'
                  : 'bg-white/10 border-white/15 hover:bg-white/15'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-white mb-1 group-hover:text-white/90 transition-colors duration-200">
                    {location.weatherData?.location?.city || location.name}
                  </h2>
                  <p className="text-xs text-white/70 mb-1 flex items-center gap-1">
                    {location.isCurrentLocation ? 'My Location' : location.country} • {location.weatherData?.current?.condition || 'Loading...'}
                  </p>
                  <p className="text-xs text-white/60">
                    H:{location.weatherData?.forecast?.[0]?.high || '--'}° L:{location.weatherData?.forecast?.[0]?.low || '--'}°
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-5xl font-extralight text-white transition-all duration-300 ${
                    activeLocationId === location.id ? 'animate-temperature-pulse' : 'group-hover:scale-105'
                  }`}>
                    {location.weatherData?.current?.temperature ? Math.round(location.weatherData.current.temperature) : '--'}°
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Location Button */}
          <button 
            onClick={() => setShowAddLocationModal(true)}
            className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 hover:bg-white/15 transition-all duration-300 cursor-pointer group flex items-center justify-center animate-fade-in hover:scale-105 hover:shadow-lg"
            style={{ animationDelay: `${savedLocations.length * 0.1 + 0.2}s` }}
          >
            <div className="text-white/60 group-hover:text-white/80 transition-all duration-200 group-hover:rotate-90">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        {/* Top Navigation */}
        <div className="flex justify-center mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <button className="bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
            <span className="group-hover:animate-bounce-gentle inline-block">🏠</span> HOME
          </button>
        </div>

        {/* Main Weather Display */}
        {currentWeatherData ? (
          <>
            <div className="text-center mb-10 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <h1 className="text-4xl font-light text-white mb-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                {currentWeatherData.location?.city || 'Unknown Location'}
              </h1>
              <div className="text-9xl font-extralight text-white mb-4 leading-none animate-scale-in hover:animate-temperature-pulse transition-all duration-300" style={{ animationDelay: '0.6s' }}>
                {Math.round(currentWeatherData.current?.temperature || 0)}°
              </div>
              <div className="flex items-center justify-center gap-3 mb-2 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                <AnimatedWeatherIcon 
                  condition={currentWeatherData.current?.condition || ''} 
                  size="lg" 
                />
                <p className="text-2xl text-white/80">
                  {currentWeatherData.current?.condition || 'Loading...'}
                </p>
              </div>
              <p className="text-lg text-white/60 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                H:{currentWeatherData.forecast?.[0]?.high || '--'}° L:{currentWeatherData.forecast?.[0]?.low || '--'}°
              </p>
            </div>

            {/* Weather Description */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 mb-10 text-center animate-fade-in hover:bg-white/15 transition-all duration-300 hover:scale-[1.01]" style={{ animationDelay: '0.9s' }}>
              <p className="text-white/80 text-base leading-relaxed">
                {currentWeatherData.current?.condition || 'Cloudy'} conditions will continue for the rest of the day. 
                Wind speed: {currentWeatherData.current?.windSpeed || 0} km/h, 
                Humidity: {currentWeatherData.current?.humidity || 0}%, 
                Pressure: {currentWeatherData.current?.pressure || 0} hPa.
              </p>
            </div>

            {/* Hourly Forecast */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 mb-10 animate-slide-up hover:bg-white/15 transition-all duration-300" style={{ animationDelay: '1s' }}>
              <div className="flex space-x-6 overflow-x-auto pb-2">
                {getHourlyForecast().map((hour, index) => (
                  <div key={index} className="flex flex-col items-center min-w-0 flex-shrink-0 animate-fade-in hover:scale-110 transition-all duration-200 cursor-pointer" style={{ animationDelay: `${1.1 + index * 0.05}s` }}>
                    <div className="text-xs text-white/60 mb-3">{hour.time}</div>
                    <AnimatedWeatherIcon condition={hour.icon} size="md" />
                    <div className="text-lg font-medium text-white mt-3">{hour.temp}°</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 10-Day Forecast */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 animate-slide-up hover:bg-white/15 transition-all duration-300 hover:scale-[1.01]" style={{ animationDelay: '1.4s' }}>
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <span className="animate-bounce-gentle">📅</span> 10-DAY FORECAST
                </h3>
                <WeatherForecast 
                  data={currentWeatherData.forecast}
                  loading={false}
                />
              </div>

              {/* Precipitation Map */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 animate-slide-up hover:bg-white/15 transition-all duration-300 hover:scale-[1.01]" style={{ animationDelay: '1.5s' }}>
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <span className="animate-float">🌧️</span> PRECIPITATION
                </h3>
                <div className="h-48 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative group">
                  {/* Animated precipitation pattern */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-shimmer" style={{ backgroundSize: '200px 100%' }}></div>
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-blue-300/10 to-transparent animate-pulse"></div>
                  
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center animate-float">
                    <div className="text-2xl mb-2 animate-bounce-gentle">📍</div>
                    <div className="bg-black/30 rounded-full px-3 py-1 text-lg font-semibold text-white mb-1 animate-pulse-glow">
                      {Math.round(currentWeatherData.current?.temperature || 0)}
                    </div>
                    <p className="text-xs text-white/80">
                      {currentLocation?.isCurrentLocation ? 'My Location' : currentWeatherData.location?.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Loading State */
          <div className="flex-1 flex items-center justify-center animate-fade-in">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="animate-spin h-16 w-16 border-4 border-white/20 border-t-white rounded-full mx-auto"></div>
                <div className="animate-ping absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/20"></div>
              </div>
              <p className="text-white/60 text-lg animate-pulse">Loading weather data...</p>
              <div className="flex justify-center gap-1 mt-4">
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={showAddLocationModal}
        onClose={() => setShowAddLocationModal(false)}
        onLocationAdd={handleAddLocation}
      />
    </div>
  )
}

export default App
import React from 'react'
import WeatherChart from './components/WeatherChart'
import CurrentWeather from './components/CurrentWeather'
import WeatherForecast from './components/WeatherForecast'
import WeatherAlerts from './components/WeatherAlerts'
import LocationSearch from './components/LocationSearch'
import { useWeatherData } from './hooks/useWeatherData'
import './App.css'
import './components/components.css'

function App() {
  const { data, loading, error, refetch, fetchWeatherByLocation, currentLocation } = useWeatherData();

  return (
    <div className="App">
      <header className="header">
        <h1>Live Weather Dashboard</h1>
        <p>Real-time weather data visualization</p>
        
        <LocationSearch 
          onLocationSelect={fetchWeatherByLocation}
          currentLocation={currentLocation}
        />
        
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={refetch} className="retry-button">
              Retry
            </button>
          </div>
        )}
      </header>
      
      <main className="main-content">
        <div className="current-weather-section">
          <CurrentWeather 
            data={data?.current}
            location={data?.location}
            loading={loading}
            lastUpdated={data?.lastUpdated}
          />
        </div>
        
        <div className="dashboard-grid">
          <div className="left-column">
            <section className="weather-section">
              <WeatherChart 
                title="Weather Analytics" 
                data={data?.hourly}
                loading={loading}
              />
            </section>
            
            <WeatherForecast 
              data={data?.forecast}
              loading={loading}
            />
          </div>
          
          <div className="right-column">
            <section className="insights-section">
              <div className="weather-insights">
                <h3>🌟 Weather Insights</h3>
                <div className="insights-grid">
                  <div className="insight-card">
                    <div className="insight-icon">🌡️</div>
                    <div className="insight-content">
                      <h4>Temperature Trend</h4>
                      <p>{data?.current?.temperature && data?.forecast?.[0] 
                        ? data.current.temperature > data.forecast[0].high 
                          ? "Above average for today" 
                          : "Within normal range"
                        : "Analyzing..."}</p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">💨</div>
                    <div className="insight-content">
                      <h4>Wind Conditions</h4>
                      <p>{data?.current?.windSpeed 
                        ? data.current.windSpeed > 25 
                          ? "Strong winds detected" 
                          : data.current.windSpeed > 15 
                          ? "Moderate breeze" 
                          : "Light winds"
                        : "Analyzing..."}</p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">💧</div>
                    <div className="insight-content">
                      <h4>Humidity Level</h4>
                      <p>{data?.current?.humidity 
                        ? data.current.humidity > 70 
                          ? "High humidity" 
                          : data.current.humidity > 40 
                          ? "Comfortable level" 
                          : "Low humidity"
                        : "Analyzing..."}</p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">📍</div>
                    <div className="insight-content">
                      <h4>Location</h4>
                      <p>{data?.location?.city ? `${data.location.city}, ${data.location.country}` : "Detecting..."}</p>
                      <small>{data?.location?.coordinates ? `${data.location.coordinates.lat.toFixed(4)}°, ${data.location.coordinates.lon.toFixed(4)}°` : ""}</small>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            <WeatherAlerts 
              currentWeather={data?.current}
              location={data?.location}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
import React from 'react'
import WeatherChart from './components/WeatherChart'
import WeatherMap from './components/WeatherMap'
import CurrentWeather from './components/CurrentWeather'
import { useWeatherData } from './hooks/useWeatherData'
import './App.css'
import './components/components.css'

function App() {
  const { data, loading, error, refetch } = useWeatherData();

  return (
    <div className="App">
      <header className="header">
        <h1>Live Weather Dashboard</h1>
        <p>Real-time weather data visualization</p>
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
          <section className="weather-section">
            <WeatherChart 
              title="Weather Analytics" 
              data={data?.hourly}
              loading={loading}
            />
          </section>
          
          <section className="map-section">
            <WeatherMap 
              title="Live Weather Map"
              location={data?.location}
              loading={loading}
            />
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
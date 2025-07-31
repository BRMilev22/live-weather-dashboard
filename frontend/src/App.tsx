import React from 'react'
import WeatherChart from './components/WeatherChart'
import WeatherMap from './components/WeatherMap'
import './App.css'
import './components/components.css'

function App() {
  return (
    <div className="App">
      <header className="header">
        <h1>Live Weather Dashboard</h1>
        <p>Real-time weather data visualization</p>
      </header>
      
      <main className="main-content">
        <div className="dashboard-grid">
          <section className="weather-section">
            <WeatherChart title="Weather Analytics" />
          </section>
          
          <section className="map-section">
            <WeatherMap title="Live Weather Map" />
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
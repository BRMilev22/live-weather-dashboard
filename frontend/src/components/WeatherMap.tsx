import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { WeatherLocation } from '../types/weather';

// Note: In production, this should be in environment variables
mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

interface WeatherMapProps {
  title?: string;
  location?: WeatherLocation;
  loading?: boolean;
}

const WeatherMap: React.FC<WeatherMapProps> = ({ 
  title = "Live Weather Map", 
  location,
  loading = false 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-122.4194, 37.7749], // Default to San Francisco
        zoom: 10,
        attributionControl: false,
        logoPosition: 'bottom-left'
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        
        // Add weather layer effect
        if (map.current) {
          map.current.addSource('weather-overlay', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            }
          });

          // Add a subtle glow effect around the location
          map.current.addLayer({
            id: 'weather-glow',
            type: 'circle',
            source: 'weather-overlay',
            paint: {
              'circle-radius': 50,
              'circle-color': 'rgba(79, 172, 254, 0.3)',
              'circle-blur': 1,
              'circle-opacity': 0.6
            }
          });
        }
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Custom map styling for weather theme
      map.current.on('styledata', () => {
        if (map.current && map.current.isStyleLoaded()) {
          // Add custom styling for weather visualization
          map.current.setPaintProperty('water', 'fill-color', '#1a365d');
          map.current.setPaintProperty('land', 'background-color', '#0f172a');
        }
      });

    } catch (error) {
      console.error('Failed to initialize map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !location || !mapLoaded) return;

    const { lat, lon } = location.coordinates;

    // Update map center
    map.current.flyTo({
      center: [lon, lat],
      zoom: 12,
      duration: 2000,
      essential: true
    });

    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Create custom marker element
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.innerHTML = `
      <div class="marker-pulse"></div>
      <div class="marker-icon">📍</div>
    `;

    // Add custom marker
    marker.current = new mapboxgl.Marker(markerElement)
      .setLngLat([lon, lat])
      .addTo(map.current);

    // Add popup with weather info
    const popup = new mapboxgl.Popup({ offset: 25, className: 'weather-popup' })
      .setHTML(`
        <div class="popup-content">
          <h4>${location.city}, ${location.country}</h4>
          <p>Weather data available</p>
          <div class="popup-coords">
            ${lat.toFixed(4)}°, ${lon.toFixed(4)}°
          </div>
        </div>
      `);

    marker.current.setPopup(popup);

    // Update weather overlay
    if (map.current.getSource('weather-overlay')) {
      (map.current.getSource('weather-overlay') as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lon, lat]
          },
          properties: {}
        }]
      });
    }

  }, [location, mapLoaded]);

  if (loading) {
    return (
      <div className="weather-map">
        <h3>{title}</h3>
        <div className="map-container">
          <div className="loading-skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-map">
      <h3>{title}</h3>
      <div className="map-container">
        <div 
          ref={mapContainer} 
          className="mapbox-container"
          style={{ width: '100%', height: '100%' }}
        />
        {!mapLoaded && (
          <div className="map-loading-overlay">
            <div className="map-loading-spinner"></div>
            <p>Loading interactive map...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherMap;
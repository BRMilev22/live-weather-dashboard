import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { WeatherLocation } from '../types/weather';

// Use a public demo token that works without signup
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
  const [mapError, setMapError] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add timeout effect for map loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!mapLoaded) {
        console.log('⏱️ Map loading timeout after 5 seconds, showing fallback');
        console.log('🗺️ Map container exists:', !!mapContainer.current);
        console.log('🌐 Mapbox token set:', !!mapboxgl.accessToken);
        console.log('📡 Network connectivity check needed');
        setLoadingTimeout(true);
        setMapError(true);
      }
    }, 5000); // Extended to 5 second timeout

    return () => clearTimeout(timeout);
  }, [mapLoaded]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    console.log('🚀 Initializing Mapbox GL map...');
    console.log('📍 Default center coordinates:', location ? [location.coordinates.lon, location.coordinates.lat] : [27.19, 42.34]);

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11', // Use a more reliable style
        center: location ? [location.coordinates.lon, location.coordinates.lat] : [27.19, 42.34], // Use user's actual coordinates as default
        zoom: 10,
        attributionControl: false,
        logoPosition: 'bottom-left',
        maxBounds: [[-180, -85], [180, 85]], // Limit map bounds
        failIfMajorPerformanceCaveat: false // Don't fail on slower devices
      });

      map.current.on('load', () => {
        console.log('✅ Map loaded successfully');
        setMapLoaded(true);
        
        // Add weather layer effect
        if (map.current) {
          try {
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
          } catch (error) {
            console.warn('Failed to add map layers:', error);
          }
        }
      });

      // Add comprehensive error event handlers
      map.current.on('error', (e) => {
        console.error('❌ Map error:', e);
        console.error('❌ Error details:', {
          error: e.error,
          target: e.target,
          type: e.type
        });
        setMapError(true);
        setMapLoaded(true);
      });

      map.current.on('sourcedataloading', (e) => {
        console.log('🔄 Map source loading:', e.sourceId);
      });

      map.current.on('sourcedata', (e) => {
        if (e.sourceId && e.isSourceLoaded) {
          console.log('✅ Map source loaded:', e.sourceId);
        }
      });

      map.current.on('styledata', (e) => {
        console.log('🎨 Map style loaded');
        if (e.style) {
          console.log('📦 Style type:', e.style.name || 'Unknown');
        }
      });

      // Add additional error handling for network issues
      map.current.on('dataloading', (e) => {
        console.log('🌐 Map data loading:', e.type);
      });

      map.current.on('idle', () => {
        console.log('😴 Map is idle (finished loading all tiles)');
        if (!mapLoaded) {
          setMapLoaded(true);
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
      console.error('❌ Failed to initialize map:', error);
      console.error('🔍 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      console.error('🌐 Mapbox token status:', {
        hasToken: !!mapboxgl.accessToken,
        tokenStart: mapboxgl.accessToken ? mapboxgl.accessToken.substring(0, 10) + '...' : 'none'
      });
      setMapError(true);
      setMapLoaded(true); // Stop loading state
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

  // Show fallback if map fails to load
  if (mapError || loadingTimeout) {
    return (
      <div className="weather-map">
        <h3>{title}</h3>
        <div className="map-container">
          <div className="map-fallback">
            <div className="map-fallback-content">
              <div className="map-fallback-icon">🗺️</div>
              <h4>Location Information</h4>
              {location && (
                <div className="location-details">
                  <p><strong>{location.city}, {location.country}</strong></p>
                  <p className="coordinates">
                    📍 {location.coordinates.lat.toFixed(4)}°N, {location.coordinates.lon.toFixed(4)}°E
                  </p>
                  <div className="location-info">
                    <span>🌊 Black Sea Region</span>
                    <span>🇧🇬 Bulgaria</span>
                    <span>🌡️ Live Weather Data</span>
                  </div>
                </div>
              )}
              <p className="fallback-note">
                {loadingTimeout 
                  ? '⏱️ Map loading timeout (5s) - showing location details instead' 
                  : '🔧 Interactive map temporarily unavailable - check console for details'}
              </p>
              <div className="fallback-actions">
                <button 
                  onClick={() => window.location.reload()} 
                  className="retry-button"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgba(79, 172, 254, 0.2)',
                    border: '1px solid rgba(79, 172, 254, 0.4)',
                    borderRadius: '6px',
                    color: '#4FACFE',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginTop: '12px'
                  }}
                >
                  🔄 Retry Loading
                </button>
              </div>
            </div>
          </div>
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
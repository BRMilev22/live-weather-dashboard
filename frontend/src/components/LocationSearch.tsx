import React, { useState, useRef, useEffect } from 'react';
import { LocationResult, locationApi } from '../services/locationApi';
import { useGeolocation } from '../hooks/useGeolocation';

interface LocationSearchProps {
  onLocationSelect: (lat: number, lon: number) => void;
  currentLocation?: { lat: number; lon: number } | null;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  currentLocation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const { 
    location: geoLocation, 
    loading: geoLoading, 
    error: geoError, 
    getCurrentPosition,
    supported: geoSupported 
  } = useGeolocation();

  const debounceTimeout = useRef<NodeJS.Timeout>();

  // Auto-fetch weather for user's location when geolocation is available
  useEffect(() => {
    if (geoLocation) {
      // Always use geolocation when available, don't check currentLocation
      console.log('🌍 Using geolocation:', geoLocation.latitude, geoLocation.longitude);
      onLocationSelect(geoLocation.latitude, geoLocation.longitude);
    }
  }, [geoLocation, onLocationSelect]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const results = await locationApi.searchLocations(query);
      setSearchResults(results);
      setShowResults(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = (query: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleLocationSelect = (location: LocationResult) => {
    onLocationSelect(location.lat, location.lon);
    setSearchQuery(`${location.name}, ${location.country}`);
    setShowResults(false);
    setSelectedIndex(-1);
  };

  const handleCurrentLocation = () => {
    if (geoSupported) {
      getCurrentPosition();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          handleLocationSelect(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const popularLocations = locationApi.getPopularLocations();

  return (
    <div className="location-search">
      <div className="search-container">
        <div className="search-input-group">
          <div className="search-icon">🔍</div>
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchResults.length > 0) setShowResults(true);
            }}
            placeholder="Search for a city..."
            className="search-input"
          />
          {loading && (
            <div className="search-loading">
              <div className="spinner"></div>
            </div>
          )}
        </div>

        {geoSupported && (
          <button
            onClick={handleCurrentLocation}
            disabled={geoLoading}
            className={`location-button ${geoLoading ? 'loading' : ''}`}
            title="Use current location"
          >
            {geoLoading ? (
              <div className="button-spinner"></div>
            ) : (
              <>
                📍
                <span>Current Location</span>
              </>
            )}
          </button>
        )}
      </div>

      {geoError && (
        <div className="geo-error">
          <span>⚠️ {geoError}</span>
        </div>
      )}

      {showResults && (
        <div ref={resultsRef} className="search-results">
          {searchResults.length > 0 ? (
            searchResults.map((location, index) => (
              <div
                key={`${location.lat}-${location.lon}`}
                onClick={() => handleLocationSelect(location)}
                className={`search-result-item ${
                  index === selectedIndex ? 'selected' : ''
                }`}
              >
                <div className="location-info">
                  <div className="location-name">
                    {location.name}
                    {location.state && `, ${location.state}`}
                  </div>
                  <div className="location-country">{location.country}</div>
                </div>
                <div className="location-coords">
                  {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🌍</div>
              <p>No locations found</p>
            </div>
          )}
        </div>
      )}

      {!showResults && !searchQuery && (
        <div className="popular-locations">
          <h4>Popular Locations</h4>
          <div className="popular-grid">
            {popularLocations.slice(0, 6).map((location) => (
              <button
                key={`${location.lat}-${location.lon}`}
                onClick={() => handleLocationSelect(location)}
                className="popular-location-item"
              >
                <span className="location-name">{location.name}</span>
                <span className="location-country">{location.country}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
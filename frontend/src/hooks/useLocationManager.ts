import { useState, useEffect, useCallback } from 'react';
import { WeatherData } from '../types/weather';
import { weatherApi } from '../services/weatherApi';

export interface SavedLocation {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  isCurrentLocation?: boolean;
  weatherData?: WeatherData;
  lastUpdated?: string;
}

export const useLocationManager = () => {
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load saved locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedWeatherLocations');
    if (saved) {
      try {
        const locations = JSON.parse(saved);
        setSavedLocations(locations);
        if (locations.length > 0 && !activeLocationId) {
          setActiveLocationId(locations[0].id);
        }
      } catch (error) {
        console.error('Failed to load saved locations:', error);
      }
    }
    setLoading(false);
  }, [activeLocationId]);

  // Save locations to localStorage
  const saveToStorage = useCallback((locations: SavedLocation[]) => {
    localStorage.setItem('savedWeatherLocations', JSON.stringify(locations));
  }, []);

  // Add a new location
  const addLocation = useCallback(async (name: string, country: string, lat: number, lon: number, isCurrentLocation = false) => {
    const id = `${lat}-${lon}`;
    
    // Check if location already exists
    if (savedLocations.some(loc => loc.id === id)) {
      setActiveLocationId(id);
      return id;
    }

    const newLocation: SavedLocation = {
      id,
      name,
      country,
      lat,
      lon,
      isCurrentLocation
    };

    try {
      // Fetch weather data for the new location
      const weatherData = await weatherApi.fetchWeatherByLocation(lat, lon);
      newLocation.weatherData = weatherData;
      newLocation.lastUpdated = new Date().toISOString();
    } catch (error) {
      console.error('Failed to fetch weather for new location:', error);
    }

    const updatedLocations = [...savedLocations, newLocation];
    setSavedLocations(updatedLocations);
    saveToStorage(updatedLocations);
    setActiveLocationId(id);
    
    return id;
  }, [savedLocations, saveToStorage]);

  // Remove a location
  const removeLocation = useCallback((locationId: string) => {
    const updatedLocations = savedLocations.filter(loc => loc.id !== locationId);
    setSavedLocations(updatedLocations);
    saveToStorage(updatedLocations);
    
    if (activeLocationId === locationId && updatedLocations.length > 0) {
      setActiveLocationId(updatedLocations[0].id);
    }
  }, [savedLocations, activeLocationId, saveToStorage]);

  // Update weather data for a specific location
  const updateLocationWeather = useCallback(async (locationId: string) => {
    const location = savedLocations.find(loc => loc.id === locationId);
    if (!location) return;

    try {
      const weatherData = await weatherApi.fetchWeatherByLocation(location.lat, location.lon);
      const updatedLocations = savedLocations.map(loc => 
        loc.id === locationId 
          ? { ...loc, weatherData, lastUpdated: new Date().toISOString() }
          : loc
      );
      setSavedLocations(updatedLocations);
      saveToStorage(updatedLocations);
    } catch (error) {
      console.error(`Failed to update weather for ${location.name}:`, error);
    }
  }, [savedLocations, saveToStorage]);

  // Update weather data for all locations
  const updateAllLocationsWeather = useCallback(async () => {
    const updatePromises = savedLocations.map(location => 
      updateLocationWeather(location.id)
    );
    await Promise.all(updatePromises);
  }, [savedLocations, updateLocationWeather]);

  // Get active location
  const activeLocation = savedLocations.find(loc => loc.id === activeLocationId);

  // Get current location (marked as isCurrentLocation: true)
  const currentLocation = savedLocations.find(loc => loc.isCurrentLocation);

  return {
    savedLocations,
    activeLocationId,
    activeLocation,
    currentLocation,
    loading,
    addLocation,
    removeLocation,
    setActiveLocationId,
    updateLocationWeather,
    updateAllLocationsWeather
  };
};
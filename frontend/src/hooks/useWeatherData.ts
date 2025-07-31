import { useState, useEffect, useCallback } from 'react';
import { WeatherData, ApiResponse } from '../types/weather';
import { weatherApi } from '../services/weatherApi';

export const useWeatherData = (refreshInterval: number = 300000) => { // 5 minutes default
  const [state, setState] = useState<ApiResponse<WeatherData>>({
    data: undefined,
    error: undefined,
    loading: true
  });
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);

  const fetchWeatherData = useCallback(async (lat?: number, lon?: number) => {
    setState(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      console.log('🌤️ Fetching weather data:', { lat, lon });
      const data = lat && lon 
        ? await weatherApi.fetchWeatherByLocation(lat, lon)
        : await weatherApi.fetchWeatherData();
      console.log('📊 Weather data received:', data.location);
      setState({
        data,
        error: undefined,
        loading: false
      });
    } catch (error) {
      console.error('❌ Weather fetch failed:', error);
      setState({
        data: undefined,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        loading: false
      });
    }
  }, []);

  const fetchWeatherByLocation = useCallback(async (lat: number, lon: number) => {
    setCurrentLocation({ lat, lon });
    await fetchWeatherData(lat, lon);
  }, [fetchWeatherData]);

  const refetch = useCallback(() => {
    if (currentLocation) {
      fetchWeatherData(currentLocation.lat, currentLocation.lon);
    } else {
      fetchWeatherData();
    }
  }, [fetchWeatherData, currentLocation]);

  useEffect(() => {
    // Force initial fetch on component mount
    console.log('🚀 Initial weather data fetch on mount');
    fetchWeatherData();
  }, [fetchWeatherData]);

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        if (currentLocation) {
          fetchWeatherData(currentLocation.lat, currentLocation.lon);
        } else {
          fetchWeatherData();
        }
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchWeatherData, refreshInterval, currentLocation]);

  return {
    ...state,
    refetch,
    fetchWeatherByLocation,
    currentLocation
  };
};
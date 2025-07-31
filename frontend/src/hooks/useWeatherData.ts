import { useState, useEffect, useCallback } from 'react';
import { WeatherData, ApiResponse } from '../types/weather';
import { weatherApi } from '../services/weatherApi';

export const useWeatherData = (refreshInterval: number = 300000) => { // 5 minutes default
  const [state, setState] = useState<ApiResponse<WeatherData>>({
    data: undefined,
    error: undefined,
    loading: true
  });

  const fetchWeatherData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      const data = await weatherApi.fetchWeatherData();
      setState({
        data,
        error: undefined,
        loading: false
      });
    } catch (error) {
      setState({
        data: undefined,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        loading: false
      });
    }
  }, []);

  const fetchWeatherByLocation = useCallback(async (lat: number, lon: number) => {
    setState(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      const data = await weatherApi.fetchWeatherByLocation(lat, lon);
      setState({
        data,
        error: undefined,
        loading: false
      });
    } catch (error) {
      setState({
        data: undefined,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        loading: false
      });
    }
  }, []);

  const refetch = useCallback(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchWeatherData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchWeatherData, refreshInterval]);

  return {
    ...state,
    refetch,
    fetchWeatherByLocation
  };
};
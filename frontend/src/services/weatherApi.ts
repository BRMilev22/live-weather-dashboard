import { WeatherData } from '../types/weather';

class WeatherApiService {
  private baseUrl = '/api';

  async fetchWeatherData(): Promise<WeatherData> {
    try {
      const response = await fetch(`${this.baseUrl}/weather`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      throw new Error('Failed to fetch weather data. Please try again.');
    }
  }

  async fetchWeatherByLocation(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await fetch(`${this.baseUrl}/weather?lat=${lat}&lon=${lon}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch weather data by location:', error);
      throw new Error('Failed to fetch weather data for this location. Please try again.');
    }
  }

  async checkApiHealth(): Promise<{ status: string; message: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Failed to check API health:', error);
      throw new Error('API health check failed');
    }
  }
}

export const weatherApi = new WeatherApiService();
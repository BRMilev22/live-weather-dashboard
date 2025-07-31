export interface LocationResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export interface LocationSearchResponse {
  locations?: LocationResult[];
  suggestions?: LocationResult[];
  error?: string;
}

class LocationApiService {
  private baseUrl = '/api';

  async searchLocations(query: string): Promise<LocationResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search-location?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: LocationSearchResponse = await response.json();
      
      // Handle both real API response and fallback suggestions
      return data.locations || data.suggestions || [];
    } catch (error) {
      console.error('Failed to search locations:', error);
      throw new Error('Failed to search locations. Please try again.');
    }
  }

  async reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
      // For now, we'll use a simple approach
      // In a real implementation, you might want a dedicated reverse geocoding endpoint
      const response = await fetch(`${this.baseUrl}/weather?lat=${lat}&lon=${lon}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return `${data.location.city}, ${data.location.country}`;
    } catch (error) {
      console.error('Failed to reverse geocode:', error);
      return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    }
  }

  // Popular locations for quick access
  getPopularLocations(): LocationResult[] {
    return [
      { name: 'Sredets', country: 'BG', lat: 42.6500, lon: 25.3167 },
      { name: 'Sofia', country: 'BG', lat: 42.6977, lon: 23.3219 },
      { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
      { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
      { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060 },
      { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
      { name: 'Berlin', country: 'DE', lat: 52.5200, lon: 13.4050 },
      { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093 }
    ];
  }
}

export const locationApi = new LocationApiService();
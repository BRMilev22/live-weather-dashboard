export interface WeatherLocation {
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  condition: string;
  icon: string;
}

export interface WeatherForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
}

export interface HourlyWeather {
  hour: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

export interface WeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
  forecast: WeatherForecast[];
  hourly: HourlyWeather[];
  lastUpdated: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}
import * as Location from 'expo-location';

const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/3.0';
const GEO_BASE_URL = 'http://api.openweathermap.org/geo/1.0';

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  windGust: number | null;
  feelsLike: number;
  visibility: number;
  pressure: number;
  uvi: number;
  timezone: string;
}

export interface WeatherAlert {
  event: string;
  description: string;
  start: number;
  end: number;
  senderName: string;
}

export const weatherService = {
  async getCurrentLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    const location = await Location.getCurrentPositionAsync({});
    
    return location;
  },

  async getLocationName(lat: number, lon: number): Promise<string> {
    try {
      const response = await fetch(
        `${GEO_BASE_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${WEATHER_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Location name fetch failed');
      }

      const data = await response.json();
      
      if (!data.length) {
        throw new Error('No location found');
      }

      // Get the city name and local name if available
      const location = data[0];
      const localName = location.local_names?.en || location.name;

      return localName;
    } catch (error) {
      console.error('Error getting location name:', error);
      // Fallback to coordinates if location name fetch fails
      return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
    }
  },

  async getWeatherByCoords(lat: number, lon: number): Promise<{
    weather: WeatherData;
    alerts?: WeatherAlert[];
  }> {
    const [weatherResponse, locationName] = await Promise.all([
      fetch(
        `${WEATHER_BASE_URL}/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
      ),
      this.getLocationName(lat, lon)
    ]);

    if (!weatherResponse.ok) {
      throw new Error('Weather data fetch failed');
    }

    const data = await weatherResponse.json();
    
    const weather: WeatherData = {
      location: locationName,
      temperature: Math.round(data.current.temp),
      condition: data.current.weather[0].main,
      icon: data.current.weather[0].icon,
      humidity: data.current.humidity,
      windSpeed: data.current.wind_speed,
      windGust: data.current.wind_gust || null,
      feelsLike: Math.round(data.current.feels_like),
      visibility: data.current.visibility,
      pressure: data.current.pressure,
      uvi: data.current.uvi,
      timezone: data.timezone,
    };

    const alerts = data.alerts?.map((alert: any) => ({
      event: alert.event,
      description: alert.description,
      start: alert.start,
      end: alert.end,
      senderName: alert.sender_name,
    }));

    return {
      weather,
      alerts,
    };
  },

  async getWeatherByCity(city: string) {
    try {
      const geoResponse = await fetch(
        `${GEO_BASE_URL}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${WEATHER_API_KEY}`
      );

      if (!geoResponse.ok) {
        throw new Error('City lookup failed');
      }

      const geoData = await geoResponse.json();
      
      if (!geoData.length) {
        throw new Error('City not found');
      }

      const { lat, lon } = geoData[0];
      return this.getWeatherByCoords(lat, lon);
    } catch (error) {
      console.error('Error in getWeatherByCity:', error);
      throw new Error('Failed to get weather for city');
    }
  }
}; 
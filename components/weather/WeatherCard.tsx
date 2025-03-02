import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { WeatherData, weatherService, WeatherAlert } from '@/services/weather/weatherService';
import { ThemedText } from '@/components/ThemedText';

interface WeatherCardProps {
  isDark?: boolean;
}

export function WeatherCard({ isDark }: WeatherCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isCelsius, setIsCelsius] = useState(true);

  const convertTemp = (celsius: number) => {
    if (isCelsius) return celsius;
    return Math.round((celsius * 9/5) + 32);
  };

  const getUnitSymbol = () => isCelsius ? '°C' : '°F';

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      const location = await weatherService.getCurrentLocation();
      const { weather, alerts } = await weatherService.getWeatherByCoords(
        location.coords.latitude,
        location.coords.longitude
      );
      setWeather(weather);
      setAlerts(alerts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.card, isDark && styles.cardDark]}>
        <ActivityIndicator size="large" color={isDark ? '#60A5FA' : '#2563EB'} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.card, isDark && styles.cardDark]}>
        <ThemedText style={styles.error}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={fetchWeather}>
          <ThemedText style={styles.retryText}>Retry</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  if (!weather) return null;

  return (
    <TouchableOpacity 
      style={[styles.card, isDark && styles.cardDark]}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <MaterialIcons 
            name="location-on" 
            size={20} 
            color={isDark ? '#9CA3AF' : '#6B7280'} 
          />
          <ThemedText style={styles.location}>{weather.location}</ThemedText>
        </View>
        <View style={styles.headerButtons}>
          <Pressable 
            style={styles.unitToggle}
            onPress={() => setIsCelsius(!isCelsius)}
          >
            <ThemedText style={styles.unitToggleText}>
              {isCelsius ? '°F' : '°C'}
            </ThemedText>
          </Pressable>
          <TouchableOpacity onPress={fetchWeather}>
            <MaterialIcons 
              name="refresh" 
              size={20} 
              color={isDark ? '#9CA3AF' : '#6B7280'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainInfo}>
        <ThemedText style={styles.temperature}>
          {convertTemp(weather.temperature)}{getUnitSymbol()}
        </ThemedText>
        <ThemedText style={styles.condition}>
          {weather.condition}
        </ThemedText>
      </View>

      {expanded && (
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Feels like</ThemedText>
            <ThemedText style={styles.detailValue}>
              {convertTemp(weather.feelsLike)}{getUnitSymbol()}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Humidity</ThemedText>
            <ThemedText style={styles.detailValue}>{weather.humidity}%</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Wind</ThemedText>
            <ThemedText style={styles.detailValue}>
              {weather.windSpeed} m/s
              {weather.windGust && ` (gusts ${weather.windGust} m/s)`}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>UV Index</ThemedText>
            <ThemedText style={styles.detailValue}>{weather.uvi.toFixed(1)}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Visibility</ThemedText>
            <ThemedText style={styles.detailValue}>{(weather.visibility / 1000).toFixed(1)} km</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Pressure</ThemedText>
            <ThemedText style={styles.detailValue}>{weather.pressure} hPa</ThemedText>
          </View>
        </View>
      )}

      {alerts && alerts.length > 0 && (
        <View style={[styles.alerts, expanded && styles.alertsExpanded]}>
          <MaterialIcons name="warning" size={20} color="#EF4444" />
          <ThemedText style={styles.alertText}>
            {alerts[0].event}
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    minHeight: 120,
    justifyContent: 'center',
  },
  cardDark: {
    backgroundColor: '#374151',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 16,
    fontWeight: '500',
  },
  mainInfo: {
    alignItems: 'center',
    gap: 4,
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  condition: {
    fontSize: 18,
  },
  details: {
    marginTop: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  error: {
    textAlign: 'center',
    color: '#EF4444',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryText: {
    color: 'white',
    fontWeight: '500',
  },
  alerts: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  alertsExpanded: {
    marginTop: 16,
  },
  alertText: {
    color: '#B91C1C',
    flex: 1,
    fontSize: 14,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  unitToggle: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unitToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
}); 
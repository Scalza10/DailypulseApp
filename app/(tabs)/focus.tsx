import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, useColorScheme, AppState, Platform, AppStateStatus } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function FocusScreen() {
  const params = useLocalSearchParams<{ 
    taskId: string;
    taskTitle: string;
    taskDescription: string;
  }>();

  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1 * 60); // Change back to 25 minutes
  const isDark = useColorScheme() === 'dark';
  const timerRef = useRef<NodeJS.Timeout>();
  const appState = useRef(AppState.currentState);
  const endTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    requestNotificationPermission();
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Check and update timer every time app comes to foreground
    if (isRunning && endTimeRef.current) {
      const now = new Date();
      const remaining = Math.max(0, Math.floor((endTimeRef.current.getTime() - now.getTime()) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        setIsRunning(false);
        endTimeRef.current = null;
      }
    }

    return () => {
      subscription.remove();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'ios') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Please enable notifications to get timer alerts!');
      }
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
      // App is going to background
      if (isRunning) {
        // Store the exact time when timer should end
        const now = new Date();
        endTimeRef.current = new Date(now.getTime() + timeLeft * 1000);
        
        // Clear the interval as it won't run in background
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App is coming to foreground
      if (isRunning && endTimeRef.current) {
        const now = new Date();
        const remaining = Math.max(0, Math.floor((endTimeRef.current.getTime() - now.getTime()) / 1000));
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          setIsRunning(false);
          endTimeRef.current = null;
        } else {
          // Restart the interval
          startInterval();
        }
      }
    }
    appState.current = nextAppState;
  };

  const scheduleNotification = async () => {
    // Cancel any existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time's up!",
        body: params.taskTitle ? `Finished focusing on: ${params.taskTitle}` : "Pomodoro session complete!",
        sound: true,
      },
      trigger: {
        seconds: timeLeft,
      },
    });
  };

  const startInterval = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(intervalId);
          setIsRunning(false);
          endTimeRef.current = null;
          Notifications.presentNotificationAsync({
            title: "Time's up!",
            body: params.taskTitle ? `Finished focusing on: ${params.taskTitle}` : "Pomodoro session complete!",
            sound: true,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = intervalId;
  };

  const startTimer = () => {
    setIsRunning(true);
    const now = new Date();
    endTimeRef.current = new Date(now.getTime() + timeLeft * 1000);
    startInterval();
  };

  const pauseTimer = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
    Notifications.cancelAllScheduledNotificationsAsync();
  };

  const resetTimer = () => {
    pauseTimer();
    setTimeLeft(1 * 60);
    endTimeRef.current = null;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const adjustTime = (minutes: number) => {
    if (!isRunning) {
      setTimeLeft(prev => Math.max(60, Math.min(3600, prev + minutes * 60)));
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {params.taskId && (
        <View style={[styles.taskCard, isDark && styles.taskCardDark]}>
          <ThemedText style={[styles.taskTitle, isDark && styles.taskTitleDark]}>
            {params.taskTitle}
          </ThemedText>
          {params.taskDescription && (
            <ThemedText style={[styles.taskDescription, isDark && styles.taskDescriptionDark]}>
              {params.taskDescription}
            </ThemedText>
          )}
        </View>
      )}

      <View style={styles.timerSection}>
        <View style={styles.timerControls}>
          {!isRunning && (
            <TouchableOpacity
              style={[styles.timeAdjustButton, isDark && styles.timeAdjustButtonDark]}
              onPress={() => adjustTime(-1)}>
              <MaterialIcons name="remove" size={24} color="#9333EA" />
            </TouchableOpacity>
          )}
          
          <ThemedText style={[styles.timer, isDark && styles.timerDark]}>
            {formatTime(timeLeft)}
          </ThemedText>

          {!isRunning && (
            <TouchableOpacity
              style={[styles.timeAdjustButton, isDark && styles.timeAdjustButtonDark]}
              onPress={() => adjustTime(1)}>
              <MaterialIcons name="add" size={24} color="#9333EA" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isDark && styles.controlButtonDark]}
            onPress={resetTimer}>
            <MaterialIcons name="refresh" size={24} color="#9333EA" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.startButton}
            onPress={isRunning ? pauseTimer : startTimer}>
            <MaterialIcons
              name={isRunning ? 'pause' : 'play-arrow'}
              size={32}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#1F2937',
  },
  taskCard: {
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 20,
  },
  taskCardDark: {
    backgroundColor: '#374151',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  taskTitleDark: {
    color: '#F9FAFB',
  },
  taskDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  taskDescriptionDark: {
    color: '#9CA3AF',
  },
  timerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 48,
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  timer: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  timerDark: {
    color: '#F9FAFB',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDark: {
    backgroundColor: '#374151',
  },
  startButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeAdjustButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeAdjustButtonDark: {
    backgroundColor: '#374151',
  },
}); 
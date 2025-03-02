import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, Alert, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { ThemedText } from '@/components/ThemedText';
import { TaskSummary } from '@/components/tasks/TaskSummary';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types/database';
import { WeatherCard } from '@/components/weather/WeatherCard';

export default function DashboardScreen() {
  const { session, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.header, styles.section]}>
        <ThemedText style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
          Dashboard
        </ThemedText>
      </View>

      <View style={styles.section}>
        <WeatherCard isDark={isDark} />
      </View>

      <View style={styles.section}>
        <TaskSummary tasks={tasks} />
      </View>

      <View style={[styles.section, styles.card, isDark && styles.cardDark]}>
        <ThemedText style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
          Stocks
        </ThemedText>
        <ThemedText style={[styles.cardText, isDark && styles.cardTextDark]}>
          Stock information coming soon...
        </ThemedText>
      </View>

      <TouchableOpacity 
        style={styles.signOutButton} 
        onPress={handleSignOut}
      >
        <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
      </TouchableOpacity>
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
  section: {
    marginBottom: 24,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerTitleDark: {
    color: '#F9FAFB',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  cardDark: {
    backgroundColor: '#374151',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardTitleDark: {
    color: '#F9FAFB',
  },
  cardText: {
    fontSize: 16,
    color: '#6B7280',
  },
  cardTextDark: {
    color: '#9CA3AF',
  },
  signOutButton: {
    marginTop: 'auto',
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

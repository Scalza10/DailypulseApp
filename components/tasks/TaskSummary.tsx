import { View, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Task } from '@/types/database';

interface TaskSummaryProps {
  tasks: Task[];
}

export function TaskSummary({ tasks }: TaskSummaryProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Filter and sort active tasks
  const activeTasks = tasks
    .filter((task) => task.status === 'pending' || task.status === 'in_progress')
    .sort((a, b) => {
      // First sort by status (in_progress first)
      if (a.status === 'in_progress' && b.status === 'pending') return -1;
      if (a.status === 'pending' && b.status === 'in_progress') return 1;
      
      // Then sort by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 3);

  const getStatusColor = (status: Task['status']): string => {
    return status === 'in_progress' ? '#3B82F6' : '#9CA3AF';
  };

  const getStatusIcon = (status: Task['status']): keyof typeof MaterialIcons.glyphMap => {
    return status === 'in_progress' ? 'play-circle-outline' : 'radio-button-unchecked';
  };

  if (activeTasks.length === 0) {
    return (
      <View style={[styles.card, isDark && styles.cardDark]}>
        <ThemedText style={[styles.cardTitle, isDark && styles.cardTitleDark]}>Tasks</ThemedText>
        <ThemedText style={[styles.emptyText, isDark && styles.emptyTextDark]}>
          No active tasks
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <View style={styles.header}>
        <ThemedText style={[styles.cardTitle, isDark && styles.cardTitleDark]}>Tasks</ThemedText>
        <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
          <ThemedText style={styles.viewAll}>View All</ThemedText>
        </TouchableOpacity>
      </View>

      {activeTasks.map((task) => (
        <TouchableOpacity 
          key={task.id} 
          style={[styles.taskItem, isDark && styles.taskItemDark]}
          onPress={() => router.push('/(tabs)/tasks')}
        >
          <MaterialIcons
            name={getStatusIcon(task.status)}
            size={20}
            color={getStatusColor(task.status)}
          />
          <View style={styles.taskContent}>
            <ThemedText 
              style={[styles.taskTitle, isDark && styles.taskTitleDark]} 
              numberOfLines={1}
            >
              {task.title}
            </ThemedText>
            {task.due_date && (
              <ThemedText style={[styles.taskDueDate, isDark && styles.taskDueDateDark]}>
                Due: {new Date(task.due_date).toLocaleDateString()}
              </ThemedText>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  cardDark: {
    backgroundColor: '#374151',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardTitleDark: {
    color: '#F9FAFB',
  },
  viewAll: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    gap: 12,
  },
  taskItemDark: {
    backgroundColor: '#1F2937',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  taskTitleDark: {
    color: '#F9FAFB',
  },
  taskDueDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  taskDueDateDark: {
    color: '#9CA3AF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 8,
  },
  emptyTextDark: {
    color: '#9CA3AF',
  },
}); 
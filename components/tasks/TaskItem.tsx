import { View, TouchableOpacity, StyleSheet, Animated, useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Task } from '@/types/database';
import { ThemedText } from '@/components/ThemedText';
import { getStatusIcon, getStatusColor, getNextStatus } from '@/utils/taskUtils';

interface TaskItemProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: Task['status']) => Promise<void>;
  onSelect: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskItem({ task, onStatusChange, onSelect, onDelete }: TaskItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightActions}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(task.id)}>
            <MaterialIcons name="delete" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={[styles.taskItem, isDark && styles.taskItemDark]}>
        <TouchableOpacity
          style={styles.statusButton}
          onPress={() => {
            const nextStatus = getNextStatus(task.status);
            onStatusChange(task.id, nextStatus);
          }}>
          <MaterialIcons
            name={getStatusIcon(task.status)}
            size={24}
            color={getStatusColor(task.status)}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.taskContent} onPress={() => onSelect(task)}>
          <ThemedText
            style={[
              styles.taskTitle,
              isDark && styles.taskTitleDark,
              task.status === 'completed' && styles.completedTask,
              task.status === 'completed' && isDark && styles.completedTaskDark,
            ]}>
            {task.title}
          </ThemedText>
          {task.description && (
            <ThemedText style={[styles.taskDescription, isDark && styles.taskDescriptionDark]}>
              {task.description}
            </ThemedText>
          )}
          {task.due_date && (
            <ThemedText style={[styles.taskDueDate, isDark && styles.taskDueDateDark]}>
              Due: {new Date(task.due_date).toLocaleDateString()}
            </ThemedText>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.pomodoroButton}
          onPress={() => router.push({
            pathname: '/(tabs)/focus',
            params: { 
              taskId: task.id,
              taskTitle: task.title,
              taskDescription: task.description || ''
            }
          })}>
          <MaterialIcons name="timer" size={24} color="#9333EA" />
        </TouchableOpacity>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  taskItemDark: {
    backgroundColor: '#374151',
  },
  statusButton: {
    padding: 4,
  },
  taskContent: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  taskTitleDark: {
    color: '#F9FAFB',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  completedTaskDark: {
    color: '#6B7280',
  },
  taskDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  taskDescriptionDark: {
    color: '#9CA3AF',
  },
  taskDueDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  taskDueDateDark: {
    color: '#9CA3AF',
  },
  rightActions: {
    marginBottom: 12,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    width: 60,
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  pomodoroButton: {
    padding: 8,
    marginLeft: 8,
    justifyContent: 'center',
  },
}); 
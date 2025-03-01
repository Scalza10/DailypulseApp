import { View, FlatList, StyleSheet, useColorScheme } from 'react-native';
import { Task } from '@/types/database';
import { TaskItem } from './TaskItem';
import { TaskSectionHeader } from './TaskSectionHeader';
import { ThemedText } from '@/components/ThemedText';

type TaskGroup = {
  title: string;
  data: Task[];
};

interface TaskListProps {
  groups: TaskGroup[];
  onStatusChange: (taskId: string, newStatus: Task['status']) => Promise<void>;
  onTaskSelect: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  loading: boolean;
  selectedFilter: Task['status'] | 'all';
}

export function TaskList({
  groups,
  onStatusChange,
  onTaskSelect,
  onDeleteTask,
  loading,
  selectedFilter,
}: TaskListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <FlatList
      data={groups}
      renderItem={({ item: group }) => (
        <View>
          <TaskSectionHeader title={group.title as Task['status']} />
          {group.data.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onSelect={onTaskSelect}
              onDelete={onDeleteTask}
            />
          ))}
        </View>
      )}
      keyExtractor={(item) => item.title}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        !loading ? (
          <ThemedText style={[styles.emptyText, isDark && styles.emptyTextDark]}>
            {selectedFilter === 'all'
              ? 'No tasks yet. Add your first task!'
              : `No ${selectedFilter.replace('_', ' ')} tasks`}
          </ThemedText>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
  },
  emptyTextDark: {
    color: '#9CA3AF',
  },
}); 
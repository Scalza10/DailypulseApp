import { View, FlatList, StyleSheet, useColorScheme } from 'react-native';
import { Task } from '@/types/database';
import { TaskItem } from './TaskItem';
import { TaskSectionHeader } from './TaskSectionHeader';
import { ThemedText } from '@/components/ThemedText';

interface TaskWithChildren extends Task {
  children: TaskWithChildren[];
}

// Helper function to organize tasks into a hierarchy
function organizeTasksHierarchy(tasks: Task[]): Task[] {
  if (!tasks.length) return [];

  try {
    const taskMap = new Map<string, TaskWithChildren>();
    const rootTasks: TaskWithChildren[] = [];

    // First pass: create enhanced task objects with children arrays
    tasks.forEach(task => {
      taskMap.set(task.id, { ...task, children: [] });
    });

    // Second pass: organize into hierarchy
    tasks.forEach(task => {
      const enhancedTask = taskMap.get(task.id);
      if (!enhancedTask) return;

      if (task.parent_id && taskMap.has(task.parent_id)) {
        const parent = taskMap.get(task.parent_id);
        if (parent) {
          parent.children.push(enhancedTask);
        }
      } else {
        rootTasks.push(enhancedTask);
      }
    });

    // Helper function to flatten hierarchy
    function flattenTasks(tasks: TaskWithChildren[], result: Task[] = []): Task[] {
      tasks
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .forEach(task => {
          result.push(task);
          if (task.children?.length > 0) {
            flattenTasks(task.children, result);
          }
        });
      return result;
    }

    return flattenTasks(rootTasks);
  } catch (error) {
    console.error('Error organizing tasks:', error);
    return tasks; // Return original tasks if organization fails
  }
}

interface TaskListProps {
  groups: TaskGroup[];
  onStatusChange: (taskId: string, newStatus: Task['status']) => Promise<void>;
  onTaskSelect: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddSubtask: (task: Task) => void;
  loading: boolean;
  selectedFilter: Task['status'] | 'all';
}

type TaskGroup = {
  title: string;
  data: Task[];
};

export function TaskList({
  groups,
  onStatusChange,
  onTaskSelect,
  onDeleteTask,
  onAddSubtask,
  loading,
  selectedFilter,
}: TaskListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (loading) {
    return (
      <ThemedText style={[styles.emptyText, isDark && styles.emptyTextDark]}>
        Loading tasks...
      </ThemedText>
    );
  }

  const safeGroups = Array.isArray(groups) ? groups : [];
  
  // Organize each group's tasks
  const organizedGroups = safeGroups.map(group => ({
    title: group.title,
    data: organizeTasksHierarchy(group.data)
  }));

  // Filter groups based on selected filter
  const filteredGroups = selectedFilter === 'all' 
    ? organizedGroups 
    : organizedGroups.filter(group => group.title === selectedFilter);

  return (
    <FlatList
      data={filteredGroups}
      renderItem={({ item: group }) => (
        <View key={`group-${group.title}`}>
          <TaskSectionHeader title={group.title as Task['status']} />
          {group.data.length > 0 && group.data.map((task) => (
            <TaskItem
              key={`task-${task.id}`}
              task={task}
              onStatusChange={onStatusChange}
              onSelect={onTaskSelect}
              onDelete={onDeleteTask}
              onAddSubtask={onAddSubtask}
              depth={task.depth}
              isSubtask={!!task.parent_id}
            />
          ))}
        </View>
      )}
      keyExtractor={(item) => `group-${item.title}`}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        !loading && (!filteredGroups.length || filteredGroups.every(g => !g.data.length)) ? (
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
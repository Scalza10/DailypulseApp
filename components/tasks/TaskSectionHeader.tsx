import { View, StyleSheet, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Task } from '@/types/database';

interface TaskSectionHeaderProps {
  title: Task['status'];
}

export function TaskSectionHeader({ title }: TaskSectionHeaderProps) {
  const isDark = useColorScheme() === 'dark';
  const headers: Record<Task['status'], string> = {
    in_progress: 'In Progress',
    pending: 'To Do',
    completed: 'Completed',
  };

  return (
    <View style={[styles.sectionHeader, isDark && styles.sectionHeaderDark]}>
      <ThemedText style={[styles.sectionHeaderText, isDark && styles.sectionHeaderTextDark]}>
        {headers[title]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  sectionHeaderDark: {
    backgroundColor: '#1F2937',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    textTransform: 'uppercase',
  },
  sectionHeaderTextDark: {
    color: '#9CA3AF',
  },
}); 
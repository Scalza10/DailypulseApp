import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

interface TaskSortProps {
  sortBy: 'due_date' | 'priority' | 'created';
  onSortChange: (sort: 'due_date' | 'priority' | 'created') => void;
}

export function TaskSort({ sortBy, onSortChange }: TaskSortProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.sortButton, sortBy === 'created' && styles.sortButtonActive]}
        onPress={() => onSortChange('created')}
      >
        <MaterialIcons name="sort" size={18} color={sortBy === 'created' ? '#FFFFFF' : '#6B7280'} />
        <ThemedText style={[styles.sortText, sortBy === 'created' && styles.sortTextActive]}>
          Created
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.sortButton, sortBy === 'due_date' && styles.sortButtonActive]}
        onPress={() => onSortChange('due_date')}
      >
        <MaterialIcons name="event" size={18} color={sortBy === 'due_date' ? '#FFFFFF' : '#6B7280'} />
        <ThemedText style={[styles.sortText, sortBy === 'due_date' && styles.sortTextActive]}>
          Due Date
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.sortButton, sortBy === 'priority' && styles.sortButtonActive]}
        onPress={() => onSortChange('priority')}
      >
        <MaterialIcons name="flag" size={18} color={sortBy === 'priority' ? '#FFFFFF' : '#6B7280'} />
        <ThemedText style={[styles.sortText, sortBy === 'priority' && styles.sortTextActive]}>
          Priority
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    padding: 20,
    paddingTop: 0,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  sortButtonActive: {
    backgroundColor: '#2563EB',
  },
  sortText: {
    fontSize: 14,
    color: '#6B7280',
  },
  sortTextActive: {
    color: '#FFFFFF',
  },
}); 
import { View, TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Task } from '@/types/database';

interface TaskFilterProps {
  selectedFilter: Task['status'] | 'all';
  taskCounts: Record<Task['status'] | 'all', number>;
  onFilterChange: (filter: Task['status'] | 'all') => void;
  dropdownVisible: boolean;
  setDropdownVisible: (visible: boolean) => void;
}

export function TaskFilter({
  selectedFilter,
  taskCounts,
  onFilterChange,
  dropdownVisible,
  setDropdownVisible,
}: TaskFilterProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={[styles.dropdownButton, isDark && styles.dropdownButtonDark]}
        onPress={() => setDropdownVisible(!dropdownVisible)}>
        <Text style={[styles.dropdownButtonText, isDark && styles.dropdownButtonTextDark]}>
          {(() => {
            switch (selectedFilter) {
              case 'pending':
                return `To Do (${taskCounts.pending})`;
              case 'in_progress':
                return `In Progress (${taskCounts.in_progress})`;
              case 'completed':
                return `Completed (${taskCounts.completed})`;
              default:
                return `All Tasks (${taskCounts.all})`;
            }
          })()}
        </Text>
        <MaterialIcons 
          name={dropdownVisible ? 'expand-less' : 'expand-more'} 
          size={24} 
          color={isDark ? '#F9FAFB' : '#1F2937'} 
        />
      </TouchableOpacity>
      {dropdownVisible && (
        <View style={[styles.dropdownMenu, isDark && styles.dropdownMenuDark]}>
          <Picker
            selectedValue={selectedFilter}
            onValueChange={(itemValue) => {
              onFilterChange(itemValue);
              setDropdownVisible(false);
            }}
            style={isDark ? { color: '#F9FAFB' } : undefined}>
            <Picker.Item label={`All Tasks (${taskCounts.all})`} value="all" />
            <Picker.Item label={`To Do (${taskCounts.pending})`} value="pending" />
            <Picker.Item label={`In Progress (${taskCounts.in_progress})`} value="in_progress" />
            <Picker.Item label={`Completed (${taskCounts.completed})`} value="completed" />
          </Picker>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownContainer: {
    margin: 20,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  dropdownButtonDark: {
    backgroundColor: '#374151',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },
  dropdownButtonTextDark: {
    color: '#F9FAFB',
  },
  dropdownMenu: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dropdownMenuDark: {
    backgroundColor: '#374151',
  },
}); 
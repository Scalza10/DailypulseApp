import { useState } from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFilter } from '@/components/tasks/TaskFilter';
import { TaskModal } from '@/components/tasks/TaskModal';
import { Task } from '@/types/database';
import { useTasks } from '@/hooks/useTasks';

export default function TasksScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [parentTask, setParentTask] = useState<Task | null>(null);
  
  const { 
    loading, 
    taskCounts, 
    groupedTasks, 
    handleCreateTask, 
    handleEditTask, 
    handleStatusChange, 
    handleDeleteTask,
    selectedFilter,
    setSelectedFilter
  } = useTasks();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>        
        <TaskFilter
          selectedFilter={selectedFilter}
          taskCounts={taskCounts}
          onFilterChange={setSelectedFilter}
          dropdownVisible={dropdownVisible}
          setDropdownVisible={setDropdownVisible}
        />

        <TaskList
          groups={groupedTasks}
          onStatusChange={handleStatusChange}
          onTaskSelect={(task) => {
            setSelectedTask(task);
            setParentTask(null);
            setModalVisible(true);
          }}
          onDeleteTask={handleDeleteTask}
          onAddSubtask={(task) => {
            setParentTask(task);
            setModalVisible(true);
          }}
          loading={loading}
          selectedFilter={selectedFilter}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setSelectedTask(null);
            setModalVisible(true);
          }}>
          <MaterialIcons name="add" size={30} color="white" />
        </TouchableOpacity>

        <TaskModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedTask(null);
            setParentTask(null);
          }}
          onSave={async (taskData) => {
            if (selectedTask) {
              await handleEditTask({
                id: selectedTask.id,
                ...taskData
              });
            } else {
              await handleCreateTask(taskData);
            }
          }}
          initialTask={selectedTask ? {
            title: selectedTask.title,
            description: selectedTask.description || '',
            due_date: selectedTask.due_date,
          } : undefined}
          parentTask={parentTask || undefined}
          isSubtask={!!parentTask}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#1F2937',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
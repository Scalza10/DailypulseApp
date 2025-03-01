import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth';
import { Task } from '@/types/database';

type TaskGroup = {
  title: string;
  data: Task[];
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<Task['status'] | 'all'>('all');
  const { session } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    due_date: Date | null;
  }) => {
    try {
      const { error } = await supabase.from('tasks').insert({
        user_id: session?.user.id,
        title: taskData.title,
        description: taskData.description || null,
        due_date: taskData.due_date?.toISOString() || null,
        status: 'pending',
      });

      if (error) throw error;
      await fetchTasks();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleEditTask = async (taskData: {
    id: string;
    title: string;
    description: string;
    due_date: Date | null;
  }) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: taskData.title,
          description: taskData.description || null,
          due_date: taskData.due_date?.toISOString() || null,
        })
        .eq('id', taskData.id);

      if (error) throw error;
      await fetchTasks();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      await fetchTasks();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      await fetchTasks();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const taskCounts = tasks.reduce(
    (counts, task) => {
      counts[task.status]++;
      counts.all++;
      return counts;
    },
    { all: 0, pending: 0, in_progress: 0, completed: 0 } as Record<Task['status'] | 'all', number>
  );

  const filteredAndGroupedTasks = tasks
    .filter(task => selectedFilter === 'all' || task.status === selectedFilter)
    .reduce<TaskGroup[]>((groups, task) => {
      const existingGroup = groups.find((group) => group.title === task.status);
      if (existingGroup) {
        existingGroup.data.push(task);
      } else {
        groups.push({
          title: task.status,
          data: [task],
        });
      }
      return groups;
    }, [])
    .sort((a, b) => {
      const order = ['in_progress', 'pending', 'completed'];
      return order.indexOf(a.title as Task['status']) - order.indexOf(b.title as Task['status']);
    });

  return {
    tasks,
    loading,
    taskCounts,
    groupedTasks: filteredAndGroupedTasks,
    handleCreateTask,
    handleEditTask,
    handleStatusChange,
    handleDeleteTask,
    selectedFilter,
    setSelectedFilter,
  };
} 
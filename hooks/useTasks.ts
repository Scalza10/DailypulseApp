import { useState, useEffect, useMemo } from 'react';
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
        .order('created_at', { ascending: true });

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
    parent_id?: string | null;
  }) => {
    try {
      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert({
          user_id: session?.user.id,
          title: taskData.title,
          description: taskData.description || null,
          due_date: taskData.due_date?.toISOString() || null,
          status: 'pending',
          parent_id: taskData.parent_id || null,
          has_subtasks: false,
          order: 0,
          depth: taskData.parent_id ? 1 : 0,
        })
        .select()
        .single();

      if (error) throw error;

      if (taskData.parent_id) {
        await supabase
          .from('tasks')
          .update({ has_subtasks: true })
          .eq('id', taskData.parent_id);
      }

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
      // Get the task and its related tasks
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const childTasks = tasks.filter(t => t.parent_id === taskId);
      const parentTask = task.parent_id ? tasks.find(t => t.id === task.parent_id) : null;

      // Update the task's status
      await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      // If updating a parent task, update all child tasks
      if (childTasks.length > 0) {
        await supabase
          .from('tasks')
          .update({ status: newStatus })
          .in('id', childTasks.map(t => t.id));
      }

      // If updating a child task
      if (parentTask) {
        const siblingTasks = tasks.filter(t => t.parent_id === parentTask.id);
        
        if (newStatus === 'in_progress' || newStatus === 'pending') {
          // If child goes to in_progress or pending, parent should match
          await supabase
            .from('tasks')
            .update({ status: newStatus })
            .eq('id', parentTask.id);
        } else if (newStatus === 'completed') {
          // Check if all siblings are completed
          const allCompleted = siblingTasks.every(t => 
            t.id === taskId ? true : t.status === 'completed'
          );
          
          if (allCompleted) {
            // If all children are completed, complete the parent
            await supabase
              .from('tasks')
              .update({ status: 'completed' })
              .eq('id', parentTask.id);
          }
        }
      }

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

  // Modify the task grouping to nest subtasks under their parents
  const organizeTasksWithSubtasks = (tasks: Task[]): Task[] => {
    const taskMap = new Map<string, Task & { subtasks?: Task[] }>();
    const rootTasks: (Task & { subtasks?: Task[] })[] = [];

    // First pass: create task map
    tasks.forEach(task => {
      taskMap.set(task.id, { ...task, subtasks: [] });
    });

    // Second pass: organize into hierarchy
    tasks.forEach(task => {
      const enhancedTask = taskMap.get(task.id)!;
      if (task.parent_id && taskMap.has(task.parent_id)) {
        const parent = taskMap.get(task.parent_id)!;
        parent.subtasks?.push(enhancedTask);
      } else {
        rootTasks.push(enhancedTask);
      }
    });

    // Sort root tasks and subtasks by creation date
    rootTasks.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    rootTasks.forEach(task => {
      if (task.subtasks) {
        task.subtasks.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
    });

    return rootTasks;
  };

  const filteredAndGroupedTasks = useMemo(() => {
    const filteredTasks = tasks.filter(task => 
      selectedFilter === 'all' || task.status === selectedFilter
    );
    
    // Only get root tasks (tasks without parents)
    const rootTasks = filteredTasks.filter(task => !task.parent_id);
    const organizedTasks = organizeTasksWithSubtasks(filteredTasks);

    return organizedTasks.reduce<TaskGroup[]>((groups, task) => {
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
    }, []).sort((a, b) => {
      const order = ['in_progress', 'pending', 'completed'];
      return order.indexOf(a.title as Task['status']) - order.indexOf(b.title as Task['status']);
    });
  }, [tasks, selectedFilter]);

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
import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/services/supabase/supabase';
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
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'created'>('created');
  const { session } = useAuth();
  const [searchCriteria, setSearchCriteria] = useState<{
    searchText: string;
    includeDone: boolean;
    priority: ('high' | 'medium' | 'low' | null)[];
  } | null>(null);

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
    priority: 'high' | 'medium' | 'low' | null;
    parent_id?: string | null;
    recurring?: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly' | null;
    } | null;
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
          priority: taskData.priority || null,
          recurring: taskData.recurring || null,
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
    priority: 'high' | 'medium' | 'low' | null;
    recurring?: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly' | null;
    } | null;
  }) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: taskData.title,
          description: taskData.description || null,
          due_date: taskData.due_date?.toISOString() || null,
          priority: taskData.priority || null,
          recurring: taskData.recurring || null,
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
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate) return;

      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      // If task is completed and is recurring, create a new instance
      if (newStatus === 'completed' && taskToUpdate.recurring?.enabled) {

        const dueDate = taskToUpdate.due_date ? new Date(taskToUpdate.due_date) : null;
        let newDueDate = null;

        if (dueDate) {
          const newDate = new Date(dueDate); // Create new date object to avoid modifying original
          
          switch (taskToUpdate.recurring.frequency) {
            case 'daily':
              newDate.setDate(newDate.getDate() + 1);
              break;
            case 'weekly':
              newDate.setDate(newDate.getDate() + 7);
              break;
            case 'monthly':
              newDate.setMonth(newDate.getMonth() + 1);
              break;
          }
          newDueDate = newDate;
        }

        // Create new task
        const { data: newTask, error: createError } = await supabase
          .from('tasks')
          .insert({
            user_id: session?.user.id,
            title: taskToUpdate.title,
            description: taskToUpdate.description,
            due_date: newDueDate?.toISOString() || null,
            status: 'pending',
            priority: taskToUpdate.priority,
            recurring: taskToUpdate.recurring,
            parent_id: null,
            has_subtasks: false,
            order: 0,
            depth: 0,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating recurring task:', createError); // Debug log
          throw createError;
        }
      }

      await fetchTasks();
    } catch (error: any) {
      console.error('Error in handleStatusChange:', error); // Debug log
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

  // Helper function to compare tasks by priority
  const comparePriority = (a: Task, b: Task) => {
    const priorityOrder = { high: 0, medium: 1, low: 2, null: 3 };
    const aPriority = a.priority || 'null';
    const bPriority = b.priority || 'null';
    return priorityOrder[aPriority] - priorityOrder[bPriority];
  };

  // Helper function to compare tasks by due date
  const compareDueDate = (a: Task, b: Task) => {
    // Tasks without due dates should go to the end
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;  // a goes after b
    if (!b.due_date) return -1; // b goes after a

    // Parse dates and normalize to UTC to avoid timezone issues
    const dateA = new Date(a.due_date);
    const dateB = new Date(b.due_date);
    
    // Set both dates to UTC midnight
    const timeA = Date.UTC(
      dateA.getFullYear(),
      dateA.getMonth(),
      dateA.getDate()
    );
    const timeB = Date.UTC(
      dateB.getFullYear(),
      dateB.getMonth(),
      dateB.getDate()
    );

    return timeA - timeB;  // Earlier dates come first
  };

  const sortTasks = (tasksToSort: Task[]) => {
    switch (sortBy) {
      case 'priority':
        return [...tasksToSort].sort(comparePriority);
      case 'due_date':
        return [...tasksToSort].sort(compareDueDate);
      default:
        return [...tasksToSort].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
    }
  };

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

    // Sort root tasks and their subtasks
    const sortedRootTasks = sortTasks(rootTasks);
    
    // Sort subtasks for each root task
    sortedRootTasks.forEach(task => {
      if (task.subtasks?.length) {
        task.subtasks = sortTasks(task.subtasks);
      }
    });

    return sortedRootTasks;
  };

  const filteredAndGroupedTasks = useMemo(() => {
    let filteredTasks = tasks;

    // Apply search criteria if exists and has actual filters
    if (searchCriteria && (
      searchCriteria.searchText || 
      searchCriteria.priority.length > 0 || 
      searchCriteria.includeDone
    )) {
      filteredTasks = tasks.filter(task => {
        const matchesText = searchCriteria.searchText
          ? (task.title.toLowerCase().includes(searchCriteria.searchText.toLowerCase()) ||
             (task.description?.toLowerCase() || '').includes(searchCriteria.searchText.toLowerCase()))
          : true;

        const matchesPriority = searchCriteria.priority.length > 0
          ? searchCriteria.priority.includes(task.priority)
          : true;

        const matchesStatus = searchCriteria.includeDone
          ? true
          : task.status !== 'completed';

        return matchesText && matchesPriority && matchesStatus;
      });
    }

    // Apply status filter
    filteredTasks = filteredTasks.filter(task => 
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
  }, [tasks, selectedFilter, sortBy, searchCriteria]);

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
    sortBy,
    setSortBy,
    setSearchCriteria,
  };
} 
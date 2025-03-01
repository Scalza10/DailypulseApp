import { Task } from '@/types/database';
import { MaterialIcons } from '@expo/vector-icons';

export const getNextStatus = (currentStatus: Task['status']): Task['status'] => {
  const statusFlow: Record<Task['status'], Task['status']> = {
    pending: 'in_progress',
    in_progress: 'completed',
    completed: 'pending',
  };
  return statusFlow[currentStatus];
};

export const getStatusIcon = (status: Task['status']): keyof typeof MaterialIcons.glyphMap => {
  const icons: Record<Task['status'], keyof typeof MaterialIcons.glyphMap> = {
    pending: 'radio-button-unchecked',
    in_progress: 'play-circle-outline',
    completed: 'check-circle',
  };
  return icons[status];
};

export const getStatusColor = (status: Task['status']): string => {
  const colors: Record<Task['status'], string> = {
    pending: '#9CA3AF',
    in_progress: '#3B82F6',
    completed: '#10B981',
  };
  return colors[status];
}; 
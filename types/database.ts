export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  preferences: Record<string, any>;
}

export interface Task {
  id: string;
  user_id: string;
  parent_id: string | null;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string | null;
  created_at: string;
  updated_at: string;
  ai_metadata: Record<string, any>;
  has_subtasks: boolean;
  order: number;
  depth: number;
} 
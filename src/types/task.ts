export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  is_urgent: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  is_urgent?: boolean;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  is_urgent?: boolean;
  is_completed?: boolean;
}

export interface Backup {
  id: string;
  user_id: string;
  backup_name: string;
  tasks_data: Task[];
  settings_data: Record<string, unknown>;
  created_at: string;
}

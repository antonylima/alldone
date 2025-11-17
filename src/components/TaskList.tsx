import type { Task } from '../types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
}

export function TaskList({ tasks, onEdit, onDelete, onToggleComplete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No tasks yet. Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
        />
      ))}
    </div>
  );
}

import { Pencil, Trash2, Check, X } from 'lucide-react';
import type { Task } from '../types/task';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
}

export function TaskItem({ task, onEdit, onDelete, onToggleComplete }: TaskItemProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-l-4 p-4 transition-all hover:shadow-md ${
        task.is_urgent && !task.is_completed
          ? 'border-red-500'
          : task.is_completed
          ? 'border-gray-300 opacity-70'
          : 'border-blue-500'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`font-semibold text-lg ${
                task.is_completed ? 'line-through text-gray-500' : 'text-gray-800'
              }`}
            >
              {task.title}
            </h3>
            {task.is_urgent && !task.is_completed && (
              <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded">
                Urgent
              </span>
            )}
            {task.is_completed && (
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">
                Completed
              </span>
            )}
          </div>
          {task.description && (
            <p
              className={`text-sm mt-1 ${
                task.is_completed ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {task.description}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Created: {new Date(task.created_at).toLocaleDateString()} at{' '}
            {new Date(task.created_at).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleComplete(task.id, !task.is_completed)}
            className={`p-2 rounded-lg transition-colors ${
              task.is_completed
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            title={task.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {task.is_completed ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          </button>
          <button
            onClick={() => onEdit(task)}
            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            title="Edit task"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

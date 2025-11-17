import { useState, useEffect } from 'react';
import { Plus, Database, LogOut, ListTodo } from 'lucide-react';
import { supabase } from './lib/supabase';
import { taskService } from './services/taskService';
import { AuthForm } from './components/AuthForm';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { BackupManager } from './components/BackupManager';
import type { Task, CreateTaskInput } from './types/task';
import type { User } from '@supabase/supabase-js';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showBackupManager, setShowBackupManager] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (() => {
        setUser(session?.user ?? null);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const data = await taskService.getAllTasks();
      const sorted = taskService.sortTasks(data);
      setTasks(sorted);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  const handleCreateTask = async (input: CreateTaskInput) => {
    try {
      await taskService.createTask(input);
      await loadTasks();
      setShowTaskForm(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleUpdateTask = async (input: CreateTaskInput) => {
    if (!editingTask) return;

    try {
      await taskService.updateTask(editingTask.id, input);
      await loadTasks();
      setEditingTask(null);
      setShowTaskForm(false);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Delete this task?')) return;

    try {
      await taskService.deleteTask(id);
      await loadTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
    try {
      await taskService.toggleComplete(id, isCompleted);
      await loadTasks();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setTasks([]);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={loadTasks} />;
  }

  const urgentCount = tasks.filter(t => t.is_urgent && !t.is_completed).length;
  const completedCount = tasks.filter(t => t.is_completed).length;
  const activeCount = tasks.filter(t => !t.is_completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <ListTodo className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Task Manager</h1>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBackupManager(true)}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Database className="w-5 h-5" />
                <span className="hidden sm:inline">Backups</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">Active Tasks</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{activeCount}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-sm text-red-600 font-medium">Urgent Tasks</p>
              <p className="text-2xl font-bold text-red-700 mt-1">{urgentCount}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{completedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Tasks</h2>
            <button
              onClick={() => setShowTaskForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              New Task
            </button>
          </div>

          <TaskList
            tasks={tasks}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onToggleComplete={handleToggleComplete}
          />
        </div>
      </div>

      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={handleCloseTaskForm}
        />
      )}

      {showBackupManager && (
        <BackupManager
          onClose={() => setShowBackupManager(false)}
          onRestoreComplete={loadTasks}
        />
      )}
    </div>
  );
}

export default App;

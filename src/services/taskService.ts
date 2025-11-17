import { supabase } from '../lib/supabase';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task';

export const taskService = {
  async getAllTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description || '',
        is_urgent: input.is_urgent || false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async toggleComplete(id: string, isCompleted: boolean): Promise<Task> {
    return this.updateTask(id, { is_completed: isCompleted });
  },

  sortTasks(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }

      if (a.is_urgent !== b.is_urgent) {
        return b.is_urgent ? 1 : -1;
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  },
};

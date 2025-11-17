import { supabase } from '../lib/supabase';
import type { Task, Backup } from '../types/task';

export const backupService = {
  async createBackup(backupName: string): Promise<Backup> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');

    if (tasksError) throw tasksError;

    const { data: settings, error: settingsError } = await supabase
      .from('app_settings')
      .select('settings_data')
      .eq('user_id', user.id)
      .maybeSingle();

    if (settingsError) throw settingsError;

    const { data, error } = await supabase
      .from('backups')
      .insert({
        user_id: user.id,
        backup_name: backupName,
        tasks_data: tasks || [],
        settings_data: settings?.settings_data || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAllBackups(): Promise<Backup[]> {
    const { data, error } = await supabase
      .from('backups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async restoreBackup(backupId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: backup, error: backupError } = await supabase
      .from('backups')
      .select('*')
      .eq('id', backupId)
      .single();

    if (backupError) throw backupError;
    if (!backup) throw new Error('Backup not found');

    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;

    const tasksToRestore = (backup.tasks_data as Task[]).map(task => ({
      user_id: user.id,
      title: task.title,
      description: task.description,
      is_urgent: task.is_urgent,
      is_completed: task.is_completed,
    }));

    if (tasksToRestore.length > 0) {
      const { error: insertError } = await supabase
        .from('tasks')
        .insert(tasksToRestore);

      if (insertError) throw insertError;
    }

    const { data: existingSettings } = await supabase
      .from('app_settings')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingSettings) {
      const { error: updateError } = await supabase
        .from('app_settings')
        .update({ settings_data: backup.settings_data })
        .eq('user_id', user.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('app_settings')
        .insert({
          user_id: user.id,
          settings_data: backup.settings_data,
        });

      if (insertError) throw insertError;
    }
  },

  async deleteBackup(backupId: string): Promise<void> {
    const { error } = await supabase
      .from('backups')
      .delete()
      .eq('id', backupId);

    if (error) throw error;
  },

  async exportBackupAsJson(backupId: string): Promise<void> {
    const { data: backup, error } = await supabase
      .from('backups')
      .select('*')
      .eq('id', backupId)
      .single();

    if (error) throw error;

    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${backup.backup_name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

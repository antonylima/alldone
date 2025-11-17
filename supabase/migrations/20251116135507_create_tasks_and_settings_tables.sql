/*
  # Task Manager Database Schema

  ## Overview
  Creates the core database structure for a task management application with backup/restore capabilities.

  ## New Tables

  ### `tasks`
  Main table for storing task information:
  - `id` (uuid, primary key) - Unique identifier for each task
  - `user_id` (uuid) - Reference to the authenticated user who owns the task
  - `title` (text) - Task title/name
  - `description` (text) - Detailed task description (optional)
  - `is_urgent` (boolean) - Flag to mark tasks as urgent (defaults to false)
  - `is_completed` (boolean) - Task completion status (defaults to false)
  - `created_at` (timestamptz) - Timestamp when task was created
  - `updated_at` (timestamptz) - Timestamp when task was last modified

  ### `app_settings`
  Table for storing user-specific application settings:
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, unique) - One setting record per user
  - `settings_data` (jsonb) - Flexible JSON storage for various settings
  - `created_at` (timestamptz) - When settings were created
  - `updated_at` (timestamptz) - Last settings update

  ### `backups`
  Table for storing backup snapshots:
  - `id` (uuid, primary key) - Unique backup identifier
  - `user_id` (uuid) - User who created the backup
  - `backup_name` (text) - User-friendly backup name
  - `tasks_data` (jsonb) - Snapshot of all tasks
  - `settings_data` (jsonb) - Snapshot of app settings
  - `created_at` (timestamptz) - Backup creation time

  ## Security
  
  ### Row Level Security (RLS)
  All tables have RLS enabled to ensure users can only access their own data.

  ### Policies

  #### tasks table policies:
  1. SELECT: Users can view their own tasks
  2. INSERT: Users can create tasks for themselves
  3. UPDATE: Users can update their own tasks
  4. DELETE: Users can delete their own tasks

  #### app_settings table policies:
  1. SELECT: Users can view their own settings
  2. INSERT: Users can create their own settings
  3. UPDATE: Users can update their own settings
  4. DELETE: Users can delete their own settings

  #### backups table policies:
  1. SELECT: Users can view their own backups
  2. INSERT: Users can create their own backups
  3. DELETE: Users can delete their own backups

  ## Important Notes
  - All timestamp fields use `timestamptz` for proper timezone handling
  - The `updated_at` field is automatically updated via trigger
  - JSON fields provide flexibility for future feature additions
  - Backup functionality stores complete snapshots for easy restoration
*/

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  is_urgent boolean DEFAULT false,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  settings_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create backups table
CREATE TABLE IF NOT EXISTS backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  backup_name text NOT NULL,
  tasks_data jsonb NOT NULL,
  settings_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- Tasks table policies
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- App settings table policies
CREATE POLICY "Users can view own settings"
  ON app_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own settings"
  ON app_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON app_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Backups table policies
CREATE POLICY "Users can view own backups"
  ON backups FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own backups"
  ON backups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own backups"
  ON backups FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_is_urgent ON tasks(is_urgent);
CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_app_settings_user_id ON app_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_backups_user_id ON backups(user_id);
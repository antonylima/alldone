export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          is_urgent: boolean
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          is_urgent?: boolean
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          is_urgent?: boolean
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      app_settings: {
        Row: {
          id: string
          user_id: string
          settings_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          settings_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          settings_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      backups: {
        Row: {
          id: string
          user_id: string
          backup_name: string
          tasks_data: Json
          settings_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          backup_name: string
          tasks_data: Json
          settings_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          backup_name?: string
          tasks_data?: Json
          settings_data?: Json
          created_at?: string
        }
      }
    }
  }
}

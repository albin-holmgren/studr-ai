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
      documents: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          content: Json
          emoji: string
          user_id: string
          workspace_id: string | null
          is_archived: boolean
          version: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          content: Json
          emoji?: string
          user_id: string
          workspace_id?: string | null
          is_archived?: boolean
          version?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          content?: Json
          emoji?: string
          user_id?: string
          workspace_id?: string | null
          is_archived?: boolean
          version?: number
        }
      }
      workspaces: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          emoji: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          emoji?: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          emoji?: string
          user_id?: string
        }
      }
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string
          avatar_url: string | null
          subscription_tier: 'free' | 'pro'
          token_usage: number
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          name: string
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro'
          token_usage?: number
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro'
          token_usage?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
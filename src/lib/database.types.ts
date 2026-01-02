// This file will be auto-generated from Supabase once the database is set up
// For now, we define the types manually based on our schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'bcba' | 'rbt' | 'admin'
export type QuestionType = 'multiple_choice' | 'true_false'
export type GameStatus = 'lobby' | 'active' | 'question' | 'results' | 'finished'

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string
          settings: Json | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          settings?: Json | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          settings?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          organization_id: string | null
          email: string
          display_name: string
          role: UserRole
          created_at: string
        }
        Insert: {
          id: string
          organization_id?: string | null
          email: string
          display_name: string
          role?: UserRole
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          email?: string
          display_name?: string
          role?: UserRole
          created_at?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          user_id: string
          default_time_limit: number
          default_speed_scoring: boolean
          default_points_per_question: number
          default_auto_advance: boolean
        }
        Insert: {
          user_id: string
          default_time_limit?: number
          default_speed_scoring?: boolean
          default_points_per_question?: number
          default_auto_advance?: boolean
        }
        Update: {
          user_id?: string
          default_time_limit?: number
          default_speed_scoring?: boolean
          default_points_per_question?: number
          default_auto_advance?: boolean
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          id: string
          organization_id: string | null
          creator_id: string | null
          creator_name: string
          title: string
          description: string | null
          share_code: string
          is_active: boolean
          created_at: string
          updated_at: string
          time_limit: number
          speed_scoring: boolean
          points_per_question: number
          auto_advance: boolean
        }
        Insert: {
          id?: string
          organization_id?: string | null
          creator_id?: string | null
          creator_name: string
          title: string
          description?: string | null
          share_code?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          time_limit?: number
          speed_scoring?: boolean
          points_per_question?: number
          auto_advance?: boolean
        }
        Update: {
          id?: string
          organization_id?: string | null
          creator_id?: string | null
          creator_name?: string
          title?: string
          description?: string | null
          share_code?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          time_limit?: number
          speed_scoring?: boolean
          points_per_question?: number
          auto_advance?: boolean
        }
        Relationships: []
      }
      questions: {
        Row: {
          id: string
          quiz_id: string
          type: QuestionType
          question_text: string
          order_index: number
          time_limit_override: number | null
          is_warmup: boolean // Warmup questions don't count toward score
        }
        Insert: {
          id?: string
          quiz_id: string
          type?: QuestionType
          question_text: string
          order_index: number
          time_limit_override?: number | null
          is_warmup?: boolean
        }
        Update: {
          id?: string
          quiz_id?: string
          type?: QuestionType
          question_text?: string
          order_index?: number
          time_limit_override?: number | null
          is_warmup?: boolean
        }
        Relationships: []
      }
      question_options: {
        Row: {
          id: string
          question_id: string
          option_text: string
          is_correct: boolean
          order_index: number
        }
        Insert: {
          id?: string
          question_id: string
          option_text: string
          is_correct?: boolean
          order_index: number
        }
        Update: {
          id?: string
          question_id?: string
          option_text?: string
          is_correct?: boolean
          order_index?: number
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          id: string
          quiz_id: string
          host_id: string
          game_pin: string
          status: GameStatus
          current_question_index: number
          question_started_at: string | null
          started_at: string | null
          ended_at: string | null
          created_at: string
          time_limit: number
          speed_scoring: boolean
          points_per_question: number
          auto_advance: boolean
          winner_id: string | null
        }
        Insert: {
          id?: string
          quiz_id: string
          host_id?: string | null
          game_pin: string
          status?: GameStatus
          current_question_index?: number
          question_started_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
          time_limit: number
          speed_scoring: boolean
          points_per_question: number
          auto_advance: boolean
          winner_id?: string | null
        }
        Update: {
          id?: string
          quiz_id?: string
          host_id?: string
          game_pin?: string
          status?: GameStatus
          current_question_index?: number
          question_started_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
          time_limit?: number
          speed_scoring?: boolean
          points_per_question?: number
          auto_advance?: boolean
          winner_id?: string | null
        }
        Relationships: []
      }
      game_participants: {
        Row: {
          id: string
          game_session_id: string
          user_id: string | null
          nickname: string
          avatar_base: string
          avatar_accessory: string | null
          total_score: number
          current_streak: number
          joined_at: string
        }
        Insert: {
          id?: string
          game_session_id: string
          user_id?: string | null
          nickname: string
          avatar_base: string
          avatar_accessory?: string | null
          total_score?: number
          current_streak?: number
          joined_at?: string
        }
        Update: {
          id?: string
          game_session_id?: string
          user_id?: string | null
          nickname?: string
          avatar_base?: string
          avatar_accessory?: string | null
          total_score?: number
          current_streak?: number
          joined_at?: string
        }
        Relationships: []
      }
      question_responses: {
        Row: {
          id: string
          game_session_id: string
          participant_id: string
          question_id: string
          user_id: string | null
          selected_option_id: string | null
          is_correct: boolean
          response_time_ms: number
          points_awarded: number
          answered_at: string
        }
        Insert: {
          id?: string
          game_session_id: string
          participant_id: string
          question_id: string
          user_id?: string | null
          selected_option_id?: string | null
          is_correct?: boolean
          response_time_ms: number
          points_awarded?: number
          answered_at?: string
        }
        Update: {
          id?: string
          game_session_id?: string
          participant_id?: string
          question_id?: string
          user_id?: string | null
          selected_option_id?: string | null
          is_correct?: boolean
          response_time_ms?: number
          points_awarded?: number
          answered_at?: string
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          total_games_played: number
          total_games_won: number
          total_questions_answered: number
          total_correct_answers: number
          total_points: number
          best_streak: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          total_games_played?: number
          total_games_won?: number
          total_questions_answered?: number
          total_correct_answers?: number
          total_points?: number
          best_streak?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          total_games_played?: number
          total_games_won?: number
          total_questions_answered?: number
          total_correct_answers?: number
          total_points?: number
          best_streak?: number
          updated_at?: string
        }
        Relationships: []
      }
      player_registry: {
        Row: {
          id: string
          organization_id: string
          real_name: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          real_name: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          real_name?: string
          created_at?: string
        }
        Relationships: []
      }
      nickname_mappings: {
        Row: {
          id: string
          player_id: string
          nickname: string
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          nickname: string
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          nickname?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      question_type: QuestionType
      game_status: GameStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier use
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Commonly used types
export type Organization = Tables<'organizations'>
export type Profile = Tables<'profiles'>
export type UserSettings = Tables<'user_settings'>
export type Quiz = Tables<'quizzes'>
export type Question = Tables<'questions'>
export type QuestionOption = Tables<'question_options'>
export type GameSession = Tables<'game_sessions'>
export type GameParticipant = Tables<'game_participants'>
export type QuestionResponse = Tables<'question_responses'>
export type LeaderboardEntry = Tables<'leaderboard_entries'>
export type PlayerRegistry = Tables<'player_registry'>
export type NicknameMapping = Tables<'nickname_mappings'>

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      cards: {
        Row: {
          card_content_id: number
          created_at: string
          difficulty: number
          due: string
          elapsed_days: number
          id: number
          lapses: number
          last_review: string
          reps: number
          scheduled_days: number
          stability: number
          state: number
          user_id: string
        }
        Insert: {
          card_content_id: number
          created_at?: string
          difficulty: number
          due: string
          elapsed_days: number
          id?: number
          lapses: number
          last_review: string
          reps: number
          scheduled_days: number
          stability: number
          state: number
          user_id?: string
        }
        Update: {
          card_content_id?: number
          created_at?: string
          difficulty?: number
          due?: string
          elapsed_days?: number
          id?: number
          lapses?: number
          last_review?: string
          reps?: number
          scheduled_days?: number
          stability?: number
          state?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          context: string | null
          context_html: string | null
          created_at: string
          highlights: string[]
          id: string
          predicted_topic: string | null
          prioritised: number
          quote: string
          serialized_highlight: string | null
          snippet_uuid: string | null
          source_id: string
          tags: string[]
          user_id: string
          user_note: string | null
        }
        Insert: {
          context?: string | null
          context_html?: string | null
          created_at?: string
          highlights: string[]
          id: string
          predicted_topic?: string | null
          prioritised?: number
          quote: string
          serialized_highlight?: string | null
          snippet_uuid?: string | null
          source_id: string
          tags?: string[]
          user_id?: string
          user_note?: string | null
        }
        Update: {
          context?: string | null
          context_html?: string | null
          created_at?: string
          highlights?: string[]
          id?: string
          predicted_topic?: string | null
          prioritised?: number
          quote?: string
          serialized_highlight?: string | null
          snippet_uuid?: string | null
          source_id?: string
          tags?: string[]
          user_id?: string
          user_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_notes_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          created_at: string
          DOI: string | null
          domain: string | null
          id: string
          title: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          DOI?: string | null
          domain?: string | null
          id: string
          title?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          DOI?: string | null
          domain?: string | null
          id?: string
          title?: string | null
          url?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
  Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
      ? R
      : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
        ? R
        : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

// Schema: public
// Tables
export type Cards = Database["public"]["Tables"]["cards"]["Row"]
export type InsertCards = Database["public"]["Tables"]["cards"]["Insert"]
export type UpdateCards = Database["public"]["Tables"]["cards"]["Update"]

export type Notes = Database["public"]["Tables"]["notes"]["Row"]
export type InsertNotes = Database["public"]["Tables"]["notes"]["Insert"]
export type UpdateNotes = Database["public"]["Tables"]["notes"]["Update"]

export type Profiles = Database["public"]["Tables"]["profiles"]["Row"]
export type InsertProfiles = Database["public"]["Tables"]["profiles"]["Insert"]
export type UpdateProfiles = Database["public"]["Tables"]["profiles"]["Update"]

export type Sources = Database["public"]["Tables"]["sources"]["Row"]
export type InsertSources = Database["public"]["Tables"]["sources"]["Insert"]
export type UpdateSources = Database["public"]["Tables"]["sources"]["Update"]

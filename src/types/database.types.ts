export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      animals: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      avatars: {
        Row: {
          BackgroundColor: number | null
          BodyColor: number | null
          BodyEyes: number | null
          BodyFaceHair: number | null
          BodyHair: number | null
          BodySize: number | null
          created_at: string
          id: number
        }
        Insert: {
          BackgroundColor?: number | null
          BodyColor?: number | null
          BodyEyes?: number | null
          BodyFaceHair?: number | null
          BodyHair?: number | null
          BodySize?: number | null
          created_at?: string
          id?: number
        }
        Update: {
          BackgroundColor?: number | null
          BodyColor?: number | null
          BodyEyes?: number | null
          BodyFaceHair?: number | null
          BodyHair?: number | null
          BodySize?: number | null
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      created_games: {
        Row: {
          created_at: string
          guests: string[] | null
          host: string | null
          id: string
        }
        Insert: {
          created_at?: string
          guests?: string[] | null
          host?: string | null
          id?: string
        }
        Update: {
          created_at?: string
          guests?: string[] | null
          host?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "created_games_host_fkey"
            columns: ["host"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      rewards: {
        Row: {
          created_at: string
          id: number
          name: string | null
          product: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          product?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          product?: string | null
        }
        Relationships: []
      }
      stats: {
        Row: {
          claimed_for_day: boolean | null
          coins: number | null
          created_at: string
          energy_count: number | null
          games_played: number | null
          id: string
          login_streak: number | null
          losses: number | null
          owner: string | null
          referral_count: number | null
          wins: number | null
        }
        Insert: {
          claimed_for_day?: boolean | null
          coins?: number | null
          created_at?: string
          energy_count?: number | null
          games_played?: number | null
          id?: string
          login_streak?: number | null
          losses?: number | null
          owner?: string | null
          referral_count?: number | null
          wins?: number | null
        }
        Update: {
          claimed_for_day?: boolean | null
          coins?: number | null
          created_at?: string
          energy_count?: number | null
          games_played?: number | null
          id?: string
          login_streak?: number | null
          losses?: number | null
          owner?: string | null
          referral_count?: number | null
          wins?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar: number | null
          created_at: string
          created_game: string | null
          email: string | null
          expo_push_token: string | null
          friend_requests: string[] | null
          friends: string[] | null
          game_invites: Json | null
          games_played: number | null
          games_won: number | null
          highscore: number | null
          id: string
          level: number | null
          online: boolean | null
          password: string | null
          socket_id: string | null
          total_score: number | null
          username: string | null
        }
        Insert: {
          avatar?: number | null
          created_at?: string
          created_game?: string | null
          email?: string | null
          expo_push_token?: string | null
          friend_requests?: string[] | null
          friends?: string[] | null
          game_invites?: Json | null
          games_played?: number | null
          games_won?: number | null
          highscore?: number | null
          id?: string
          level?: number | null
          online?: boolean | null
          password?: string | null
          socket_id?: string | null
          total_score?: number | null
          username?: string | null
        }
        Update: {
          avatar?: number | null
          created_at?: string
          created_game?: string | null
          email?: string | null
          expo_push_token?: string | null
          friend_requests?: string[] | null
          friends?: string[] | null
          game_invites?: Json | null
          games_played?: number | null
          games_won?: number | null
          highscore?: number | null
          id?: string
          level?: number | null
          online?: boolean | null
          password?: string | null
          socket_id?: string | null
          total_score?: number | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_avatar_fkey"
            columns: ["avatar"]
            isOneToOne: false
            referencedRelation: "avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_created_game_fkey"
            columns: ["created_game"]
            isOneToOne: false
            referencedRelation: "created_games"
            referencedColumns: ["id"]
          },
        ]
      }
      words: {
        Row: {
          def: string | null
          id: number
          pos: string | null
          word: string | null
        }
        Insert: {
          def?: string | null
          id?: number
          pos?: string | null
          word?: string | null
        }
        Update: {
          def?: string | null
          id?: number
          pos?: string | null
          word?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increase_referral_count: {
        Args: {
          owner_name: string
        }
        Returns: undefined
      }
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
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
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
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
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
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

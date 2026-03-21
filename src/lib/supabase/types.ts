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
      admin_settings: {
        Row: {
          admin_pin_hash: string
          id: string
          qr_enabled: boolean | null
          recovery_email: string
          staff_pin_hash: string
          updated_at: string | null
        }
        Insert: {
          admin_pin_hash: string
          id?: string
          qr_enabled?: boolean | null
          recovery_email: string
          staff_pin_hash: string
          updated_at?: string | null
        }
        Update: {
          admin_pin_hash?: string
          id?: string
          qr_enabled?: boolean | null
          recovery_email?: string
          staff_pin_hash?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          member_id: string
          method: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          member_id: string
          method: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          member_id?: string
          method?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          created_at: string | null
          department: string | null
          id: string
          name: string
          note: string | null
          personal_pin: string | null
          phone: string | null
          prepaid_balance: number | null
          qr_token: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          id?: string
          name: string
          note?: string | null
          personal_pin?: string | null
          phone?: string | null
          prepaid_balance?: number | null
          qr_token?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          id?: string
          name?: string
          note?: string | null
          personal_pin?: string | null
          phone?: string | null
          prepaid_balance?: number | null
          qr_token?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category: string
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          sort_order: number | null
          temp_type: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price: number
          sort_order?: number | null
          temp_type?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          sort_order?: number | null
          temp_type?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          menu_item_id: string | null
          order_id: string
          quantity: number | null
          unit_price: number
        }
        Insert: {
          id?: string
          menu_item_id?: string | null
          order_id: string
          quantity?: number | null
          unit_price: number
        }
        Update: {
          id?: string
          menu_item_id?: string | null
          order_id?: string
          quantity?: number | null
          unit_price?: number
        }
        Relationships: []
      }
      order_payments: {
        Row: {
          amount: number
          id: string
          method: string
          order_id: string
          transfer_status: string | null
        }
        Insert: {
          amount: number
          id?: string
          method: string
          order_id: string
          transfer_status?: string | null
        }
        Update: {
          amount?: number
          id?: string
          method?: string
          order_id?: string
          transfer_status?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          id: string
          member_id: string
          order_number: number | null
          status: string
          total_price: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          member_id: string
          order_number?: number | null
          status?: string
          total_price: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          member_id?: string
          order_number?: number | null
          status?: string
          total_price?: number
        }
        Relationships: []
      }
      prepaid_topups: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          id: string
          member_id: string
          method: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          member_id: string
          method: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          member_id?: string
          method?: string
        }
        Relationships: []
      }
    }
    Views: {
      member_balances: {
        Row: {
          id: string | null
          name: string | null
          department: string | null
          prepaid_balance: number | null
          credit_balance: number | null
        }
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

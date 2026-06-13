export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          company_name: string | null;
          phone: string | null;
          logo_url: string | null;
          brand_color: string | null;
          credits: number;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          logo_url?: string | null;
          brand_color?: string | null;
          credits?: number;
          created_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          logo_url?: string | null;
          brand_color?: string | null;
          credits?: number;
          created_at?: string;
        };
      };
      shoots: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          type: string;
          ada_no: string;
          parsel_no: string;
          il: string;
          ilce: string;
          latitude: number | null;
          longitude: number | null;
          voiceover_text: string | null;
          audio_url: string | null;
          video_url: string | null;
          logo_url: string | null;
          phone_number: string | null;
          brand_color: string | null;
          nearby_labels: Json | null;
          land_analysis: Json | null;
          view_count: number;
          public_token: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: string;
          type: string;
          ada_no: string;
          parsel_no: string;
          il: string;
          ilce: string;
          latitude?: number | null;
          longitude?: number | null;
          voiceover_text?: string | null;
          audio_url?: string | null;
          video_url?: string | null;
          logo_url?: string | null;
          phone_number?: string | null;
          brand_color?: string | null;
          nearby_labels?: Json | null;
          land_analysis?: Json | null;
          view_count?: number;
          public_token?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          status?: string;
          type?: string;
          ada_no?: string;
          parsel_no?: string;
          il?: string;
          ilce?: string;
          latitude?: number | null;
          longitude?: number | null;
          voiceover_text?: string | null;
          audio_url?: string | null;
          video_url?: string | null;
          logo_url?: string | null;
          phone_number?: string | null;
          brand_color?: string | null;
          nearby_labels?: Json | null;
          land_analysis?: Json | null;
          view_count?: number;
          public_token?: string | null;
          completed_at?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          credits_added: number;
          status: string;
          iyzico_token: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          credits_added: number;
          status?: string;
          iyzico_token?: string | null;
          created_at?: string;
        };
        Update: {
          amount?: number;
          credits_added?: number;
          status?: string;
          iyzico_token?: string | null;
        };
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          payment_id: string;
          pdf_url: string | null;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          payment_id: string;
          pdf_url?: string | null;
          amount: number;
          created_at?: string;
        };
        Update: {
          payment_id?: string;
          pdf_url?: string | null;
          amount?: number;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          college: string;
          course: string;
          year: number;
          cgpa: number;
          skills: string[];
          experience: string;
          resume: string;
          status: 'active' | 'shortlisted' | 'selected' | 'rejected';
          applied_positions: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['students']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['students']['Insert']>;
      };
      call_logs: {
        Row: {
          id: string;
          student_id: string | null;
          tpo_id: string | null;
          contact_type: 'student' | 'tpo';
          duration: number;
          status: 'completed' | 'missed' | 'scheduled';
          notes: string;
          transcript: any[];
          jotform_sent: boolean;
          scheduled_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['call_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['call_logs']['Insert']>;
      };
    };
  };
}
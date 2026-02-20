import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ReleaseNote = {
  id: string;
  title: string;
  content: string;
  version: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  is_visible: boolean;
  cover_image?: string;
};
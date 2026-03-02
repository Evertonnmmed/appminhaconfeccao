import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://jzdxvozjvejryuqedmaj.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6ZHh2b3pqdmVqcnl1cWVkbWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTIyOTAsImV4cCI6MjA4Nzg2ODI5MH0.avhJuRnUWjhbBjl-ZpEy84Emc85xi6ksgnT0tCsJr6E';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and Anon Key are missing. Please set them in your environment variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

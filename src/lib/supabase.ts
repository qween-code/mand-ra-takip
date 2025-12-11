import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = 'https://dzfxbzuvdwsbprdclphv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZnhienV2ZHdzYnByZGNscGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MTcxMzgsImV4cCI6MjA4MDk5MzEzOH0.BBu6W7JOnU_iL6DJ2Z7ont44bibqAJkpalOW9Mu-yI0';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

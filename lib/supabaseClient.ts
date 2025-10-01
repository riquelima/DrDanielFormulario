import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xjuonkerexxoarcuqwqv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdW9ua2VyZXh4b2FyY3Vxd3F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDkyMDIsImV4cCI6MjA3MjQyNTIwMn0.SOaG1QOR6AoaezO8DqYTasKF9ohfc-gp8z-9oZBQQYE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

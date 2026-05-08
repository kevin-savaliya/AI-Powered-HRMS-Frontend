import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase Project URL and Anon Key from Project Settings > API
const supabaseUrl = 'https://icqggmrajgrvglgqicqz.supabase.co';
const supabaseKey = 'sb_publishable_1stIOzh1b4AScTxvRpXZ5g_X-UAOlb3';

export const supabase = createClient(supabaseUrl, supabaseKey);
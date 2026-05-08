
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    console.log('Checking knowledge_base count...');
    try {
        const { data, count, error } = await supabase
            .from('knowledge_base')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Error:', error.message);
        } else {
            console.log('Current row count:', count);
        }
    } catch (e) {
        console.error('Exception:', e.message);
    }
}
check();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_API_KEY!);

export async function test() {
    // base:  [ { username: 'username1', time: 67.69 } ]
    // after insert: [
    //   { username: 'username1', time: 67.69 },
    //   { username: 'Tymon', time: 4.86 }
    // ]
    // updated: [
    //   { username: 'username1', time: 67.69 },
    //   { username: 'Tymon', time: 4.67 }
    // ]

    {
        let { data, error } = await supabase.from('leaderboard').delete().eq('username', 'Tymon');
        if (error) {
            console.log('Failed to delete');
        }
    }
    {
        let { data, error } = await supabase.from('leaderboard').select();
        if (error) {
            console.log('Failed to fetch');
            return;
        } else {
            console.log('base: ', data);
        }
    }
    {
        let { data, error } = await supabase.from('leaderboard').insert({ username: 'Tymon', time: 4.86 });
        if (error) {
            console.log('Failed to insert');
            return;
        }
    }
    {
        let { data, error } = await supabase.from('leaderboard').select();
        if (error) {
            console.log('Failed to fetch');
            return;
        } else {
            console.log('after insert:', data);
        }
    }
    {
        let { data, error } = await supabase.from('leaderboard').upsert({ username: 'Tymon', time: 4.67 }).select();
        if (error) {
            console.log('Failed to replace');
            return;
        }
    }
    {
        let { data, error } = await supabase.from('leaderboard').select();
        if (error) {
            console.log('Failed to fetch');
            return;
        } else {
            console.log('updated:', data);
        }
    }

}

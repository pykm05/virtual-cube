import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_API_KEY!);

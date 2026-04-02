import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vtvpjwxqdreiugehjtuv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0dnBqd3hxZHJlaXVnZWhqdHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMDY5NTksImV4cCI6MjA5MDY4Mjk1OX0.h-Sz2zR3xrIwZpgJz-qBkd44h2gfP1mjTLRP3mJJ0yU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 클라이언트 전용 Supabase 클라이언트
export const supabase = createBrowserClient(supabaseUrl || '', supabaseAnonKey || '');



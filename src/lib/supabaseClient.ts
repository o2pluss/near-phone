import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 서버 환경에서 import 시 window 접근으로 인한 크래시를 방지
// 클라이언트에서만 실제 브라우저 클라이언트를 생성
export const supabase =
  typeof window !== 'undefined'
    ? createBrowserClient(supabaseUrl || '', supabaseAnonKey || '')
    : (new Proxy({}, {
        get() {
          throw new Error('Supabase browser client is not available on the server runtime');
        }
      }) as any);



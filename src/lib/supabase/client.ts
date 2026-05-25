import { createBrowserClient } from '@supabase/ssr'

// 浏览器端用的 Supabase client（登录、读写数据）
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

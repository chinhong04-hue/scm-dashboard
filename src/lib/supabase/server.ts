import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 服务器端用的 Supabase client（验证身份、保护页面）
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component 里无法 set cookie，忽略即可
          }
        },
      },
    }
  )
}

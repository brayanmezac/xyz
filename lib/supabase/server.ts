import { createClient, type SupabaseClientOptions } from "@supabase/supabase-js"
import { cookies } from "next/headers"


export const getSupabaseServer = async () => {
  const cookieStore = await cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", 
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: {
          getItem: (key: string) => cookieStore.get(key)?.value,
          setItem: () => {},
          removeItem: () => {}
        }
      }
    } as SupabaseClientOptions<"public">
  )
}


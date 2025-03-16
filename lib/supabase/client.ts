"use client"

import { createClient } from "@supabase/supabase-js"

// Creamos un cliente de Supabase para usar en el navegador
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Crear un singleton para evitar múltiples instancias
let clientInstance: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (clientInstance) return clientInstance

  clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true },
  })

  return clientInstance
}


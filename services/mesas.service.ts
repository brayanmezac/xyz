"use server"

import { getSupabaseServer } from "@/lib/supabase/server"

interface Mesa {
  id: number
  numero: number
  estado: string
  updated_at?: string
  created_at?: string
}

export async function getAllMesas(): Promise<Mesa[]> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase.from("mesas").select("*").order("numero")

  if (error) {
    console.error("Error fetching mesas:", error)
    return []
  }

  return data as Mesa[]
}

export async function getMesaById(id: number): Promise<Mesa | null> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase.from("mesas").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching mesa ${id}:`, error)
    return null
  }

  return data as Mesa
}

export async function createMesa(mesa: Omit<Mesa, 'id' | 'created_at' | 'updated_at'>): Promise<Mesa> {
  const supabase = await getSupabaseServer()

  // Verificar si ya existe una mesa con el mismo número
  const { data: existing, error: checkError } = await supabase
    .from("mesas")
    .select("id")
    .eq("numero", mesa.numero)
    .maybeSingle()

  if (checkError) {
    console.error("Error checking existing mesa:", checkError)
    throw new Error(`Error al verificar si la mesa existe: ${checkError.message}`)
  }

  if (existing) {
    throw new Error(`Ya existe una mesa con el número ${mesa.numero}`)
  }

  const { data, error } = await supabase.from("mesas").insert([mesa]).select()

  if (error) {
    console.error("Error creating mesa:", error)
    throw new Error(`Error al crear mesa: ${error.message}`)
  }

  return data[0] as Mesa
}

export async function updateMesaEstado(id: number, estado: string): Promise<Mesa> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("mesas")
    .update({ estado, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()

  if (error) {
    console.error(`Error updating mesa ${id}:`, error)
    throw new Error(`Error al actualizar estado de mesa: ${error.message}`)
  }

  return data[0] as Mesa
}

export async function deleteMesa(id: number): Promise<boolean> {
  const supabase = await getSupabaseServer()

  const { error } = await supabase.from("mesas").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting mesa ${id}:`, error)
    throw new Error(`Error al eliminar mesa: ${error.message}`)
  }

  return true
}


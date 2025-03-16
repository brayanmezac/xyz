"use server"

import { getSupabaseServer } from "@/lib/supabase/server"
import { Producto } from "../types/producto"

export async function getAllProductos() {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase.from("productos").select("*").order("nombre")

  if (error) {
    console.error("Error fetching productos:", error)
    return []
  }

  return data
}

export async function getProductoById(id: number) {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase.from("productos").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching producto ${id}:`, error)
    return null
  }

  return data
}

export async function createProducto(producto: Producto): Promise<Producto> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase.from("productos").insert([producto]).select()

  if (error) {
    console.error("Error creating producto:", error)
    throw new Error(`Error al crear producto: ${error.message}`)
  }

  return data[0]
}

export async function updateProducto(id: number, producto: Partial<Producto>): Promise<Producto> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase.from("productos").update(producto).eq("id", id).select()

  if (error) {
    console.error(`Error updating producto ${id}:`, error)
    throw new Error(`Error al actualizar producto: ${error.message}`)
  }

  return data[0]
}

export async function deleteProducto(id: number) {
  const supabase = await getSupabaseServer()

  const { error } = await supabase.from("productos").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting producto ${id}:`, error)
    throw new Error(`Error al eliminar producto: ${error.message}`)
  }

  return true
}


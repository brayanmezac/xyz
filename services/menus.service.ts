"use server"

import { getSupabaseServer } from "@/lib/supabase/server"

export async function getMenuByDia(dia: string) {
  const supabase = await getSupabaseServer()

  // Primero obtenemos el ID del menú para el día especificado
  const { data: menu, error: menuError } = await supabase.from("menus").select("id").eq("dia_semana", dia).single()

  if (menuError) {
    console.error(`Error fetching menu for day ${dia}:`, menuError)
    return []
  }

  if (!menu) return []

  // Luego obtenemos los productos asociados a ese menú
  const { data: menuProductos, error: productosError } = await supabase
    .from("menu_productos")
    .select("producto_id")
    .eq("menu_id", menu.id)

  if (productosError) {
    console.error(`Error fetching productos for menu ${menu.id}:`, productosError)
    return []
  }

  if (!menuProductos.length) return []

  // Finalmente obtenemos los detalles de los productos
  const productoIds = menuProductos.map((item) => item.producto_id)

  const { data: productos, error: detailsError } = await supabase.from("productos").select("*").in("id", productoIds)

  if (detailsError) {
    console.error(`Error fetching producto details:`, detailsError)
    return []
  }

  return productos
}

export async function getMenusWithProductos() {
  const supabase = await getSupabaseServer()

  // Obtenemos todos los menús
  const { data: menus, error: menusError } = await supabase.from("menus").select("*").order("id")

  if (menusError) {
    console.error("Error fetching menus:", menusError)
    return {}
  }

  const result: Record<string, number[]> = {}

  // Para cada menú, obtenemos los IDs de los productos asociados
  for (const menu of menus) {
    const { data: menuProductos, error: productosError } = await supabase
      .from("menu_productos")
      .select("producto_id")
      .eq("menu_id", menu.id)

    if (productosError) {
      console.error(`Error fetching productos for menu ${menu.id}:`, productosError)
      result[menu.dia_semana] = []
      continue
    }

    result[menu.dia_semana] = menuProductos.map((item) => item.producto_id)
  }

  return result
}

export async function addProductoToMenu(menuDia: string, productoId: number) {
  const supabase = await getSupabaseServer()

  // Primero obtenemos el ID del menú
  const { data: menu, error: menuError } = await supabase.from("menus").select("id").eq("dia_semana", menuDia).single()

  if (menuError) {
    console.error(`Error fetching menu for day ${menuDia}:`, menuError)
    throw new Error(`Error al buscar el menú: ${menuError.message}`)
  }

  // Verificamos si el producto ya está en el menú
  const { data: existing, error: existingError } = await supabase
    .from("menu_productos")
    .select("*")
    .eq("menu_id", menu.id)
    .eq("producto_id", productoId)

  if (existingError) {
    console.error(`Error checking if product is already in menu:`, existingError)
    throw new Error(`Error al verificar el producto: ${existingError.message}`)
  }

  if (existing && existing.length > 0) {
    throw new Error("Este producto ya está en el menú")
  }

  // Agregamos el producto al menú
  const { error: insertError } = await supabase
    .from("menu_productos")
    .insert([{ menu_id: menu.id, producto_id: productoId }])

  if (insertError) {
    console.error(`Error adding product to menu:`, insertError)
    throw new Error(`Error al agregar producto al menú: ${insertError.message}`)
  }

  return true
}

export async function removeProductoFromMenu(menuDia: string, productoId: number) {
  const supabase = await getSupabaseServer()

  // Primero obtenemos el ID del menú
  const { data: menu, error: menuError } = await supabase.from("menus").select("id").eq("dia_semana", menuDia).single()

  if (menuError) {
    console.error(`Error fetching menu for day ${menuDia}:`, menuError)
    throw new Error(`Error al buscar el menú: ${menuError.message}`)
  }

  // Eliminamos el producto del menú
  const { error: deleteError } = await supabase
    .from("menu_productos")
    .delete()
    .eq("menu_id", menu.id)
    .eq("producto_id", productoId)

  if (deleteError) {
    console.error(`Error removing product from menu:`, deleteError)
    throw new Error(`Error al eliminar producto del menú: ${deleteError.message}`)
  }

  return true
}


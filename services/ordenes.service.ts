"use server"

import { getSupabaseServer } from "@/lib/supabase/server"
import { Orden, OrdenData, ProductoOrden } from "@/types/orden"

export async function getAllOrdenes(): Promise<Orden[]> {
  const supabase = await getSupabaseServer()

  const { data: ordenes, error: ordenesError } = await supabase
    .from("ordenes")
    .select(`
      *,
      cliente:cliente_id(*),
      mesa:mesa_id(*)
    `)
    .order("created_at", { ascending: false })

  if (ordenesError) {
    console.error("Error fetching ordenes:", ordenesError)
    return []
  }

  // Para cada orden, obtenemos los productos asociados
  const ordenesCompletas = await Promise.all(
    ordenes.map(async (orden) => {
      const { data: ordenProductos, error: productosError } = await supabase
        .from("orden_productos")
        .select(`
          *,
          producto:producto_id(*)
        `)
        .eq("orden_id", orden.id)

      if (productosError) {
        console.error(`Error fetching productos for orden ${orden.id}:`, productosError)
        return { ...orden, productos: [] }
      }

      // Transformamos los datos para que sean compatibles con la interfaz existente
      const productos = ordenProductos.map((op) => ({
        id: op.producto.id,
        nombre: op.producto.nombre,
        precio: op.precio_unitario,
        cantidad: op.cantidad,
        iva: op.producto.iva,
      }))

      return { ...orden, productos }
    }),
  )

  return ordenesCompletas
}

export async function getOrdenById(id: number): Promise<Orden | null> {
  const supabase = await getSupabaseServer()

  const { data: orden, error: ordenError } = await supabase
    .from("ordenes")
    .select(`
      *,
      cliente:cliente_id(*),
      mesa:mesa_id(*)
    `)
    .eq("id", id)
    .single()

  if (ordenError) {
    console.error(`Error fetching orden ${id}:`, ordenError)
    return null
  }

  const { data: ordenProductos, error: productosError } = await supabase
    .from("orden_productos")
    .select(`
      *,
      producto:producto_id(*)
    `)
    .eq("orden_id", id)

  if (productosError) {
    console.error(`Error fetching productos for orden ${id}:`, productosError)
    return { ...orden, productos: [] }
  }

  const productos = ordenProductos.map((op) => ({
    id: op.producto.id,
    nombre: op.producto.nombre,
    precio: op.precio_unitario,
    cantidad: op.cantidad,
    iva: op.producto.iva,
  }))

  return { ...orden, productos }
}

export async function createOrden(ordenData: OrdenData): Promise<Orden> {
  const supabase = await getSupabaseServer()

  // Primero creamos o actualizamos el cliente
  const cliente = ordenData.cliente
  let clienteId

  // Verificamos si el cliente ya existe
  const { data: clienteExistente, error: clienteCheckError } = await supabase
    .from("clientes")
    .select("id")
    .eq("tipo_identificacion", cliente.tipoIdentificacion)
    .eq("numero_identificacion", cliente.numeroIdentificacion)
    .maybeSingle()

  if (clienteCheckError) {
    console.error("Error checking cliente:", clienteCheckError)
    throw new Error(`Error al verificar cliente: ${clienteCheckError.message}`)
  }

  if (clienteExistente) {
    // Actualizamos el cliente existente
    const { error: updateError } = await supabase
      .from("clientes")
      .update({
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        updated_at: new Date().toISOString(),
      })
      .eq("id", clienteExistente.id)

    if (updateError) {
      console.error("Error updating cliente:", updateError)
      throw new Error(`Error al actualizar cliente: ${updateError.message}`)
    }

    clienteId = clienteExistente.id
  } else {
    // Creamos un nuevo cliente
    const { data: nuevoCliente, error: createError } = await supabase
      .from("clientes")
      .insert([
        {
          nombre: cliente.nombre,
          tipo_identificacion: cliente.tipoIdentificacion,
          numero_identificacion: cliente.numeroIdentificacion,
          telefono: cliente.telefono,
        },
      ])
      .select()

    if (createError) {
      console.error("Error creating cliente:", createError)
      throw new Error(`Error al crear cliente: ${createError.message}`)
    }

    clienteId = nuevoCliente[0].id
  }

  // Obtenemos la mesa
  const { data: mesa, error: mesaError } = await supabase
    .from("mesas")
    .select("id")
    .eq("numero", ordenData.mesa)
    .single()

  if (mesaError) {
    console.error(`Error fetching mesa ${ordenData.mesa}:`, mesaError)
    throw new Error(`Error al buscar mesa: ${mesaError.message}`)
  }

  // Actualizamos el estado de la mesa a "Ocupada"
  await updateMesaEstado(mesa.id, "Ocupada")

  // Creamos la orden
  const { data: nuevaOrden, error: ordenError } = await supabase
    .from("ordenes")
    .insert([
      {
        cliente_id: clienteId,
        mesa_id: mesa.id,
        subtotal: ordenData.subtotal,
        iva: ordenData.iva,
        impuesto_consumo: ordenData.impuestoConsumo,
        total: ordenData.total,
        estado: "Nuevo pedido",
      },
    ])
    .select()

  if (ordenError) {
    console.error("Error creating orden:", ordenError)
    throw new Error(`Error al crear orden: ${ordenError.message}`)
  }

  const ordenId = nuevaOrden[0].id

  // Creamos los registros de productos de la orden
  const ordenProductos = ordenData.productos.map((p: ProductoOrden) => ({
    orden_id: ordenId,
    producto_id: p.id,
    cantidad: p.cantidad,
    precio_unitario: p.precio,
    iva_unitario: p.precio * ((p.iva ?? 0) / 100),
    subtotal: p.precio * p.cantidad,
  }))

  const { error: productosError } = await supabase.from("orden_productos").insert(ordenProductos)

  if (productosError) {
    console.error("Error creating orden_productos:", productosError)
    throw new Error(`Error al registrar productos de la orden: ${productosError.message}`)
  }

  return nuevaOrden[0]
}

export async function updateOrdenEstado(id: string, estado: string): Promise<Orden> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("ordenes")
    .update({
      estado,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error(`Error updating orden ${id}:`, error)
    throw new Error(`Error al actualizar estado de orden: ${error.message}`)
  }

  // Si la orden se marca como completada o cancelada, liberamos la mesa
  if (estado === "Completado" || estado === "Cancelado") {
    const { data: orden } = await supabase.from("ordenes").select("mesa_id").eq("id", id).single()

    if (orden) {
      await updateMesaEstado(orden.mesa_id, "Libre")
    }
  }

  return data[0]
}

// Función auxiliar para actualizar el estado de la mesa
async function updateMesaEstado(id: number, estado: string): Promise<boolean> {
  const supabase = await getSupabaseServer()

  const { error } = await supabase.from("mesas").update({ estado, updated_at: new Date().toISOString() }).eq("id", id)

  if (error) {
    console.error(`Error updating mesa ${id}:`, error)
    throw new Error(`Error al actualizar estado de mesa: ${error.message}`)
  }

  return true
}


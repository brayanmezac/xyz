export interface Cliente {
  nombre: string
  tipoIdentificacion: string
  numeroIdentificacion: string
  telefono: string
}

export interface ProductoOrden {
  id: number
  nombre: string
  precio: number
  cantidad: number
  iva: number
}

export interface OrdenData {
  cliente: Cliente
  mesa: number
  subtotal: number
  iva: number
  impuestoConsumo: number
  total: number
  productos: ProductoOrden[]
}

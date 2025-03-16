export interface Cliente {
  id?: number;
  nombre: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  telefono: string;
}

export interface Mesa {
  id?: number;
  numero: number;
  estado?: string;
}

export interface Producto {
  id?: number;
  nombre: string;
  precio: number;
  cantidad: number;
  iva?: number;
}

export interface ProductoOrden extends Producto {
  precio_unitario?: number;
  iva_unitario?: number;
  subtotal?: number;
}

export interface Orden {
  id: string;
  fecha: string;
  mesa: Mesa;
  cliente: Cliente;
  productos: ProductoOrden[];
  estado: string;
  subtotal: number;
  iva: number;
  impuesto_consumo: number;
  total: number;
  created_at?: string;
  updated_at?: string;
}

export interface OrdenData {
  mesa: number;
  cliente: {
    nombre: string;
    tipoIdentificacion: string;
    numeroIdentificacion: string;
    telefono: string;
  };
  productos: ProductoOrden[];
  subtotal: number;
  iva: number;
  impuestoConsumo: number;
  total: number;
}

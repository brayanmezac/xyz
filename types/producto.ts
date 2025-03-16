export interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock?: number;
  categoria?: string;
  imagen_url?: string;
  created_at?: string;
  iva: number;
  tiempo_preparacion: number;
  imagen: string;
}

export interface ProductoCarrito extends Producto {
  cantidad: number;
}

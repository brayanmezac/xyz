"use client"

import { createContext, useContext, useState } from "react"
import { ReactNode } from "react"
import { Producto, ProductoCarrito } from "../types/producto"

interface CarritoContextType {
  productos: ProductoCarrito[];
  agregarProducto: (producto: Producto) => void;
  actualizarCantidad: (id: number, cantidad: number) => void;
  eliminarProducto: (id: number) => void;
  vaciarCarrito: () => void;
  totalProductos: number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined)

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [productos, setProductos] = useState<ProductoCarrito[]>([])

  const agregarProducto = (producto: Producto) => {
    setProductos((prevProductos: ProductoCarrito[]) => {
      // Verificar si el producto ya está en el carrito
      const productoExistente = prevProductos.find((p) => p.id === producto.id)

      if (productoExistente) {
        // Actualizar la cantidad si ya existe
        return prevProductos.map((p) => (p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p))
      } else {
        // Agregar el producto con cantidad 1
        return [...prevProductos, { ...producto, cantidad: 1 }]
      }
    })
  }

  const actualizarCantidad = (id: number, cantidad: number) => {
    setProductos((prevProductos: ProductoCarrito[]) => prevProductos.map((p: ProductoCarrito) => (p.id === id ? { ...p, cantidad } : p)))
  }

  const eliminarProducto = (id: number) => {
    setProductos((prevProductos: ProductoCarrito[]) => prevProductos.filter((p: ProductoCarrito) => p.id !== id))
  }

  const vaciarCarrito = () => {
    setProductos([])
  }

  const totalProductos = productos.reduce((total, producto) => total + producto.cantidad, 0)

  return (
    <CarritoContext.Provider
      value={{
        productos,
        agregarProducto,
        actualizarCantidad,
        eliminarProducto,
        vaciarCarrito,
        totalProductos,
      }}
    >
      {children}
    </CarritoContext.Provider>
  )
}

export function useCarrito() {
  const context = useContext(CarritoContext)
  if (context === undefined) {
    throw new Error("useCarrito debe usarse dentro de un CarritoProvider")
  }
  return context
}


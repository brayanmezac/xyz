"use client"

import { createContext, useContext, useState } from "react"

const CarritoContext = createContext(undefined)

export function CarritoProvider({ children }) {
  const [productos, setProductos] = useState([])

  const agregarProducto = (producto) => {
    setProductos((prevProductos) => {
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

  const actualizarCantidad = (id, cantidad) => {
    setProductos((prevProductos) => prevProductos.map((p) => (p.id === id ? { ...p, cantidad } : p)))
  }

  const eliminarProducto = (id) => {
    setProductos((prevProductos) => prevProductos.filter((p) => p.id !== id))
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


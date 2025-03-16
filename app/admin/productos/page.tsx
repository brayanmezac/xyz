"use client"

import { useState, useEffect } from "react"
import type { Producto } from "@/types/producto"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { PlusIcon, Pencil, Trash2 } from "lucide-react"
import { getAllProductos, createProducto, updateProducto, deleteProducto } from "@/services/productos.service"

type ProductoForm = Omit<Producto, 'stock' | 'categoria' | 'imagen_url' | 'created_at'> & {
  id: number;
};

export default function ProductosPage() {
  const { toast } = useToast()
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [productoActual, setProductoActual] = useState<ProductoForm>({
    id: 0,
    nombre: "",
    descripcion: "",
    precio: 0,
    iva: 19,
    tiempo_preparacion: 0,
    imagen: "/placeholder.svg?height=200&width=300",
  })
  const [modo, setModo] = useState("crear")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true)
        const data = await getAllProductos()
        setProductos(data)
      } catch (error) {
        console.error("Error al cargar productos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProductos()
  }, [toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProductoActual({
      ...productoActual,
      [name]: name === "precio" || name === "iva" || name === "tiempo_preparacion" ? Number.parseFloat(value) : value,
    })
  }

  const handleCrearProducto = () => {
    setModo("crear")
    setProductoActual({
      id: 0,
      nombre: "",
      descripcion: "",
      precio: 0,
      iva: 19,
      tiempo_preparacion: 0,
      imagen: "/placeholder.svg?height=200&width=300",
    })
    setDialogOpen(true)
  }

  const handleEditarProducto = (producto: ProductoForm) => {
    setModo("editar")
    setProductoActual(producto)
    setDialogOpen(true)
  }

  const handleEliminarProducto = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        setActionLoading(true)
        await deleteProducto(id)
        setProductos(productos.filter((producto) => producto.id !== id))
        toast({
          title: "Producto eliminado",
          description: "El producto ha sido eliminado correctamente",
        })
      } catch (error) {
        console.error("Error al eliminar producto:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el producto",
          variant: "destructive",
        })
      } finally {
        setActionLoading(false)
      }
    }
  }

  const handleGuardarProducto = async () => {
    if (!productoActual.nombre || !productoActual.descripcion || productoActual.precio <= 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    try {
      setActionLoading(true)

      if (modo === "crear") {
        const nuevoProducto = await createProducto(productoActual)
        setProductos([...productos, nuevoProducto])
        toast({
          title: "Producto creado",
          description: "El producto ha sido creado correctamente",
        })
      } else {
        const productoActualizado = await updateProducto(productoActual.id, productoActual)
        setProductos(productos.map((p) => (p.id === productoActual.id ? productoActualizado : p)))
        toast({
          title: "Producto actualizado",
          description: "El producto ha sido actualizado correctamente",
        })
      }

      setDialogOpen(false)
    } catch (error) {
      console.error("Error al guardar producto:", error)
      toast({
        title: "Error",
        description: (error instanceof Error ? error.message : "No se pudo guardar el producto"),
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const calcularPrecioConIVA = (precio: number, iva: number): number => {
    return precio * (1 + iva / 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Productos</h2>
          <p className="text-muted-foreground">Gestiona los productos disponibles en el menú</p>
        </div>
        <Button onClick={handleCrearProducto} disabled={actionLoading}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>{productos.length} productos en total</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio sin IVA</TableHead>
                  <TableHead>IVA</TableHead>
                  <TableHead>Precio con IVA</TableHead>
                  <TableHead>Tiempo Prep.</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.map((producto) => {
                  if (!producto.id) return null;
                  const productoWithId: ProductoForm = {
                    ...producto,
                    id: producto.id
                  };

                  return (
                    <TableRow key={producto.id}>
                      <TableCell className="font-medium">{producto.id}</TableCell>
                      <TableCell>{producto.nombre}</TableCell>
                      <TableCell>${Number.parseFloat(producto.precio.toString()).toLocaleString()}</TableCell>
                      <TableCell>{producto.iva}%</TableCell>
                      <TableCell>${calcularPrecioConIVA(producto.precio, producto.iva).toLocaleString()}</TableCell>
                      <TableCell>{producto.tiempo_preparacion} min</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditarProducto(productoWithId)}
                            disabled={actionLoading}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEliminarProducto(productoWithId.id)}
                            disabled={actionLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{modo === "crear" ? "Crear Producto" : "Editar Producto"}</DialogTitle>
            <DialogDescription>Completa los detalles del producto y guarda los cambios</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={productoActual.nombre}
                  onChange={handleInputChange}
                  placeholder="Nombre del producto"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="precio">Precio (sin IVA)</Label>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  value={productoActual.precio}
                  onChange={handleInputChange}
                  placeholder="Precio sin IVA"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="iva">IVA (%)</Label>
                <Input
                  id="iva"
                  name="iva"
                  type="number"
                  value={productoActual.iva}
                  onChange={handleInputChange}
                  placeholder="Porcentaje de IVA"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tiempo_preparacion">Tiempo de Preparación (min)</Label>
                <Input
                  id="tiempo_preparacion"
                  name="tiempo_preparacion"
                  type="number"
                  value={productoActual.tiempo_preparacion}
                  onChange={handleInputChange}
                  placeholder="Tiempo en minutos"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                value={productoActual.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción del producto"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imagen">URL de la imagen</Label>
              <Input
                id="imagen"
                name="imagen"
                value={productoActual.imagen}
                onChange={handleInputChange}
                placeholder="URL de la imagen"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={actionLoading}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarProducto} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { PlusIcon, XIcon } from "lucide-react"
import Image from "next/image"
import { getMenusWithProductos, addProductoToMenu, removeProductoFromMenu } from "@/services/menus.service"
import { getAllProductos } from "@/services/productos.service"

interface Producto {
  id: number
  nombre: string
  precio: number
  imagen?: string
  iva: number
}

export default function MenusPage() {
  const { toast } = useToast()
  const [menus, setMenus] = useState<Record<string, number[]>>({})
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [diaSeleccionado, setDiaSeleccionado] = useState("lunes")
  const [productoSeleccionado, setProductoSeleccionado] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const diasSemana = [
    { valor: "lunes", etiqueta: "Lunes" },
    { valor: "martes", etiqueta: "Martes" },
    { valor: "miercoles", etiqueta: "Miércoles" },
    { valor: "jueves", etiqueta: "Jueves" },
    { valor: "viernes", etiqueta: "Viernes" },
    { valor: "sabado", etiqueta: "Sábado" },
    { valor: "domingo", etiqueta: "Domingo" },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Cargar menús
        const menuData = await getMenusWithProductos()
        setMenus(menuData)

        // Cargar productos
        const productos = await getAllProductos()
        setProductosDisponibles(productos)
      } catch (error) {
        console.error("Error al cargar datos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleAgregarProducto = async () => {
    if (!productoSeleccionado) {
      toast({
        title: "Error",
        description: "Por favor selecciona un producto",
        variant: "destructive",
      })
      return
    }

    const idProducto = Number.parseInt(productoSeleccionado)

    // Verificar si el producto ya está en el menú del día
    if (menus[diaSeleccionado].includes(idProducto)) {
      toast({
        title: "Producto duplicado",
        description: "Este producto ya está en el menú del día seleccionado",
        variant: "destructive",
      })
      return
    }

    try {
      setActionLoading(true)
      // Agregar producto al menú del día
      await addProductoToMenu(diaSeleccionado, idProducto)

      // Actualizar estado local
      setMenus({
        ...menus,
        [diaSeleccionado]: [...menus[diaSeleccionado], idProducto],
      })

      toast({
        title: "Producto agregado",
        description: "El producto ha sido agregado al menú correctamente",
      })

      setDialogOpen(false)
      setProductoSeleccionado("")
    } catch (error) {
      console.error("Error al agregar producto al menú:", error)
      toast({
        title: "Error",
        description: (error instanceof Error ? error.message : "No se pudo agregar el producto al menú"),
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  interface HandleEliminarProductoParams {
    dia: string
    idProducto: number
  }

  const handleEliminarProducto = async ({ dia, idProducto }: HandleEliminarProductoParams): Promise<void> => {
    try {
      setActionLoading(true)
      // Eliminar producto del menú
      await removeProductoFromMenu(dia, idProducto)

      // Actualizar estado local
      setMenus({
        ...menus,
        [dia]: menus[dia].filter((id) => id !== idProducto),
      })

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado del menú correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar producto del menú:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto del menú",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getProductoPorId = (id: number): Producto | undefined => {
    return productosDisponibles.find((producto) => producto.id === id)
  }

  const productosNoEnMenu = productosDisponibles.filter((producto) => !menus[diaSeleccionado]?.includes(producto.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Menús Semanales</h2>
          <p className="text-muted-foreground">Gestiona los menús disponibles para cada día de la semana</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <Tabs defaultValue="lunes" onValueChange={setDiaSeleccionado}>
          <TabsList className="grid w-full grid-cols-7">
            {diasSemana.map((dia) => (
              <TabsTrigger key={dia.valor} value={dia.valor}>
                {dia.etiqueta}
              </TabsTrigger>
            ))}
          </TabsList>

          {diasSemana.map((dia) => (
            <TabsContent key={dia.valor} value={dia.valor}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Menú del {dia.etiqueta}</CardTitle>
                    <CardDescription>{menus[dia.valor]?.length || 0} productos en el menú</CardDescription>
                  </div>
                  <Button onClick={() => setDialogOpen(true)} disabled={actionLoading}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Agregar Producto
                  </Button>
                </CardHeader>
                <CardContent>
                  {menus[dia.valor]?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {menus[dia.valor].map((idProducto) => {
                        const producto = getProductoPorId(idProducto)
                        return producto ? (
                          <div key={producto.id} className="relative flex items-center space-x-4 rounded-lg border p-4">
                            <div className="relative h-16 w-16 overflow-hidden rounded">
                              <Image
                                src={producto.imagen || "/placeholder.svg"}
                                alt={producto.nombre}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 space-y-1">
                              <h4 className="font-semibold">{producto.nombre}</h4>
                              <p className="text-sm text-muted-foreground">
                                ${Number.parseFloat(producto.precio.toString()).toLocaleString()} + IVA ({producto.iva}%)
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-2"
                              onClick={() => handleEliminarProducto({ dia: dia.valor, idProducto: producto.id })}
                              disabled={actionLoading}
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : null
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <p className="text-center text-muted-foreground">No hay productos en el menú para este día</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setDialogOpen(true)}
                        disabled={actionLoading}
                      >
                        Agregar Producto
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Producto al Menú</DialogTitle>
            <DialogDescription>
              Selecciona un producto para agregar al menú del{" "}
              {diasSemana.find((d) => d.valor === diaSeleccionado)?.etiqueta}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={productoSeleccionado} onValueChange={setProductoSeleccionado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un producto" />
              </SelectTrigger>
              <SelectContent>
                {productosNoEnMenu.map((producto) => (
                  <SelectItem key={producto.id} value={producto.id.toString()}>
                    {producto.nombre} - ${Number.parseFloat(producto.precio.toString()).toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={actionLoading}>
              Cancelar
            </Button>
            <Button onClick={handleAgregarProducto} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Agregando...
                </>
              ) : (
                "Agregar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


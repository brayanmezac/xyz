"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusIcon, ShoppingCartIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useCarrito } from "@/hooks/use-carrito"
import { getDayName } from "@/lib/utils"
import { getMenuByDia } from "@/services/menus.service"

interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio: number
  iva: number
  imagen: string
  tiempo_preparacion: number
}

interface UseCarrito {
  agregarProducto: (producto: Producto) => void;
  totalProductos: number;
}

export default function MenuPage() {
  const { toast } = useToast()
  const { agregarProducto, totalProductos } = useCarrito() as UseCarrito
  const [diaActual, setDiaActual] = useState<string>("lunes")
  const [menuDelDia, setMenuDelDia] = useState<Producto[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // Obtener el día actual
    const hoy = new Date()
    const diaSemana = getDayName(hoy.getDay())
    setDiaActual(diaSemana)

    // Cargar menú del día
    const fetchMenu = async () => {
      try {
        setLoading(true)
        const menu = await getMenuByDia(diaSemana)
        setMenuDelDia(menu)
      } catch (error) {
        console.error("Error al cargar el menú:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el menú del día",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [toast])

  const handleAgregarAlCarrito = (producto: Producto): void => {
    agregarProducto(producto)
    toast({
      title: "Producto agregado",
      description: `${producto.nombre} se ha agregado al carrito`,
    })
  }

  const calcularPrecioConIVA = (precio: number, iva: number): number => {
    return precio * (1 + iva / 100)
  }

  const handleChangeDay = async (dia: string): Promise<void> => {
    try {
      setLoading(true)
      const menu = await getMenuByDia(dia)
      setMenuDelDia(menu)
    } catch (error) {
      console.error(`Error al cargar el menú del ${dia}:`, error)
      toast({
        title: "Error",
        description: `No se pudo cargar el menú del ${dia}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menú del Día</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Link href="/pedido">
          <Button variant="outline" className="flex items-center gap-2">
            <ShoppingCartIcon className="h-4 w-4" />
            <span>Carrito ({totalProductos})</span>
          </Button>
        </Link>
      </div>

      <Tabs defaultValue={diaActual} className="w-full" onValueChange={handleChangeDay}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="lunes">Lunes</TabsTrigger>
          <TabsTrigger value="martes">Martes</TabsTrigger>
          <TabsTrigger value="miercoles">Miércoles</TabsTrigger>
          <TabsTrigger value="jueves">Jueves</TabsTrigger>
          <TabsTrigger value="viernes">Viernes</TabsTrigger>
          <TabsTrigger value="sabado">Sábado</TabsTrigger>
          <TabsTrigger value="domingo">Domingo</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {menuDelDia.length > 0 ? (
                menuDelDia.map((producto) => (
                  <Card key={producto.id} className="overflow-hidden">
                    <div className="relative h-48 w-full">
                      <Image
                        src={producto.imagen || "/placeholder.svg"}
                        alt={producto.nombre}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle>{producto.nombre}</CardTitle>
                        <Badge variant="outline">{producto.tiempo_preparacion} min</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{producto.descripcion}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Precio sin IVA</p>
                          <p className="text-lg font-bold">
                            ${producto.precio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Precio con IVA ({producto.iva}%)</p>
                          <p className="text-lg font-bold">
                            ${calcularPrecioConIVA(producto.precio, producto.iva).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => handleAgregarAlCarrito(producto)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Agregar al pedido
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <p className="text-xl text-muted-foreground">No hay platos disponibles para este día</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}


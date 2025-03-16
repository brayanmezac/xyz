"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ClipboardListIcon, EyeIcon, PrinterIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAllOrdenes, updateOrdenEstado } from "@/services/ordenes.service"
import { Orden } from "@/types/orden"

export default function OrdenesPage() {
  const { toast } = useToast()
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<Orden | null>(null)
  const [dialogDetalleOpen, setDialogDetalleOpen] = useState(false)
  const [dialogEstadoOpen, setDialogEstadoOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const estados = [
    "Nuevo pedido",
    "En preparación",
    "Listo para servir",
    "En camino",
    "Esperando pago",
    "Pagado",
    "Completado",
    "Cancelado",
    "En espera",
    "Rechazado",
  ]

  const coloresEstado: { [key: string]: string } = {
    "Nuevo pedido": "bg-blue-100 text-blue-800",
    "En preparación": "bg-yellow-100 text-yellow-800",
    "Listo para servir": "bg-green-100 text-green-800",
    "En camino": "bg-purple-100 text-purple-800",
    "Esperando pago": "bg-orange-100 text-orange-800",
    Pagado: "bg-emerald-100 text-emerald-800",
    Completado: "bg-green-100 text-green-800",
    Cancelado: "bg-red-100 text-red-800",
    "En espera": "bg-gray-100 text-gray-800",
    Rechazado: "bg-red-100 text-red-800",
  }

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        setLoading(true)
        const data = await getAllOrdenes()
        setOrdenes(data)
      } catch (error) {
        console.error("Error al cargar órdenes:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las órdenes",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrdenes()
  }, [toast])

  const handleVerDetalle = (orden: Orden) => {
    setOrdenSeleccionada(orden)
    setDialogDetalleOpen(true)
  }

  const handleCambiarEstado = (orden: Orden) => {
    setOrdenSeleccionada(orden)
    setDialogEstadoOpen(true)
  }

  const handleActualizarEstado = async (nuevoEstado: string) => {
    if (!ordenSeleccionada) return

    try {
      setActionLoading(true)
      // Actualizar estado de la orden
      await updateOrdenEstado(ordenSeleccionada.id, nuevoEstado)

      // Actualizar estado local
      const nuevasOrdenes = ordenes.map((orden) =>
        orden.id === ordenSeleccionada.id ? { ...orden, estado: nuevoEstado } : orden,
      )

      setOrdenes(nuevasOrdenes)
      setDialogEstadoOpen(false)

      toast({
        title: "Estado actualizado",
        description: `La orden #${ordenSeleccionada.id} ahora está en estado "${nuevoEstado}"`,
      })
    } catch (error) {
      console.error("Error al actualizar estado de orden:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la orden",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleImprimirFactura = (orden: Orden) => {
    // En una implementación real, aquí se generaría la factura en PDF
    console.log("Imprimir factura para la orden:", orden)

    toast({
      title: "Factura generada",
      description: `La factura para la orden #${orden.id} ha sido generada`,
    })
  }

  const ordenesFiltradas = filtroEstado === "todos" ? ordenes : ordenes.filter((orden) => orden.estado === filtroEstado)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Órdenes</h2>
          <p className="text-muted-foreground">Gestiona las órdenes y su estado</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              {estados.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {ordenesFiltradas.length > 0 ? (
            ordenesFiltradas.map((orden) => (
              <Card key={orden.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">
                      Orden #{orden.id} - Mesa {orden.mesa.numero}
                    </CardTitle>
                    <CardDescription>{new Date(orden.fecha).toLocaleString("es-ES")}</CardDescription>
                  </div>
                  <Badge className={coloresEstado[orden.estado]}>{orden.estado}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div>
                      <p className="font-medium">Cliente: {orden.cliente.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {orden.cliente.tipo_identificacion}: {orden.cliente.numero_identificacion} | Tel:{" "}
                        {orden.cliente.telefono}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {orden.productos.map((producto, index) => (
                        <Badge key={index} variant="outline">
                          {producto.cantidad}x {producto.nombre}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total:</span>
                      <span className="font-bold">${Number.parseFloat(orden.total.toString()).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleVerDetalle(orden)}>
                        <EyeIcon className="mr-2 h-4 w-4" />
                        Ver detalle
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCambiarEstado(orden)}
                        disabled={actionLoading}
                      >
                        <ClipboardListIcon className="mr-2 h-4 w-4" />
                        Cambiar estado
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleImprimirFactura(orden)}>
                        <PrinterIcon className="mr-2 h-4 w-4" />
                        Imprimir factura
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-center text-muted-foreground">
                  No hay órdenes que coincidan con el filtro seleccionado
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Diálogo de detalle de orden */}
      <Dialog open={dialogDetalleOpen} onOpenChange={setDialogDetalleOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalle de Orden #{ordenSeleccionada?.id}</DialogTitle>
            <DialogDescription>
              Mesa {ordenSeleccionada?.mesa?.numero} -{" "}
              {ordenSeleccionada && new Date(ordenSeleccionada.fecha).toLocaleString("es-ES")}
            </DialogDescription>
          </DialogHeader>
          {ordenSeleccionada && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <h3 className="font-semibold">Datos del Cliente</h3>
                <div className="rounded-lg border p-3">
                  <p>
                    <span className="font-medium">Nombre:</span> {ordenSeleccionada.cliente.nombre}
                  </p>
                  <p>
                    <span className="font-medium">Identificación:</span> {ordenSeleccionada.cliente.tipo_identificacion}{" "}
                    {ordenSeleccionada.cliente.numero_identificacion}
                  </p>
                  <p>
                    <span className="font-medium">Teléfono:</span> {ordenSeleccionada.cliente.telefono}
                  </p>
                </div>
              </div>
              <div className="grid gap-2">
                <h3 className="font-semibold">Productos</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordenSeleccionada.productos.map((producto, index) => (
                      <TableRow key={index}>
                        <TableCell>{producto.nombre}</TableCell>
                        <TableCell className="text-right">
                          ${Number.parseFloat(producto.precio.toString()).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">{producto.cantidad}</TableCell>
                        <TableCell className="text-right">
                          ${(producto.precio * producto.cantidad).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="grid gap-2">
                <h3 className="font-semibold">Resumen</h3>
                <div className="rounded-lg border p-3 space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${Number.parseFloat(ordenSeleccionada.subtotal.toString()).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (19%):</span>
                    <span>${Number.parseFloat(ordenSeleccionada.iva.toString()).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuesto al consumo (8%):</span>
                    <span>${Number.parseFloat(ordenSeleccionada.impuesto_consumo.toString()).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${Number.parseFloat(ordenSeleccionada.total.toString()).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <h3 className="font-semibold">Estado Actual</h3>
                <div className="flex items-center space-x-2">
                  <Badge className={coloresEstado[ordenSeleccionada.estado]}>{ordenSeleccionada.estado}</Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDialogDetalleOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de cambio de estado */}
      <Dialog open={dialogEstadoOpen} onOpenChange={setDialogEstadoOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cambiar Estado de Orden #{ordenSeleccionada?.id}</DialogTitle>
            <DialogDescription>Selecciona el nuevo estado para esta orden</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              {estados.map((estado) => (
                <Button
                  key={estado}
                  variant="outline"
                  className={`justify-start ${ordenSeleccionada?.estado === estado ? "border-primary" : ""}`}
                  onClick={() => handleActualizarEstado(estado)}
                  disabled={actionLoading}
                >
                  <Badge className={`mr-2 ${coloresEstado[estado]}`}>&nbsp;</Badge>
                  {estado}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEstadoOpen(false)} disabled={actionLoading}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


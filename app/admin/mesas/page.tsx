"use client"

import { useState, useEffect, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { PlusIcon, Trash2Icon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getAllMesas, createMesa, updateMesaEstado, deleteMesa } from "@/services/mesas.service"

interface Mesa {
  id: number
  numero: number  // Changed from string to number
  capacidad: number
  estado: EstadoMesa
}

// Remove MesaResponse interface since it's now the same as Mesa

// Add type for create mesa payload
type CreateMesaPayload = Omit<Mesa, 'id'>

type EstadoMesa = 'Libre' | 'Ocupada' | 'Reservada' | 'Mantenimiento'

interface MesaError extends Error {
  message: string
}

export default function MesasPage() {
  const { toast } = useToast()
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [mesaActual, setMesaActual] = useState<CreateMesaPayload>({
    numero: 0,  // Changed from empty string to 0
    capacidad: 4,
    estado: "Libre",
  })
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [dialogEstadoOpen, setDialogEstadoOpen] = useState<boolean>(false)
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null)
  const [actionLoading, setActionLoading] = useState<boolean>(false)

  const estados: EstadoMesa[] = ["Libre", "Ocupada", "Reservada", "Mantenimiento"]
  const coloresEstado: Record<EstadoMesa, string> = {
    Libre: "bg-green-100 text-green-800",
    Ocupada: "bg-red-100 text-red-800",
    Reservada: "bg-blue-100 text-blue-800",
    Mantenimiento: "bg-yellow-100 text-yellow-800",
  }

  useEffect(() => {
    const fetchMesas = async () => {
      try {
        setLoading(true)
        const data = await getAllMesas()
        setMesas(data as Mesa[])
      } catch (error) {
        console.error("Error al cargar mesas:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las mesas",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMesas()
  }, [toast])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setMesaActual({
      ...mesaActual,
      [name]: Number.parseInt(value) || 0,  // Convert all inputs to numbers
    })
  }

  const handleCrearMesa = async () => {
    if (!mesaActual.numero || mesaActual.capacidad <= 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    try {
      setActionLoading(true)
      // Crear nueva mesa
      const nuevaMesa = await createMesa(mesaActual) as Mesa

      // Actualizar estado local
      setMesas([...mesas, nuevaMesa])
      setDialogOpen(false)

      toast({
        title: "Mesa creada",
        description: `La mesa #${nuevaMesa.numero} ha sido creada correctamente`,
      })
    } catch (error) {
      console.error("Error al crear mesa:", error)
      const mesaError = error as MesaError
      toast({
        title: "Error",
        description: mesaError.message || "No se pudo crear la mesa",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleEliminarMesa = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta mesa?")) {
      try {
        setActionLoading(true)
        // Eliminar mesa
        await deleteMesa(id)

        // Actualizar estado local
        setMesas(mesas.filter((mesa) => mesa.id !== id))

        toast({
          title: "Mesa eliminada",
          description: "La mesa ha sido eliminada correctamente",
        })
      } catch (error) {
        console.error("Error al eliminar mesa:", error)
        const mesaError = error as MesaError
        toast({
          title: "Error",
          description: mesaError.message || "No se pudo eliminar la mesa",
          variant: "destructive",
        })
      } finally {
        setActionLoading(false)
      }
    }
  }

  const handleCambiarEstado = (mesa: Mesa) => {
    setMesaSeleccionada(mesa)
    setDialogEstadoOpen(true)
  }

  const handleActualizarEstado = async (nuevoEstado: Mesa['estado']) => {
    if (!mesaSeleccionada) return

    try {
      setActionLoading(true)
      // Actualizar estado de la mesa
      await updateMesaEstado(mesaSeleccionada.id, nuevoEstado)

      // Actualizar estado local
      const nuevasMesas = mesas.map((mesa) =>
        mesa.id === mesaSeleccionada.id ? { ...mesa, estado: nuevoEstado } : mesa,
      )

      setMesas(nuevasMesas)
      setDialogEstadoOpen(false)

      toast({
        title: "Estado actualizado",
        description: `La mesa #${mesaSeleccionada.numero} ahora está ${nuevoEstado}`,
      })
    } catch (error) {
      console.error("Error al actualizar estado de mesa:", error)
      const mesaError = error as MesaError
      toast({
        title: "Error",
        description: mesaError.message || "No se pudo actualizar el estado de la mesa",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mesas</h2>
          <p className="text-muted-foreground">Gestiona las mesas del restaurante</p>
        </div>
        <Button
          onClick={() => {
            setMesaActual({
              numero: 0,
              capacidad: 4,
              estado: "Libre",
            })
            setDialogOpen(true)
          }}
          disabled={actionLoading}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Nueva Mesa
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mesas.map((mesa) => (
            <Card key={mesa.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Mesa #{mesa.numero.toString()}</CardTitle>
                  <Badge className={coloresEstado[mesa.estado]}>{mesa.estado}</Badge>
                </div>
                <CardDescription>Capacidad: {mesa.capacidad} personas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {mesa.estado === "Ocupada"
                        ? "Actualmente en uso"
                        : mesa.estado === "Reservada"
                          ? "Reservada para hoy"
                          : mesa.estado === "Mantenimiento"
                            ? "En mantenimiento"
                            : "Disponible para uso"}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleCambiarEstado(mesa)} disabled={actionLoading}>
                  Cambiar estado
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEliminarMesa(mesa.id)}
                  disabled={actionLoading}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo para crear mesa */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nueva Mesa</DialogTitle>
            <DialogDescription>Ingresa los detalles de la nueva mesa</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="numero">Número de Mesa</Label>
              <Input
                id="numero"
                name="numero"
                value={mesaActual.numero}
                onChange={handleInputChange}
                placeholder="Ej: 11"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacidad">Capacidad</Label>
              <Input
                id="capacidad"
                name="capacidad"
                type="number"
                value={mesaActual.capacidad}
                onChange={handleInputChange}
                min="1"
                placeholder="Ej: 4"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={actionLoading}>
              Cancelar
            </Button>
            <Button onClick={handleCrearMesa} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Creando...
                </>
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para cambiar estado */}
      <Dialog open={dialogEstadoOpen} onOpenChange={setDialogEstadoOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cambiar Estado de Mesa</DialogTitle>
            <DialogDescription>Selecciona el nuevo estado para la mesa #{mesaSeleccionada?.numero}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              {estados.map((estado) => (
                <Button
                  key={estado}
                  variant="outline"
                  className={`justify-start ${mesaSeleccionada?.estado === estado ? "border-primary" : ""}`}
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


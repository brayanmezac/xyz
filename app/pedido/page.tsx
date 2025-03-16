"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useCarrito } from "@/hooks/use-carrito"
import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createOrden } from "@/services/ordenes.service"

export default function PedidoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { productos, actualizarCantidad, eliminarProducto, vaciarCarrito } = useCarrito()
  const [paso, setPaso] = useState(1)
  const [loading, setLoading] = useState(false)
  const [datosCliente, setDatosCliente] = useState({
    nombre: "",
    tipoIdentificacion: "CC",
    numeroIdentificacion: "",
    telefono: "",
    mesa: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setDatosCliente((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setDatosCliente((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const calcularSubtotal = () => {
    return productos.reduce((total, producto) => total + producto.precio * producto.cantidad, 0)
  }

  const calcularIVA = () => {
    return productos.reduce((total, producto) => total + producto.precio * (producto.iva / 100) * producto.cantidad, 0)
  }

  const calcularImpuestoConsumo = () => {
    return calcularSubtotal() * 0.08 // 8% de impuesto al consumo
  }

  const calcularTotal = () => {
    return calcularSubtotal() + calcularIVA() + calcularImpuestoConsumo()
  }

  const handleContinuar = () => {
    if (productos.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos al carrito para continuar",
        variant: "destructive",
      })
      return
    }
    setPaso(2)
  }

  const handleConfirmar = async () => {
    // Validar datos del cliente
    if (!datosCliente.nombre || !datosCliente.numeroIdentificacion || !datosCliente.telefono || !datosCliente.mesa) {
      toast({
        title: "Datos incompletos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    // Generar orden
    const orden = {
      cliente: datosCliente,
      productos,
      subtotal: calcularSubtotal(),
      iva: calcularIVA(),
      impuestoConsumo: calcularImpuestoConsumo(),
      total: calcularTotal(),
      mesa: datosCliente.mesa,
    }

    setLoading(true)

    try {
      // Enviar orden a la base de datos
      await createOrden(orden)

      // Mostrar mensaje de éxito
      toast({
        title: "Pedido realizado",
        description: "Tu pedido ha sido enviado correctamente",
      })

      // Vaciar carrito y redirigir
      vaciarCarrito()
      router.push("/pedido/confirmacion")
    } catch (error) {
      console.error("Error al crear la orden:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar el pedido. Intenta nuevamente",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVolver = () => {
    setPaso(1)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tu Pedido</h1>
        <p className="text-muted-foreground">Revisa y confirma los productos seleccionados</p>
      </div>

      {paso === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Resumen del pedido</CardTitle>
            <CardDescription>Productos seleccionados del menú</CardDescription>
          </CardHeader>
          <CardContent>
            {productos.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productos.map((producto) => (
                    <TableRow key={producto.id}>
                      <TableCell className="font-medium">{producto.nombre}</TableCell>
                      <TableCell className="text-right">
                        ${Number.parseFloat(producto.precio).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => actualizarCantidad(producto.id, Math.max(1, producto.cantidad - 1))}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </Button>
                          <span>{producto.cantidad}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => actualizarCantidad(producto.id, producto.cantidad + 1)}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        ${(producto.precio * producto.cantidad).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => eliminarProducto(producto.id)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>Subtotal</TableCell>
                    <TableCell className="text-right">${calcularSubtotal().toLocaleString()}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3}>IVA (19%)</TableCell>
                    <TableCell className="text-right">${calcularIVA().toLocaleString()}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3}>Impuesto al consumo (8%)</TableCell>
                    <TableCell className="text-right">${calcularImpuestoConsumo().toLocaleString()}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right font-bold">${calcularTotal().toLocaleString()}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="mb-4 text-xl text-muted-foreground">No hay productos en el carrito</p>
                <Link href="/menu">
                  <Button>Ver menú</Button>
                </Link>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/menu">
              <Button variant="outline">Volver al menú</Button>
            </Link>
            <Button onClick={handleContinuar}>Continuar</Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Datos del cliente</CardTitle>
            <CardDescription>Completa tus datos para finalizar el pedido</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={datosCliente.nombre}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu nombre completo"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="tipoIdentificacion">Tipo de identificación</Label>
                  <Select
                    value={datosCliente.tipoIdentificacion}
                    onValueChange={(value) => handleSelectChange("tipoIdentificacion", value)}
                  >
                    <SelectTrigger id="tipoIdentificacion">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                      <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                      <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                      <SelectItem value="PP">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="numeroIdentificacion">Número de identificación</Label>
                  <Input
                    id="numeroIdentificacion"
                    name="numeroIdentificacion"
                    value={datosCliente.numeroIdentificacion}
                    onChange={handleInputChange}
                    placeholder="Ingresa tu número de identificación"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="telefono">Teléfono celular</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={datosCliente.telefono}
                    onChange={handleInputChange}
                    placeholder="Ingresa tu número de teléfono"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="mesa">Número de mesa</Label>
                  <Input
                    id="mesa"
                    name="mesa"
                    value={datosCliente.mesa}
                    onChange={handleInputChange}
                    placeholder="Ingresa el número de mesa"
                  />
                </div>
              </div>
              <div className="mt-4 rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">Resumen de la orden</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${calcularSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (19%):</span>
                    <span>${calcularIVA().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuesto al consumo (8%):</span>
                    <span>${calcularImpuestoConsumo().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${calcularTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleVolver} disabled={loading}>
              Volver
            </Button>
            <Button onClick={handleConfirmar} disabled={loading}>
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Procesando...
                </>
              ) : (
                "Confirmar pedido"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}


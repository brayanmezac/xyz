"use client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MenuIcon as RestaurantIcon, ShoppingCartIcon, UserCogIcon } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Comidas XYZ</h1>
            <p className="text-muted-foreground md:text-xl">Sistema de gestión para restaurante</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 shadow-sm">
              <RestaurantIcon className="h-12 w-12 text-primary" />
              <h2 className="text-xl font-bold">Menú del Día</h2>
              <p className="text-center text-muted-foreground">Visualiza el menú del día y realiza tu pedido</p>
              <Link href="/menu" className="w-full">
                <Button className="w-full">Ver Menú</Button>
              </Link>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 shadow-sm">
              <ShoppingCartIcon className="h-12 w-12 text-primary" />
              <h2 className="text-xl font-bold">Realizar Pedido</h2>
              <p className="text-center text-muted-foreground">Crea un nuevo pedido y visualiza tu factura</p>
              <Link href="/pedido" className="w-full">
                <Button className="w-full">Ordenar</Button>
              </Link>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 shadow-sm">
              <UserCogIcon className="h-12 w-12 text-primary" />
              <h2 className="text-xl font-bold">Administración</h2>
              <p className="text-center text-muted-foreground">Gestiona productos, menús y visualiza reportes</p>
              <Link href="/admin" className="w-full">
                <Button className="w-full" variant="outline">
                  Acceder
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


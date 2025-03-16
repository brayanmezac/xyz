"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart } from "@/components/charts"
import { DollarSignIcon, ShoppingBagIcon, TrendingUpIcon, UsersIcon } from "lucide-react"

export default function AdminDashboard() {
  // Datos simulados para los gráficos
  const ventasPorDia = [
    { name: "Lun", total: 1200000 },
    { name: "Mar", total: 900000 },
    { name: "Mié", total: 1100000 },
    { name: "Jue", total: 1300000 },
    { name: "Vie", total: 1800000 },
    { name: "Sáb", total: 2100000 },
    { name: "Dom", total: 1700000 },
  ]

  const ventasPorMes = [
    { name: "Ene", total: 12000000 },
    { name: "Feb", total: 14000000 },
    { name: "Mar", total: 16000000 },
    { name: "Abr", total: 15000000 },
    { name: "May", total: 18000000 },
    { name: "Jun", total: 20000000 },
    { name: "Jul", total: 22000000 },
    { name: "Ago", total: 24000000 },
    { name: "Sep", total: 21000000 },
    { name: "Oct", total: 19000000 },
    { name: "Nov", total: 23000000 },
    { name: "Dic", total: 28000000 },
  ]

  const topPlatos = [
    { name: "Bandeja Paisa", total: 120 },
    { name: "Ajiaco", total: 95 },
    { name: "Pescado Frito", total: 85 },
    { name: "Sancocho", total: 70 },
    { name: "Arroz con Pollo", total: 65 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Resumen de ventas y estadísticas del restaurante</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231,890</div>
            <p className="text-xs text-muted-foreground">+20.1% respecto al mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Completados</CardTitle>
            <ShoppingBagIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,345</div>
            <p className="text-xs text-muted-foreground">+15% respecto al mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Nuevos</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">+12.5% respecto al mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$19,290</div>
            <p className="text-xs text-muted-foreground">+2.5% respecto al mes anterior</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="diario" className="space-y-4">
        <TabsList>
          <TabsTrigger value="diario">Diario</TabsTrigger>
          <TabsTrigger value="mensual">Mensual</TabsTrigger>
          <TabsTrigger value="trimestral">Trimestral</TabsTrigger>
        </TabsList>
        <TabsContent value="diario" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Ventas Diarias</CardTitle>
                <CardDescription>Ventas de la última semana</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <BarChart data={ventasPorDia} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top 5 Platos</CardTitle>
                <CardDescription>Platos más vendidos del día</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={topPlatos} horizontal />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="mensual" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Ventas Mensuales</CardTitle>
                <CardDescription>Ventas del último año</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <LineChart data={ventasPorMes} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Distribución de Ingresos</CardTitle>
                <CardDescription>Desglose de ingresos por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Platos Principales</p>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-[65%] rounded-full bg-primary" />
                      </div>
                    </div>
                    <p className="text-sm font-medium">65%</p>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 rounded-full bg-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Bebidas</p>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-[20%] rounded-full bg-blue-500" />
                      </div>
                    </div>
                    <p className="text-sm font-medium">20%</p>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 rounded-full bg-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Postres</p>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-[10%] rounded-full bg-green-500" />
                      </div>
                    </div>
                    <p className="text-sm font-medium">10%</p>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 rounded-full bg-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Entradas</p>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-[5%] rounded-full bg-yellow-500" />
                      </div>
                    </div>
                    <p className="text-sm font-medium">5%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="trimestral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reporte Trimestral</CardTitle>
              <CardDescription>Comparativa de ventas por trimestre</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <BarChart
                  data={[
                    { name: "Q1", total: 42000000 },
                    { name: "Q2", total: 53000000 },
                    { name: "Q3", total: 67000000 },
                    { name: "Q4", total: 70000000 },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function InstruccionesPage() {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Instrucciones de Configuración</CardTitle>
          <CardDescription>Pasos para configurar la base de datos de Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Paso 1: Crear la función SQL</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Primero, necesitas crear una función SQL en Supabase que permita ejecutar scripts SQL desde la
                aplicación.
              </p>
              <Link href="/admin/setup/sql-function">
                <Button variant="outline" className="w-full">
                  Ver instrucciones para crear la función SQL
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Paso 2: Configurar la base de datos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Una vez creada la función SQL, puedes configurar la base de datos con las tablas y datos iniciales.
              </p>
              <Link href="/admin/setup">
                <Button className="w-full">
                  Ir a la página de configuración
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <Alert className="bg-blue-50 text-blue-800 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Nota</AlertTitle>
              <AlertDescription className="text-blue-700">
                Solo necesitas realizar estos pasos una vez. Si ya has configurado la base de datos, puedes omitir estos
                pasos.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={() => window.history.back()}>
            Volver
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}


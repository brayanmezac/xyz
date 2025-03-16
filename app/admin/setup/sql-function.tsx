"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Copy } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

export default function SqlFunctionPage() {
  const [copied, setCopied] = useState(false)

  const sqlFunction = `
-- Crear una función para ejecutar scripts SQL
CREATE OR REPLACE FUNCTION execute_sql_script(sql_script TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS &quot;$$&quot;
BEGIN
  EXECUTE sql_script;
END;
&quot;$$&quot;;
  `.trim()

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlFunction)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Función SQL para Ejecutar Scripts</CardTitle>
          <CardDescription>Copia y ejecuta esta función en el Editor SQL de Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Antes de usar la página de configuración, necesitas crear una función SQL en Supabase que permita ejecutar
            scripts SQL. Sigue estos pasos:
          </p>

          <ol className="list-decimal pl-5 mb-4 space-y-2 text-sm">
            <li>
              Ve al{" "}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Panel de Supabase
              </a>
            </li>
            <li>Selecciona tu proyecto</li>
            <li>Ve a &quot;SQL Editor&quot; en el menú lateral</li>
            <li>Crea un nuevo script</li>
            <li>Pega el siguiente código SQL</li>
            <li>Ejecuta el script</li>
          </ol>

          <div className="relative">
            <Textarea value={sqlFunction} readOnly className="font-mono text-xs h-40" />
            <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-1" />
              {copied ? "¡Copiado!" : "Copiar"}
            </Button>
          </div>

          <Alert className="mt-4 bg-amber-50 text-amber-800 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Importante</AlertTitle>
            <AlertDescription className="text-amber-700">
              Esta función es necesaria para que la página de configuración funcione correctamente. Debes ejecutarla una
              sola vez en tu base de datos de Supabase.
            </AlertDescription>
          </Alert>
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


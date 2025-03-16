"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2Icon } from "lucide-react"
import Link from "next/link"

export default function ConfirmacionPage() {
  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <CheckCircle2Icon className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">¡Pedido confirmado!</CardTitle>
          <CardDescription>
            Tu pedido ha sido recibido y está siendo procesado
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Gracias por tu pedido. Hemos enviado una confirmación a la cocina y
            pronto estará listo.
          </p>
          <p className="text-sm text-muted-foreground">
            Número de pedido: #{Math.floor(Math.random() * 10000)}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}


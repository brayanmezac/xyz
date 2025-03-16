"use client"

import type React from "react"

import { CarritoProvider } from "@/hooks/use-carrito"

export function Providers({ children }: { children: React.ReactNode }) {
  return <CarritoProvider>{children}</CarritoProvider>
}


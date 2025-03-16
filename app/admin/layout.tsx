import type React from "react"
import type { Metadata } from "next"
import AdminSidebar from "@/components/admin-sidebar"

export const metadata: Metadata = {
  title: "Administración - Comidas XYZ",
  description: "Panel de administración para el restaurante Comidas XYZ",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}


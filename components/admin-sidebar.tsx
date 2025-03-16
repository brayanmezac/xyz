"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  BarChart3Icon,
  ClipboardListIcon,
  CoffeeIcon,
  HomeIcon,
  LayoutGridIcon,
  MenuIcon,
  XIcon,
  DatabaseIcon,
} from "lucide-react"
import { useState } from "react"
import { useMobile } from "@/hooks/use-mobile"

export default function AdminSidebar() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const routes = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: <BarChart3Icon className="h-5 w-5" />,
      active: pathname === "/admin",
    },
    {
      href: "/admin/productos",
      label: "Productos",
      icon: <CoffeeIcon className="h-5 w-5" />,
      active: pathname === "/admin/productos",
    },
    {
      href: "/admin/menus",
      label: "Menús",
      icon: <MenuIcon className="h-5 w-5" />,
      active: pathname === "/admin/menus",
    },
    {
      href: "/admin/ordenes",
      label: "Órdenes",
      icon: <ClipboardListIcon className="h-5 w-5" />,
      active: pathname === "/admin/ordenes",
    },
    {
      href: "/admin/mesas",
      label: "Mesas",
      icon: <LayoutGridIcon className="h-5 w-5" />,
      active: pathname === "/admin/mesas",
    },
    {
      href: "/admin/setup",
      label: "Configuración BD",
      icon: <DatabaseIcon className="h-5 w-5" />,
      active: pathname === "/admin/setup",
    },
    {
      href: "/",
      label: "Volver al inicio",
      icon: <HomeIcon className="h-5 w-5" />,
      active: false,
    },
  ]

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  if (isMobile) {
    return (
      <>
        <Button variant="outline" size="icon" className="fixed left-4 top-4 z-50 md:hidden" onClick={toggleSidebar}>
          <MenuIcon className="h-5 w-5" />
        </Button>
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={toggleSidebar} />
        )}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-card shadow-lg transition-transform duration-200 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b px-4">
            <h2 className="text-lg font-semibold">Comidas XYZ</h2>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <XIcon className="h-5 w-5" />
            </Button>
          </div>
          <div className="space-y-1 p-2">
            {routes.map((route) => (
              <Link key={route.href} href={route.href} onClick={() => setSidebarOpen(false)}>
                <Button variant={route.active ? "secondary" : "ghost"} className="w-full justify-start">
                  {route.icon}
                  <span className="ml-2">{route.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-lg font-semibold">Comidas XYZ</h2>
      </div>
      <div className="space-y-1 p-2">
        {routes.map((route) => (
          <Link key={route.href} href={route.href}>
            <Button variant={route.active ? "secondary" : "ghost"} className="w-full justify-start">
              {route.icon}
              <span className="ml-2">{route.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  )
}


"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSetupDatabase = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = getSupabaseClient()

      // Crear tablas
      await supabase.rpc("execute_sql_script", {
        sql_script: `
        -- Tabla de productos
        CREATE TABLE IF NOT EXISTS productos (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          descripcion TEXT,
          precio DECIMAL(10, 2) NOT NULL,
          iva DECIMAL(5, 2) NOT NULL DEFAULT 19,
          tiempo_preparacion INTEGER NOT NULL DEFAULT 15,
          imagen VARCHAR(255) DEFAULT '/placeholder.svg?height=200&width=300',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Tabla de menús (para los días de la semana)
        CREATE TABLE IF NOT EXISTS menus (
          id SERIAL PRIMARY KEY,
          dia_semana VARCHAR(20) NOT NULL, -- lunes, martes, etc.
          descripcion TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(dia_semana)
        );

        -- Tabla de relación entre menús y productos
        CREATE TABLE IF NOT EXISTS menu_productos (
          id SERIAL PRIMARY KEY,
          menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
          producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(menu_id, producto_id)
        );

        -- Tabla de clientes
        CREATE TABLE IF NOT EXISTS clientes (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          tipo_identificacion VARCHAR(10) NOT NULL, -- CC, CE, TI, PP
          numero_identificacion VARCHAR(20) NOT NULL,
          telefono VARCHAR(20),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(tipo_identificacion, numero_identificacion)
        );

        -- Tabla de mesas
        CREATE TABLE IF NOT EXISTS mesas (
          id SERIAL PRIMARY KEY,
          numero VARCHAR(10) NOT NULL,
          capacidad INTEGER NOT NULL DEFAULT 4,
          estado VARCHAR(20) NOT NULL DEFAULT 'Libre', -- Libre, Ocupada, Reservada, Mantenimiento
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(numero)
        );

        -- Tabla de órdenes
        CREATE TABLE IF NOT EXISTS ordenes (
          id SERIAL PRIMARY KEY,
          cliente_id INTEGER NOT NULL REFERENCES clientes(id),
          mesa_id INTEGER NOT NULL REFERENCES mesas(id),
          subtotal DECIMAL(10, 2) NOT NULL,
          iva DECIMAL(10, 2) NOT NULL,
          impuesto_consumo DECIMAL(10, 2) NOT NULL,
          total DECIMAL(10, 2) NOT NULL,
          estado VARCHAR(20) NOT NULL DEFAULT 'Nuevo pedido', -- Nuevo pedido, En preparación, Listo para servir, etc.
          fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Tabla de relación entre órdenes y productos
        CREATE TABLE IF NOT EXISTS orden_productos (
          id SERIAL PRIMARY KEY,
          orden_id INTEGER NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
          producto_id INTEGER NOT NULL REFERENCES productos(id),
          cantidad INTEGER NOT NULL DEFAULT 1,
          precio_unitario DECIMAL(10, 2) NOT NULL,
          iva_unitario DECIMAL(10, 2) NOT NULL,
          subtotal DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        `,
      })

      // Insertar datos iniciales
      await supabase.rpc("execute_sql_script", {
        sql_script: `
        -- Insertar los días de la semana en la tabla de menús
        INSERT INTO menus (dia_semana, descripcion) VALUES
        ('lunes', 'Menú del Lunes'),
        ('martes', 'Menú del Martes'),
        ('miercoles', 'Menú del Miércoles'),
        ('jueves', 'Menú del Jueves'),
        ('viernes', 'Menú del Viernes'),
        ('sabado', 'Menú del Sábado'),
        ('domingo', 'Menú del Domingo')
        ON CONFLICT (dia_semana) DO NOTHING;

        -- Insertar algunos productos de ejemplo
        INSERT INTO productos (nombre, descripcion, precio, iva, tiempo_preparacion, imagen) VALUES
        ('Bandeja Paisa', 'Plato típico colombiano con frijoles, arroz, carne molida, chicharrón, huevo frito, aguacate y arepa', 25000, 19, 20, '/placeholder.svg?height=200&width=300'),
        ('Ajiaco Santafereño', 'Sopa tradicional bogotana con papas, pollo, mazorca, alcaparras y crema', 22000, 19, 25, '/placeholder.svg?height=200&width=300'),
        ('Pescado Frito', 'Mojarra frita con arroz de coco, patacones y ensalada', 28000, 19, 18, '/placeholder.svg?height=200&width=300'),
        ('Sancocho de Gallina', 'Sopa espesa con gallina, yuca, plátano, mazorca y papa', 24000, 19, 30, '/placeholder.svg?height=200&width=300'),
        ('Arroz con Pollo', 'Arroz con pollo, verduras, salsa de tomate y especias', 20000, 19, 22, '/placeholder.svg?height=200&width=300'),
        ('Cazuela de Mariscos', 'Guiso de mariscos variados en leche de coco con arroz y patacones', 32000, 19, 25, '/placeholder.svg?height=200&width=300'),
        ('Mondongo', 'Sopa de callos de res con papa, yuca y verduras', 23000, 19, 35, '/placeholder.svg?height=200&width=300'),
        ('Lechona Tolimense', 'Cerdo relleno de arroz, arvejas y especias', 26000, 19, 40, '/placeholder.svg?height=200&width=300'),
        ('Tamales', 'Masa de maíz rellena de pollo, cerdo, verduras y especias envuelta en hojas de plátano', 18000, 19, 15, '/placeholder.svg?height=200&width=300'),
        ('Fritanga', 'Surtido de carnes fritas (morcilla, chorizo, chicharrón) con papa criolla y arepa', 30000, 19, 20, '/placeholder.svg?height=200&width=300')
        ON CONFLICT DO NOTHING;

        -- Asignar productos a los menús de cada día
        -- Lunes
        INSERT INTO menu_productos (menu_id, producto_id)
        SELECT m.id, p.id FROM menus m, productos p
        WHERE m.dia_semana = 'lunes' AND p.nombre IN ('Bandeja Paisa', 'Ajiaco Santafereño', 'Pescado Frito')
        ON CONFLICT (menu_id, producto_id) DO NOTHING;

        -- Martes
        INSERT INTO menu_productos (menu_id, producto_id)
        SELECT m.id, p.id FROM menus m, productos p
        WHERE m.dia_semana = 'martes' AND p.nombre IN ('Sancocho de Gallina', 'Arroz con Pollo')
        ON CONFLICT (menu_id, producto_id) DO NOTHING;

        -- Miércoles
        INSERT INTO menu_productos (menu_id, producto_id)
        SELECT m.id, p.id FROM menus m, productos p
        WHERE m.dia_semana = 'miercoles' AND p.nombre IN ('Cazuela de Mariscos')
        ON CONFLICT (menu_id, producto_id) DO NOTHING;

        -- Jueves
        INSERT INTO menu_productos (menu_id, producto_id)
        SELECT m.id, p.id FROM menus m, productos p
        WHERE m.dia_semana = 'jueves' AND p.nombre IN ('Mondongo')
        ON CONFLICT (menu_id, producto_id) DO NOTHING;

        -- Viernes
        INSERT INTO menu_productos (menu_id, producto_id)
        SELECT m.id, p.id FROM menus m, productos p
        WHERE m.dia_semana = 'viernes' AND p.nombre IN ('Lechona Tolimense')
        ON CONFLICT (menu_id, producto_id) DO NOTHING;

        -- Sábado
        INSERT INTO menu_productos (menu_id, producto_id)
        SELECT m.id, p.id FROM menus m, productos p
        WHERE m.dia_semana = 'sabado' AND p.nombre IN ('Tamales')
        ON CONFLICT (menu_id, producto_id) DO NOTHING;

        -- Domingo
        INSERT INTO menu_productos (menu_id, producto_id)
        SELECT m.id, p.id FROM menus m, productos p
        WHERE m.dia_semana = 'domingo' AND p.nombre IN ('Fritanga')
        ON CONFLICT (menu_id, producto_id) DO NOTHING;

        -- Insertar algunas mesas de ejemplo
        INSERT INTO mesas (numero, capacidad, estado) VALUES
        ('1', 4, 'Libre'),
        ('2', 2, 'Ocupada'),
        ('3', 4, 'Ocupada'),
        ('4', 6, 'Libre'),
        ('5', 4, 'Ocupada'),
        ('6', 8, 'Reservada'),
        ('7', 2, 'Libre'),
        ('8', 4, 'Ocupada'),
        ('9', 6, 'Libre'),
        ('10', 10, 'Reservada')
        ON CONFLICT (numero) DO NOTHING;
        `,
      })

      setSuccess(true)
    } catch (err) {
      console.error("Error setting up database:", err)
      setError(err instanceof Error ? err.message : "Error desconocido al configurar la base de datos")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Configuración de la Base de Datos</CardTitle>
          <CardDescription>Inicializa las tablas y datos necesarios para la aplicación</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Este proceso creará todas las tablas necesarias y cargará datos iniciales para el funcionamiento de la
            aplicación. Puedes ejecutar este proceso varias veces sin problemas, ya que está diseñado para no duplicar
            datos.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Éxito</AlertTitle>
              <AlertDescription className="text-green-700">
                La base de datos ha sido configurada correctamente.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSetupDatabase} disabled={loading} className="w-full">
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Configurando...
              </>
            ) : (
              "Configurar Base de Datos"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}


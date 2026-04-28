# Inventario CRM — Prototipo

## Contexto
Prototipo mobile de gestión de inventario para ejecutivos 
de venta de Bold.co. Web app que corre en navegador.
Es exploratorio — no va a producción directa.

## Stack
React + TypeScript + Vite + TailwindCSS
TanStack Query + Zustand + React Router
Datos mock en src/data/fixtures.ts

## Correr el proyecto
npm run dev → http://localhost:5173

## Módulos
1. Inventory Overview ← EN PROGRESO
2. Órdenes (lista + detalle + confirmación)
3. Asignaciones (creación/reasignación)
4. Historial/Movimientos
5. Novedades (placeholder, sin lógica)

## Reglas de negocio clave
- Productos: serializable (por serial) vs PoP (por cantidad)
- Agregar producto nuevo no debe requerir cambiar código
- Seriales se envían al backend inmediatamente al escanearse
- PoP se envía al presionar "confirmar conteo" parcial
- Artículos confirmados desaparecen del listado
- Guard de navegación si sale sin guardar PoP

## Vencimiento de órdenes
- Origen proveedor logístico → confirma automáticamente
- Origen ejecutivo/teamlead + 0 confirmados → devuelve al dueño
- Origen ejecutivo/teamlead + ≥1 confirmado → confirma restante

## Asignaciones
- Cada ejecutivo gestiona su propia bodega
- Puede asignar a otro ejecutivo desde su propia bodega
- Receptor no entra a bodega ajena

## Pendientes en Inventory Overview
1. Íconos de productos no cargan — extraer de Figma
2. Cantidades muestran 0 — revisar conexión fixtures.ts
3. Efecto glow del tab General seleccionado no visible
4. Tabs de navegación deben moverse con scroll, no sticky

## Figma
Archivo: W7ttFXrZcazm1qWRwyUfru
Siempre usar get_design_context para replicar diseños
Los diseños son mobile-first
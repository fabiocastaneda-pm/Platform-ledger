## Why

La plataforma Ledger necesita soportar operaciones **multi-país** (Colombia y Perú) como primer paso hacia la expansión regional de Bold. Adicionalmente, la frecuencia del ledger es un atributo operativo crítico que hoy no existe, lo cual obliga a los analistas de FinOps a documentarlo por fuera del sistema. Por último, la configuración ERP está enterrada como tab dentro del detalle de un ledger, lo que genera fricción para equipos que gestionan múltiples integraciones: necesita visibilidad de primer nivel.

## What Changes

- **`ledger-management` (MODIFIED):** Agregar campo `país` (Colombia/Perú) y `frecuencia` (Diario/Semanal/Quincenal/Mensual) al modelo de ledger. Mostrar `país` como columna en la tabla principal.
- **`erp-config` (MODIFIED):** Sacar la configuración ERP del tab en el detalle de ledger y convertirla en un **módulo independiente** en la navegación lateral, ubicado justo debajo de "Ledgers".

## Capabilities

### New Capabilities

<!-- Ninguna capacidad nueva — todo es modificación de existentes -->

### Modified Capabilities

- `ledger-management`: Se agregan campos `país` y `frecuencia` al modelo y al formulario de creación. La tabla de lista de ledgers muestra la nueva columna `país`.
- `erp-config`: Deja de ser un tab embebido en el detalle de ledger. Pasa a ser un módulo de navegación de primer nivel con vista propia que agrupa la configuración ERP de todos los ledgers.

## Impact

- **`src/types/index.ts`:** Agregar `country: 'colombia' | 'peru'` y `frequency: 'diario' | 'semanal' | 'quincenal' | 'mensual'` al tipo `Ledger`.
- **`src/services/mock/ledgers.ts`:** Actualizar los 5 ledgers mock con valores de `country` y `frequency`.
- **`src/modules/ledgers/LedgerList.tsx`:** Agregar columna `País` con flag emoji a la tabla.
- **`src/modules/ledgers/CreateLedgerModal.tsx`:** Agregar campos `País` y `Frecuencia` al formulario.
- **`src/modules/ledgers/LedgerDetail.tsx`:** Eliminar tab "Exportación ERP".
- **`src/modules/erp/ERPModule.tsx`:** Nuevo componente de módulo independiente con vista de todos los ledgers y su configuración ERP.
- **`src/components/ui/Sidebar.tsx`:** Agregar ítem "ERP / Exportación" debajo de "Ledgers".
- **`src/App.tsx`:** Agregar ruta `/erp` al router.

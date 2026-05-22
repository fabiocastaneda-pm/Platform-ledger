## 1. Modelo de datos

- [ ] 1.1 Agregar `country: 'colombia' | 'peru'` y `frequency: 'diario' | 'semanal' | 'quincenal' | 'mensual'` al tipo `Ledger` en `types/index.ts`
- [ ] 1.2 Actualizar los 5 ledgers mock en `services/mock/ledgers.ts` con valores de `country` y `frequency`

## 2. Módulo Ledgers — Lista

- [ ] 2.1 Agregar columna "País" con bandera emoji (🇨🇴 / 🇵🇪) en `LedgerList.tsx`
- [ ] 2.2 Agregar filtro por país al panel de filtros de la tabla

## 3. Módulo Ledgers — Crear

- [ ] 3.1 Agregar campo "País" (dropdown Colombia/Perú) en `CreateLedgerModal.tsx`
- [ ] 3.2 Agregar campo "Frecuencia" (dropdown Diario/Semanal/Quincenal/Mensual) en `CreateLedgerModal.tsx`
- [ ] 3.3 Agregar validaciones obligatorias para ambos campos nuevos

## 4. Módulo Ledgers — Detalle

- [ ] 4.1 Remover tab "Exportación ERP" de `LedgerDetail.tsx`
- [ ] 4.2 Actualizar constante TABS a solo ["Información General", "Configuración Contable"]
- [ ] 4.3 Mostrar `country` y `frequency` en la tarjeta de Información General

## 5. Nuevo Módulo ERP Independiente

- [ ] 5.1 Crear `src/modules/erp/ERPModule.tsx` con tabla centralizada de ledgers + estado ERP
- [ ] 5.2 Mostrar columnas: Ledger, País, Frecuencia, Formato, Estado ERP, Acciones
- [ ] 5.3 Reutilizar `ERPConfigTab` en modal/drawer al hacer clic en "Configurar"

## 6. Navegación

- [ ] 6.1 Agregar ítem "Exportación ERP" (icono: Upload) en `Sidebar.tsx` debajo de Ledgers
- [ ] 6.2 Agregar ruta `/erp` en `App.tsx` apuntando a `ERPModule`

## 7. Build y deploy

- [ ] 7.1 Verificar build sin errores TypeScript
- [ ] 7.2 Push y deploy a GitHub Pages

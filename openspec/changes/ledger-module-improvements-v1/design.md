## Context

El módulo de Ledgers es el núcleo de la plataforma. Se añaden dos campos de configuración operativa (`país`, `frecuencia`) que son atributos del negocio, no de la contabilidad. El módulo ERP se segrega para mejorar la arquitectura de información del Back Office: los equipos de integración (DevOps, Finanzas) necesitan ver y gestionar todas las configuraciones ERP en una sola vista, sin navegar ledger por ledger.

## Goals / Non-Goals

**Goals:**
- Soporte multi-país en el modelo de datos desde la creación del ledger
- Frecuencia como atributo obligatorio del ledger (define el ciclo de cierre)
- Módulo ERP con vista centralizada de configuraciones por ledger
- Migración transparente: los ledgers existentes reciben valores por defecto

**Non-Goals:**
- Lógica de negocio diferenciada por país (ej: cuentas PUC distintas por país) — Fase 2
- Ejecución real de exportación ERP — ya excluido en PRD Fase 1
- Soporte de más países (México, Chile, etc.) — Fase 2

## Decisions

**D1: `país` como string enum (`colombia` | `peru`) en lugar de un catálogo dinámico**
Fase 1 solo requiere 2 países. Un enum tipado evita errores y simplifica validación. El catálogo dinámico se implementará cuando se agreguen más países en Fase 2.

**D2: `frecuencia` es campo obligatorio en creación**
La frecuencia define el ciclo de cierre contable. Un ledger sin frecuencia definida genera ambigüedad en el reporting. Se hace obligatorio desde la creación; los ledgers mock existentes reciben `frecuencia: 'mensual'` como default retroactivo.

**D3: Módulo ERP como lista de ledgers con estado de configuración**
El módulo ERP muestra todos los ledgers con su estado de configuración ERP (Configurado / No configurado) y permite acceder al detalle de configuración de cada uno. Es una vista de gestión centralizada, no duplica la lógica del componente `ERPConfigTab` — lo reutiliza.

**D4: Remover tab ERP del detalle de ledger**
El tab ERP en el detalle de ledger generaba confusión: ¿es un atributo del ledger o una integración separada? Al separarlo, el detalle del ledger queda enfocado en lo contable (Info + Config Contable) y el módulo ERP queda enfocado en integraciones.

## Risks / Trade-offs

- [Ledgers mock sin `country`/`frequency`] → Asignar valores por defecto en el seed: `country: 'colombia'`, `frequency: 'mensual'`
- [Tab ERP removido pero usuarios podrían buscarlo ahí] → El sidebar mostrará el nuevo módulo claramente etiquetado

## Migration Plan

1. Actualizar `types/index.ts` con nuevos campos
2. Actualizar mock data con valores por defecto
3. Actualizar `CreateLedgerModal` y `LedgerList`
4. Remover tab ERP de `LedgerDetail`
5. Crear `ERPModule` nuevo con lista centralizada
6. Actualizar `Sidebar` y `App.tsx` con nueva ruta

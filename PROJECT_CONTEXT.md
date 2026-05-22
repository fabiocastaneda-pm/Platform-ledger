# Contexto del Proyecto — Plataforma de Autogestión de Ledger

> **Documento generado:** 2026-05-22  
> **Versión actual:** `v1.1.0`  
> **Repositorio:** https://github.com/dev-facastaa/Ledger-platform  
> **Deploy en vivo:** https://dev-facastaa.github.io/Ledger-platform/  
> **Owner:** facastaa@gmail.com — [@dev-facastaa](https://github.com/dev-facastaa)

---

## 1. Propósito del Proyecto

Prototipo funcional de una **Plataforma de Autogestión de Ledger** para el equipo de **Finance Core de Bold**. Permite a los equipos de FinOps configurar, gestionar y monitorear ledgers contables sin depender del equipo de ingeniería para cambios de configuración.

### Contexto de negocio
- Bold procesa pagos (cashout, datáfonos, PSE, remesas) en múltiples países (Colombia, Perú).
- Cada producto financiero requiere reglas contables propias (asientos débito/crédito, cuentas PUC, frecuencias).
- Hoy esa configuración es manual y costosa de cambiar. Este prototipo define la UX del self-service que lo reemplazará.

### Metodología
El proyecto usa **[OpenSpec](https://openspec.dev/)** como framework de desarrollo spec-driven: cada mejora genera artefactos `proposal.md`, `design.md`, `specs/`, `tasks.md` antes de implementarse.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| UI Framework | React | 19.2.6 |
| Lenguaje | TypeScript | ~6.0.2 |
| Build tool | Vite | 8.0.12 |
| Estilos | TailwindCSS v4 | 4.3.0 |
| State global | Zustand | 5.0.13 |
| Data fetching | React Query (@tanstack) | 5.100.10 |
| Routing | React Router v6 | 7.15.1 |
| Gráficos | Recharts | 3.8.1 |
| Iconos | Lucide React | 1.16.0 |
| CI/CD | GitHub Actions | — |
| Hosting | GitHub Pages | — |
| CLI AI | Claude Code CLI | 2.1.149 |

### Configuración de build
```ts
// vite.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/Ledger-platform/',          // Necesario para GitHub Pages
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),  // Expone versión en UI
  },
})
```

### Scripts npm
```bash
npm run dev        # Servidor local (Vite)
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run preview    # Preview del build
```

---

## 3. Diseño — Bold Design System

| Token | Valor |
|-------|-------|
| Color primario | `#121e6c` (azul Bold) |
| Color acento/coral | `#ee424e` (rojo Bold) |
| Color secundario | `#3e4983` |
| Color texto suave | `#6c759f` |
| Color placeholder | `#969bbd` |
| Fondo neutro | `#f1f2f6` |
| Borde | `#d2d4e1` |
| Fuente | Montserrat (Google Fonts) |
| Hover filas tabla | `#fdeaeb` |

### Componentes UI propios (`src/components/ui/`)
- `AppLayout.tsx` — shell con Sidebar + Outlet
- `Sidebar.tsx` — navegación lateral colapsable, muestra versión
- `PageHeader.tsx` — cabecera de página con breadcrumbs y acciones
- `Card.tsx` — contenedor con sombra suave
- `Button.tsx` — variantes: primary, secondary, danger + estado loading
- `Input.tsx` — Input, Select, Textarea con labels y mensajes de error
- `Badge.tsx` — chips de estado (activo/inactivo/borrador)
- `Modal.tsx` — Modal genérico + ConfirmModal
- `EmptyState.tsx` — estado vacío con icono, título, descripción y CTA
- `Toast.tsx` — notificaciones flotantes (success/error/warning, 4s auto-dismiss)

---

## 4. Estructura de Archivos

```
ledger-platform/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD → GitHub Pages en push a main
├── openspec/
│   └── changes/
│       └── ledger-module-improvements-v1/
│           ├── .openspec.yaml
│           ├── proposal.md
│           ├── design.md
│           ├── tasks.md
│           └── specs/
│               ├── ledger-management/spec.md
│               └── erp-config/spec.md
├── public/
│   └── share.html                  # Landing page para stakeholders
├── src/
│   ├── App.tsx                     # Router principal + rutas
│   ├── main.tsx                    # Entry point React
│   ├── vite-env.d.ts               # Declara __APP_VERSION__ global
│   ├── index.css                   # Tokens Tailwind + Google Fonts
│   ├── types/
│   │   └── index.ts                # Todos los tipos TypeScript
│   ├── store/
│   │   └── index.ts                # Zustand store global
│   ├── services/mock/
│   │   ├── ledgers.ts              # 5 ledgers mock + PRODUCTS/COUNTRIES/FREQUENCIES
│   │   ├── accounts.ts             # Cuentas contables mock
│   │   ├── transactions.ts         # Transacciones mock
│   │   └── audit.ts                # Eventos de auditoría mock
│   ├── components/ui/              # Design system (ver sección 3)
│   └── modules/
│       ├── ledgers/
│       │   ├── LedgerList.tsx      # Tabla con filtros (estado, país, producto)
│       │   ├── LedgerDetail.tsx    # Detalle + tabs Info General / Config Contable
│       │   └── CreateLedgerModal.tsx # Modal crear ledger
│       ├── accounting/
│       │   └── AccountingConfigTab.tsx  # Gestión de configs contables por tipo tx
│       ├── erp/
│       │   ├── ERPModule.tsx       # Módulo independiente /erp (v1.1.0)
│       │   └── ERPConfigTab.tsx    # Formulario config ERP (reutilizado en modal)
│       ├── monitoring/
│       │   ├── Dashboard.tsx       # Métricas, gráficos, alertas
│       │   └── TransactionLog.tsx  # Log de transacciones paginado
│       ├── accounts/
│       │   └── ChartOfAccounts.tsx # Plan de cuentas contables
│       └── audit/
│           └── AuditLog.tsx        # Historial de cambios por evento
├── CHANGELOG.md                    # Historial de versiones
├── PROJECT_CONTEXT.md              # Este archivo
├── package.json                    # v1.1.0
└── vite.config.ts
```

---

## 5. Módulos de la Plataforma

### 5.1 Ledgers (`/ledgers`)
Módulo principal. Gestión del ciclo de vida completo de un ledger.

**Lista (`LedgerList.tsx`)**
- Tabla con columnas: Nombre, Producto, País 🇨🇴🇵🇪, Frecuencia, Estado, Configs, Modificación, Acciones
- Filtros: búsqueda por nombre, estado (activo/inactivo/borrador), país, producto
- Botón "Crear Ledger" → abre `CreateLedgerModal`

**Crear (`CreateLedgerModal.tsx`)**
- Campos: Nombre* (regex `[a-zA-Z0-9_-]`, max 100), Producto*, País* (Colombia/Perú), Frecuencia* (Diario/Semanal/Quincenal/Mensual), Descripción (max 500)
- Validaciones obligatorias en todos los campos marcados con `*`
- Estado inicial siempre: **Borrador**
- Navega automáticamente al detalle tras crear

**Detalle (`LedgerDetail.tsx`)**
- Breadcrumb: Ledgers → `{nombre}`
- Acciones en header: Activar / Desactivar / Reactivar / Editar según estado
- Tabs: **Información General** | **Configuración Contable**
- Info General muestra: ID, Nombre, Producto, País, Frecuencia, Estado + tarjeta de auditoría (creado por, fechas, configs, link a auditoría y al módulo ERP)
- Regla de negocio: un ledger **no puede activarse** sin al menos 1 configuración contable

### 5.2 Configuración Contable (`AccountingConfigTab.tsx`)
Dentro del detalle de cada Ledger.

- Lista de `AccountingEntryConfig` por tipo de transacción
- Cada config tiene: `transactionType`, `description`, `version`, `fieldMappings[]`
- Cada `FieldMapping` tiene: `fieldName`, `accountCode`, `accountName`, `nature` (débito/crédito)
- Crear / editar / eliminar configuraciones con modales
- Versionado automático al editar (incrementa `version`)

### 5.3 Monitoreo (`/monitoring`)
Dashboard de salud del sistema en tiempo real (datos mock).

- **Métricas clave**: total transacciones, latencia promedio, P50 / P95 / P99, tasa de error
- **Gráfico de barras**: volumen por ledger (Recharts)
- **Gráfico de línea**: histórico horario transacciones + errores
- **Alertas activas**: latencia alta, tasa de error elevada, inactividad (severidad warning/critical)

### 5.4 Transacciones (`/transactions`)
Log completo de transacciones procesadas.

- Tabla paginada con: ID, Cliente, Ledger, Tipo, Estado, Monto, Fecha, Latencia
- Filtros: búsqueda por ID/cliente, ledger, estado (processed/failed/pending)
- Click en fila → drawer/modal con detalle: payload completo + asientos contables generados (tabla débito/crédito)

### 5.5 Plan de Cuentas (`/accounts`)
Catálogo maestro de cuentas contables.

- Tabla: Código, Nombre, Tipo (activo/pasivo/ingreso/egreso/patrimonio), Estado
- Crear cuenta: código único, nombre, tipo
- Inactivar / reactivar cuentas
- Búsqueda por código o nombre

### 5.6 Auditoría (`/audit`)
Historial inmutable de todos los cambios en la plataforma.

- Eventos: `crear_ledger`, `editar_ledger`, `cambiar_estado`, `crear_config`, `editar_config`, `eliminar_config`
- Columnas: Fecha, Usuario, Acción, Ledger, IP
- Click → modal con diff `before` / `after` del cambio
- Filtros: por acción, por usuario

### 5.7 Exportación ERP (`/erp`) — *Nuevo en v1.1.0*
Módulo independiente para gestión centralizada de exportaciones contables al ERP.

- **Tabla resumen**: todos los ledgers con columnas País, Frecuencia, Formato ERP, Estado ERP (Configurado / No configurado), Estado Ledger
- **Cards de métricas**: Total ledgers | Configurados | Pendientes
- **Botón "Configurar"**: abre `ERPConfigTab` en modal sin salir de la vista
- **ERPConfigTab** (reutilizable): formato (CSV/JSON/XML), frecuencia (diaria/semanal/mensual), mapeo de campos (ledger → ERP), preview del archivo exportado
- Banner informativo: exportación automática disponible en Fase 2 del roadmap

---

## 6. Modelo de Datos

### Tipos principales (`src/types/index.ts`)

```typescript
type LedgerStatus   = 'borrador' | 'activo' | 'inactivo'
type LedgerCountry  = 'colombia' | 'peru'
type LedgerFrequency = 'diario' | 'semanal' | 'quincenal' | 'mensual'
type AccountNature  = 'debito' | 'credito'
type AccountType    = 'activo' | 'pasivo' | 'ingreso' | 'egreso' | 'patrimonio'
type ExportFormat   = 'CSV' | 'JSON' | 'XML'
type ExportFrequency = 'diaria' | 'semanal' | 'mensual'

interface Ledger {
  id: string
  name: string              // regex [a-zA-Z0-9_-], max 100
  product: string
  description?: string      // max 500
  status: LedgerStatus
  country: LedgerCountry    // añadido v1.1.0
  frequency: LedgerFrequency // añadido v1.1.0
  createdAt: string         // ISO 8601
  updatedAt: string
  createdBy: string         // email
  configs: AccountingEntryConfig[]
  erpConfig?: ERPConfig
}

interface AccountingEntryConfig {
  id: string
  ledgerId: string
  transactionType: string
  description?: string
  fieldMappings: FieldMapping[]
  createdAt: string
  version: number           // auto-increment al editar
}

interface FieldMapping {
  id: string
  fieldName: string
  accountCode: string
  accountName: string
  nature: AccountNature     // 'debito' | 'credito'
}

interface ERPConfig {
  format: ExportFormat
  frequency: ExportFrequency
  fieldMappings: { source: string; target: string }[]
  configured: boolean
}
```

### Mock data (`src/services/mock/ledgers.ts`)
5 ledgers precargados:

| ID | Nombre | Producto | País | Frecuencia | Estado |
|----|--------|---------|------|-----------|--------|
| ldg-001 | ledger_cashout_montos_altos | Cashout Montos Altos | 🇨🇴 Colombia | Diario | Activo |
| ldg-002 | ledger_remesas_internacionales | Remesas Internacionales | 🇵🇪 Perú | Mensual | Activo |
| ldg-003 | ledger_pagos_pse | Pagos PSE | 🇨🇴 Colombia | Semanal | Activo |
| ldg-004 | ledger_dataphone_terminal | Datáfonos Terminal | 🇨🇴 Colombia | Quincenal | Inactivo |
| ldg-005 | ledger_cashout_express | Cashout Express | 🇵🇪 Perú | Diario | Borrador |

### Constantes exportadas desde mock
```typescript
export const PRODUCTS    // 7 productos: Cashout, Remesas, PSE, Datáfonos, Link de Pago, Cobro Recurrente...
export const COUNTRIES   // [{ value: 'colombia', label: '🇨🇴 Colombia' }, { value: 'peru', label: '🇵🇪 Perú' }]
export const FREQUENCIES // [diario, semanal, quincenal, mensual]
```

---

## 7. Estado Global (Zustand)

```typescript
// src/store/index.ts
interface AppStore {
  ledgers: Ledger[]        // inicializado con mockLedgers
  accounts: Account[]      // inicializado con mockAccounts
  toasts: Toast[]
  currentUser: string      // 'maria.lopez@bold.co'

  addLedger(ledger)
  updateLedger(id, updates)   // actualiza updatedAt automáticamente
  addToast(type, message)     // auto-dismiss en 4 segundos
  removeToast(id)
  addAccount(account)
}
```

---

## 8. Rutas

```
/                    → redirect a /ledgers
/ledgers             → LedgerList
/ledgers/:id         → LedgerDetail
/erp                 → ERPModule (v1.1.0)
/monitoring          → Dashboard
/transactions        → TransactionLog
/accounts            → ChartOfAccounts
/audit               → AuditLog
```

**Router configurado con** `basename="/Ledger-platform"` para funcionar correctamente en GitHub Pages (subpath).

---

## 9. CI/CD y Deploy

### Flujo automático
```
git push origin main
    ↓
GitHub Actions (.github/workflows/deploy.yml)
    ↓
npm ci → npm run build → upload artifact (dist/)
    ↓
deploy-pages → https://dev-facastaa.github.io/Ledger-platform/
```

### Deploy manual
```bash
npm run build
# El contenido de /dist se sube automáticamente con el push
```

### GitHub Pages
- **URL:** https://dev-facastaa.github.io/Ledger-platform/
- **Branch de deploy:** `main` (via GitHub Actions)
- **Trigger:** cualquier push a `main` o `workflow_dispatch`
- **Landing page stakeholders:** https://dev-facastaa.github.io/Ledger-platform/share.html

---

## 10. Versionado

### Convención semver

| Tipo | Cuándo | Ejemplo |
|------|--------|---------|
| `PATCH` x.x.**Z** | Bug fix, ajuste visual, fix infra | Corregir estilo roto |
| `MINOR` x.**Y**.0 | Nueva funcionalidad o módulo | Módulo ERP, campo País |
| `MAJOR` **X**.0.0 | Rediseño, migración a API real, ruptura de flujo | Paso a producción |

### Historial de versiones

| Versión | Fecha | Resumen |
|---------|-------|---------|
| **v1.1.0** | 2026-05-22 | País/Frecuencia en Ledger, módulo ERP independiente, sistema de versionado |
| **v1.0.0** | 2026-05-13 | Prototipo completo: 7 módulos, Bold Design System, CI/CD, GitHub Pages |

### Proceso de release
```bash
# 1. Actualizar versión
# Editar package.json → "version": "X.Y.Z"

# 2. Actualizar CHANGELOG.md con la nueva entrada

# 3. Commit
git add package.json CHANGELOG.md [archivos cambiados]
git commit -m "feat/fix/chore: descripción"

# 4. Tag y push
git tag -a vX.Y.Z HEAD -m "vX.Y.Z — resumen"
git push origin main --tags

# 5. GitHub Release
gh release create vX.Y.Z --title "vX.Y.Z — título" --notes "..."
```

### Versión en la UI
La versión se muestra en el footer del Sidebar (`v1.1.0 · PROTO`). Se actualiza automáticamente al buildear desde `package.json` vía `__APP_VERSION__` en `vite.config.ts`.

---

## 11. OpenSpec — Cambios documentados

### Change: `ledger-module-improvements-v1`
Ubicación: `openspec/changes/ledger-module-improvements-v1/`

| Artefacto | Descripción |
|-----------|-------------|
| `proposal.md` | Justificación de negocio: por qué se necesita País, Frecuencia y ERP independiente |
| `design.md` | Decisiones técnicas, trade-offs, impacto en tipos y componentes |
| `specs/ledger-management/spec.md` | Requirements + scenarios para País/Frecuencia en Ledger |
| `specs/erp-config/spec.md` | Requirements + scenarios para módulo ERP independiente |
| `tasks.md` | Checklist de tareas de implementación (7 secciones, todas completadas ✅) |

---

## 12. Problemas Resueltos

| Problema | Causa | Solución |
|----------|-------|----------|
| Node.js no encontrado en CI/scripts | PATH no incluía Homebrew node | Usar ruta completa `/opt/homebrew/Cellar/node/26.0.0/bin/node` |
| GitHub Pages en blanco | React Router sin `basename` en subdirectorio | Agregar `basename="/Ledger-platform"` a `<BrowserRouter>` |
| Build fallaba con TS6133 | Imports declarados pero no usados | Remover imports no utilizados (`FREQUENCIES` en LedgerList, etc.) |
| Push a GitHub fallaba | Sin credenciales git configuradas | Instalar GitHub CLI (`brew install gh`) + `gh auth login` + `gh auth setup-git` |
| CSS @import warning | `@import url()` después de `@import "tailwindcss"` | Mover Google Fonts `@import` antes del import de Tailwind |
| Preview del servidor no encontrado | `.claude/launch.json` dentro del proyecto en lugar del directorio raíz | Crear el archivo en el directorio correcto |

---

## 13. Próximos Pasos Sugeridos (Backlog)

### Funcionalidades pendientes (prototipo)
- [ ] **Paginación real** en tablas de Transacciones y Auditoría
- [ ] **Búsqueda por múltiples campos** en TransactionLog
- [ ] **Editar País/Frecuencia** desde el modal de edición en LedgerDetail
- [ ] **Validación duplicados** en Plan de Cuentas (código único)
- [ ] **Exportar CSV** del log de transacciones

### Preparación para Fase 2 (API real)
- [ ] Reemplazar mock services por llamadas HTTP reales (React Query ya está configurado)
- [ ] Autenticación real (SSO Bold) reemplazando `currentUser` hardcodeado
- [ ] Activar exportación ERP automática programada
- [ ] Websockets para métricas de monitoreo en tiempo real
- [ ] Tests unitarios (Vitest + React Testing Library)

### Mejoras de arquitectura
- [ ] Code splitting con `React.lazy()` por módulo (el bundle actual es ~700kb)
- [ ] Error boundaries por módulo
- [ ] Internacionalización (i18n) para soporte multi-idioma

---

## 14. Contexto de Desarrollo

- **Desarrollado con:** Claude Code (Anthropic) + Claude Sonnet
- **Ambiente local:** macOS, Node.js v26.0.0 (Homebrew), npm 11.12.1
- **Claude Code CLI:** v2.1.149 (instalado globalmente vía npm)
- **Tiempo de desarrollo:** sesiones de trabajo en Mayo 2026
- **Usuario activo simulado:** `maria.lopez@bold.co` (Admin FinOps)

---

*Para continuar el desarrollo, abre una terminal en la carpeta del proyecto y ejecuta `claude` para iniciar una sesión de Claude Code con todo el contexto del repositorio.*

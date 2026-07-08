# Migración de repositorio — Julio 2026

## Contexto

El prototipo estaba alojado en la cuenta personal anterior `dev-facastaa`. Se migró a la cuenta `fabiocastaneda-pm` para consolidar el trabajo bajo una sola identidad.

## Cambios realizados

| Qué | Antes | Después |
|-----|-------|---------|
| Repositorio | `dev-facastaa/Ledger-platform` | `fabiocastaneda-pm/Platform-ledger` |
| URL prototipo | `dev-facastaa.github.io/Ledger-platform/` | `fabiocastaneda-pm.github.io/Platform-ledger/` |
| `vite.config.ts` base | `/Ledger-platform/` | `/Platform-ledger/` |
| `App.tsx` Router basename | `/Ledger-platform` | `/Platform-ledger` |
| Git remote origin | cuenta antigua | cuenta nueva |

## Configuración GitHub Pages

- **Source:** GitHub Actions
- **Workflow:** `.github/workflows/deploy.yml`
- **Trigger:** push a `main` (deploy automático)
- **Environment:** `github-pages` con "No restriction" en deployment branches

## Estado de branches al momento de la migración

- `main` — producción, desplegado
- `develop` — 1 commit adelante de main (`CHANGELOG-v1.2.md`) — mergeado durante la migración

## URL activa

**`https://fabiocastaneda-pm.github.io/Platform-ledger/`**

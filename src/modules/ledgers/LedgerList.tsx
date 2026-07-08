import { useState } from 'react'
import type { ReactNode } from 'react'
import { Plus, Search, BookOpen, Edit2, Eye, Play, Pause } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal, ConfirmModal } from '../../components/ui/Modal'
import { CreateLedgerModal } from './CreateLedgerModal'
import { EditLedgerModal } from './EditLedgerModal'
import type { Ledger, LedgerStatus } from '../../types'
import { PRODUCTS } from '../../services/mock/ledgers'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'borrador', label: 'Borrador' },
]

const PRODUCT_OPTIONS = [
  { value: '', label: 'Todos los productos' },
  ...PRODUCTS.map(p => ({ value: p, label: p })),
]

const FREQUENCY_LABELS: Record<string, string> = {
  diario: 'Diario', semanal: 'Semanal', quincenal: 'Quincenal', mensual: 'Mensual',
}

export function LedgerList() {
  const { ledgers, selectedCountry, updateLedger, addToast } = useAppStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LedgerStatus | ''>('')
  const [productFilter, setProductFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  // Estado para acciones de fila
  const [editTarget, setEditTarget] = useState<Ledger | null>(null)
  const [activateTarget, setActivateTarget] = useState<Ledger | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<Ledger | null>(null)
  const [deactivateReason, setDeactivateReason] = useState('')
  const [loading, setLoading] = useState(false)

  const filtered = ledgers.filter(l => {
    const matchSearch  = l.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus  = !statusFilter  || l.status  === statusFilter
    const matchProduct = !productFilter || l.product === productFilter
    const matchCountry = l.country === selectedCountry
    return matchSearch && matchStatus && matchProduct && matchCountry
  })

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

  const handleActivate = async () => {
    if (!activateTarget) return
    if (activateTarget.configs.length === 0) {
      addToast('error', 'El ledger debe tener al menos una configuración contable antes de activarse')
      setActivateTarget(null)
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    updateLedger(activateTarget.id, { status: 'activo' })
    addToast('success', 'Ledger activado correctamente')
    setLoading(false)
    setActivateTarget(null)
  }

  const handleDeactivate = async () => {
    if (!deactivateTarget) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    updateLedger(deactivateTarget.id, { status: 'inactivo' })
    addToast('success', 'Ledger desactivado')
    setLoading(false)
    setDeactivateTarget(null)
    setDeactivateReason('')
  }

  const iconBtn = (onClick: () => void, title: string, children: ReactNode, danger = false) => (
    <button
      className="p-2 rounded-lg transition-colors"
      style={{ color: '#606060' }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.background = danger ? '#FBF3F5' : '#F1F2F6'
        el.style.color = danger ? '#910022' : '#121E6C'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.background = 'transparent'
        el.style.color = '#606060'
      }}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )

  return (
    <div className="fade-in">
      <PageHeader
        title="Ledgers"
        breadcrumbs={[{ label: 'Ledgers' }]}
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={18} />
            Crear Ledger
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#969696' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre..."
                className="h-12 w-full pl-10 pr-4 border border-[#969696] text-sm focus:outline-none focus:border-2 focus:border-[#FF2947] bg-white text-[#121E6C] placeholder:text-[#606060]"
                style={{ borderRadius: '12px' }}
              />
            </div>
          </div>
          <div className="w-40">
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as LedgerStatus | '')}
            />
          </div>
          <div className="w-52">
            <Select
              options={PRODUCT_OPTIONS}
              value={productFilter}
              onChange={e => setProductFilter(e.target.value)}
            />
          </div>
          <p className="text-sm" style={{ color: '#606060' }}>
            {filtered.length} ledger{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={28} />}
            title="No se encontraron ledgers"
            description="Ajusta los filtros o crea un nuevo ledger para comenzar."
            action={{ label: 'Crear Ledger', onClick: () => setShowCreate(true) }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F1F2F6', borderBottom: '2px solid #F1F2F6' }}>
                  <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: '#121E6C' }}>Nombre</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold whitespace-nowrap" style={{ color: '#121E6C' }}>ID Interno</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: '#121E6C' }}>Frecuencia</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: '#121E6C' }}>Estado</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: '#121E6C' }}>Configs</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: '#121E6C' }}>Modificación</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: '#121E6C' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ledger => (
                  <tr
                    key={ledger.id}
                    className="border-b border-[#F1F2F6] hover:bg-[#F1F9FF] transition-colors cursor-pointer"
                    onClick={() => navigate(`/ledgers/${ledger.id}`)}
                  >
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold" style={{ color: '#121E6C' }}>{ledger.name}</p>
                      {ledger.description && (
                        <p className="text-xs truncate max-w-[200px]" style={{ color: '#606060' }}>{ledger.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className="text-xs font-mono font-semibold px-2 py-1 rounded-md"
                        style={{ background: '#F3F3F3', color: '#3E4983', whiteSpace: 'nowrap' }}
                      >
                        {ledger.internalId}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded-full"
                        style={{ background: '#F3F3F3', color: '#3E4983' }}
                      >
                        {FREQUENCY_LABELS[ledger.frequency]}
                      </span>
                    </td>
                    <td className="px-4 py-4"><Badge status={ledger.status} /></td>
                    <td className="px-4 py-4 text-sm" style={{ color: '#606060' }}>
                      {ledger.configs.length} tipo{ledger.configs.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-4 text-sm" style={{ color: '#606060' }}>{formatDate(ledger.updatedAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        {iconBtn(() => navigate(`/ledgers/${ledger.id}`), 'Ver detalle', <Eye size={16} />)}
                        {iconBtn(() => setEditTarget(ledger), 'Editar', <Edit2 size={16} />)}
                        {ledger.status === 'borrador' && iconBtn(
                          () => setActivateTarget(ledger),
                          'Activar',
                          <Play size={16} />,
                        )}
                        {ledger.status === 'activo' && iconBtn(
                          () => { setDeactivateTarget(ledger); setDeactivateReason('') },
                          'Desactivar',
                          <Pause size={16} />,
                          true,
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CreateLedgerModal open={showCreate} onClose={() => setShowCreate(false)} />

      {editTarget && (
        <EditLedgerModal
          ledger={editTarget}
          open
          onClose={() => setEditTarget(null)}
        />
      )}

      <ConfirmModal
        open={!!activateTarget}
        onClose={() => setActivateTarget(null)}
        onConfirm={handleActivate}
        title="Activar Ledger"
        message={`El ledger "${activateTarget?.name}" comenzará a procesar transacciones reales. ¿Continuar?`}
        confirmLabel="Activar"
        variant="primary"
        loading={loading}
      />

      <Modal
        open={!!deactivateTarget}
        onClose={() => { setDeactivateTarget(null); setDeactivateReason('') }}
        title="Desactivar Ledger"
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setDeactivateTarget(null); setDeactivateReason('') }} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeactivate} loading={loading} disabled={!deactivateReason.trim()}>
              Desactivar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: '#6c759f' }}>
            El ledger <strong>{deactivateTarget?.name}</strong> dejará de aceptar nuevas transacciones. El historial se preserva.
          </p>
          <Textarea
            label="Motivo de desactivación *"
            value={deactivateReason}
            onChange={e => setDeactivateReason(e.target.value)}
            placeholder="Ej: Producto descontinuado, revisión de configuración contable..."
            rows={3}
          />
        </div>
      </Modal>
    </div>
  )
}

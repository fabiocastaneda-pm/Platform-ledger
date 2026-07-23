import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Upload, Search } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ConfirmModal } from '../../components/ui/Modal'
import { BulkUploadModal } from '../ledgers/BulkUploadModal'
import { useAppStore } from '../../store'
import type { Ledger, AccountingEntryConfig } from '../../types'

const MOCK_EDITORS = [
  'ana.reyes@bold.co',
  'juan.perez@bold.co',
  'maria.lopez@bold.co',
  'carlos.mendez@bold.co',
  'sofia.garcia@bold.co',
]

interface Props { ledger: Ledger }

function iconBtn(onClick: () => void, title: string, icon: React.ReactNode, danger = false) {
  return (
    <button
      onClick={onClick}
      title={title}
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
    >
      {icon}
    </button>
  )
}

export function AccountingConfigTab({ ledger }: Props) {
  const { updateLedger, addToast } = useAppStore()
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget]   = useState<string | null>(null)
  const [loading, setLoading]             = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [txSearch, setTxSearch]           = useState('')

  const handleDelete = async () => {
    if (!deleteTarget) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    updateLedger(ledger.id, { configs: ledger.configs.filter(c => c.id !== deleteTarget) })
    addToast('success', 'Configuración eliminada')
    setLoading(false)
    setDeleteTarget(null)
  }

  const openCreate = () => navigate(`/ledgers/${ledger.id}/config/new`)
  const openEdit = (cfg: AccountingEntryConfig) => navigate(`/ledgers/${ledger.id}/config/${cfg.id}`)

  const filteredConfigs = ledger.configs.filter(c =>
    !txSearch.trim() ||
    c.transactionType.toLowerCase().includes(txSearch.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(txSearch.toLowerCase())
  )

  return (
    <div className="space-y-4 fade-in">
      <div className="flex justify-between items-center">
        <p className="text-sm" style={{ color: '#606060' }}>
          {ledger.configs.length} tipo{ledger.configs.length !== 1 ? 's' : ''} de transacción configurado{ledger.configs.length !== 1 ? 's' : ''}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowBulkUpload(true)}>
            <Upload size={16} /> Carga masiva
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus size={16} /> Agregar tipo de transacción
          </Button>
        </div>
      </div>

      {/* Search */}
      {ledger.configs.length > 0 && (
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#969696' }} />
          <input
            value={txSearch}
            onChange={e => setTxSearch(e.target.value)}
            placeholder="Buscar tipo de transacción..."
            className="h-10 w-full pl-9 pr-4 border border-[#969696] text-sm focus:outline-none focus:border-2 focus:border-[#FF2947] bg-white text-[#121E6C] placeholder:text-[#606060]"
            style={{ borderRadius: '10px' }}
          />
        </div>
      )}

      {/* Table or empty state */}
      {ledger.configs.length === 0 ? (
        <Card>
          <EmptyState
            title="Sin configuración contable"
            description="Agrega al menos un tipo de transacción para poder activar este ledger."
            action={{ label: 'Agregar tipo de transacción', onClick: openCreate }}
          />
        </Card>
      ) : (
        <Card padding={false}>
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F1F2F6', borderBottom: '2px solid #F1F2F6' }}>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: '#121E6C' }}>Tipo de Transacción</th>
                <th className="text-left px-4 py-3 text-sm font-semibold" style={{ color: '#121E6C' }}>Último editor</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {filteredConfigs.map((cfg, i) => (
                <tr
                  key={cfg.id}
                  className="border-b border-[#F1F2F6] hover:bg-[#F1F9FF] transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold" style={{ color: '#121E6C' }}>{cfg.transactionType}</p>
                    {cfg.description && (
                      <p className="text-xs mt-0.5" style={{ color: '#606060' }}>{cfg.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#606060' }}>
                    {MOCK_EDITORS[i % MOCK_EDITORS.length]}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      {iconBtn(() => openEdit(cfg), 'Editar', <Edit2 size={16} />)}
                      {iconBtn(() => setDeleteTarget(cfg.id), 'Eliminar', <Trash2 size={16} />, true)}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredConfigs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm" style={{ color: '#969696' }}>
                    Sin resultados para "{txSearch}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar Configuración"
        message="¿Estás seguro de que deseas eliminar este tipo de transacción? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loading={loading}
      />

      <BulkUploadModal
        open={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        ledger={ledger}
      />
    </div>
  )
}

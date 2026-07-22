import { useState } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, AlertTriangle, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ConfirmModal } from '../../components/ui/Modal'
import { BulkUploadModal } from '../ledgers/BulkUploadModal'
import { useAppStore } from '../../store'
import type { Ledger, FieldMapping } from '../../types'

interface Props { ledger: Ledger }

function BalanceIndicator({ mappings }: { mappings: FieldMapping[] }) {
  const debits  = mappings.filter(m => m.nature === 'debito').length
  const credits = mappings.filter(m => m.nature === 'credito').length
  const balanced = debits > 0 && credits > 0 && debits === credits
  if (mappings.length === 0) return null
  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg mt-3"
      style={{ background: balanced ? '#F4FDF9' : '#FFF3D1' }}
    >
      {balanced
        ? <CheckCircle size={16} color="#1B8959" />
        : <AlertTriangle size={16} color="#FFC217" />}
      <span className="text-sm font-semibold" style={{ color: balanced ? '#1B8959' : '#5B3100' }}>
        {balanced
          ? 'Partida doble balanceada ✓'
          : `Desbalanceada: ${debits} débito(s) vs ${credits} crédito(s)`}
      </span>
    </div>
  )
}

export function AccountingConfigTab({ ledger }: Props) {
  const navigate = useNavigate()
  const { updateLedger, addToast } = useAppStore()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [loading, setLoading]           = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    updateLedger(ledger.id, { configs: ledger.configs.filter(c => c.id !== deleteTarget) })
    addToast('success', 'Configuración eliminada')
    setLoading(false)
    setDeleteTarget(null)
  }

  const iconBtn = (onClick: () => void, title: string, icon: React.ReactNode, danger = false) => (
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

  return (
    <div className="space-y-4 fade-in">
      <div className="flex justify-between items-center">
        <p className="text-sm" style={{ color: '#606060' }}>
          {ledger.configs.length} tipo(s) de transacción configurados
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowBulkUpload(true)}>
            <Upload size={16} /> Carga masiva
          </Button>
          <Button size="sm" onClick={() => navigate(`/ledgers/${ledger.id}/config/new`)}>
            <Plus size={16} /> Agregar tipo de transacción
          </Button>
        </div>
      </div>

      {ledger.configs.length === 0 ? (
        <Card>
          <EmptyState
            title="Sin configuración contable"
            description="Agrega al menos un tipo de transacción para poder activar este ledger."
            action={{ label: 'Agregar tipo de transacción', onClick: () => navigate(`/ledgers/${ledger.id}/config/new`) }}
          />
        </Card>
      ) : (
        ledger.configs.map(cfg => (
          <Card key={cfg.id}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold" style={{ color: '#121E6C' }}>{cfg.transactionType}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#F3F3F3', color: '#606060' }}>
                    v{cfg.version}
                  </span>
                </div>
                {cfg.description    && <p className="text-sm" style={{ color: '#606060' }}>{cfg.description}</p>}
                {cfg.accountingNote && <p className="text-xs italic mt-0.5" style={{ color: '#969696' }}>{cfg.accountingNote}</p>}
              </div>
              <div className="flex gap-1">
                {iconBtn(
                  () => navigate(`/ledgers/${ledger.id}/config/${cfg.id}`),
                  'Editar',
                  <Edit2 size={16} />,
                )}
                {iconBtn(
                  () => setDeleteTarget(cfg.id),
                  'Eliminar',
                  <Trash2 size={16} />,
                  true,
                )}
              </div>
            </div>

            {/* Read-only field mapping summary */}
            <table className="w-full text-sm mb-1">
              <thead>
                <tr style={{ borderBottom: '1px solid #F1F2F6' }}>
                  <th className="text-left py-2 text-xs font-semibold" style={{ color: '#606060' }}>Campo asociado</th>
                  <th className="text-left py-2 text-xs font-semibold" style={{ color: '#606060' }}>Cuenta auxiliar</th>
                  <th className="text-left py-2 text-xs font-semibold" style={{ color: '#606060' }}>CECO/CEBE</th>
                  <th className="text-left py-2 text-xs font-semibold" style={{ color: '#606060' }}>Naturaleza</th>
                </tr>
              </thead>
              <tbody>
                {cfg.fieldMappings.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #F1F2F6' }}>
                    <td className="py-2 font-mono text-xs" style={{ color: '#121E6C' }}>{m.fieldName}</td>
                    <td className="py-2 text-xs" style={{ color: '#121E6C' }}>
                      {m.accountCode}{m.accountName ? ` – ${m.accountName}` : ''}
                    </td>
                    <td className="py-2 text-xs font-mono" style={{ color: '#606060' }}>{m.ceco || '—'}</td>
                    <td className="py-2">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={m.nature === 'debito'
                          ? { background: '#F1F9FF', color: '#0A53A5' }
                          : { background: '#FBF3F5', color: '#910022' }}
                      >
                        {m.nature === 'debito' ? 'Débito' : 'Crédito'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <BalanceIndicator mappings={cfg.fieldMappings} />
          </Card>
        ))
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

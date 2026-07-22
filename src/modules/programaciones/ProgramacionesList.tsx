import { useState } from 'react'
import type { ReactNode } from 'react'
import { Edit2, Trash2, CalendarClock, ArrowRight } from 'lucide-react'
import { useAppStore } from '../../store'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ConfirmModal } from '../../components/ui/Modal'
import { ScheduleDateModal } from '../../components/ui/ScheduleDateModal'
import type { ScheduledChange, ScheduledChangeStatus } from '../../types'

const STATUS_LABELS: Record<ScheduledChangeStatus, string> = {
  pendiente: 'Pendiente',
  aplicado: 'Aplicado',
  cancelado: 'Cancelado',
}

const STATUS_STYLES: Record<ScheduledChangeStatus, { background: string; color: string }> = {
  pendiente: { background: '#FFF3D1', color: '#5B3100' },
  aplicado:  { background: '#F4FDF9', color: '#1B8959' },
  cancelado: { background: '#F3F3F3', color: '#606060' },
}

function formatDate(iso: string) {
  if (!iso) return '—'
  const [year, month, day] = iso.split('-')
  const d = new Date(Number(year), Number(month) - 1, Number(day))
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function ProgramacionesList() {
  const { scheduledChanges, updateScheduledChange, deleteScheduledChange, addToast } = useAppStore()
  const [editTarget, setEditTarget] = useState<ScheduledChange | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ScheduledChange | null>(null)

  const handleReschedule = (date: string) => {
    if (!editTarget) return
    updateScheduledChange(editTarget.id, { scheduledDate: date })
    addToast('success', `Programación actualizada al ${date}`)
    setEditTarget(null)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteScheduledChange(deleteTarget.id)
    addToast('success', 'Programación eliminada')
    setDeleteTarget(null)
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
        title="Programaciones Contables"
        breadcrumbs={[{ label: 'Programaciones Contables' }]}
      />

      <Card padding={false}>
        {scheduledChanges.length === 0 ? (
          <EmptyState
            icon={<CalendarClock size={28} />}
            title="Sin programaciones"
            description="Los cambios de cuentas contables en ledgers activos aparecerán aquí."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F1F2F6', borderBottom: '2px solid #F1F2F6' }}>
                  {['Ledger', 'Tipo Tx', 'Campo', 'Cambio programado', 'Creado', 'Fecha vigencia', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-sm font-semibold whitespace-nowrap" style={{ color: '#121E6C' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduledChanges.map(sc => (
                  <tr key={sc.id} className="border-b border-[#F1F2F6] hover:bg-[#F1F9FF] transition-colors">
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold truncate max-w-[160px]" style={{ color: '#121E6C' }}>{sc.ledgerName}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-mono" style={{ color: '#3E4983' }}>{sc.transactionType}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-mono" style={{ color: '#121E6C' }}>{sc.fieldName}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono" style={{ color: '#910022' }}>{sc.oldAccountCode}</span>
                        <span style={{ color: '#969696' }}>{sc.oldAccountName}</span>
                        <ArrowRight size={12} style={{ color: '#969696', flexShrink: 0 }} />
                        <span className="font-mono" style={{ color: '#1B8959' }}>{sc.newAccountCode}</span>
                        <span style={{ color: '#969696' }}>{sc.newAccountName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs whitespace-nowrap" style={{ color: '#606060' }}>
                      {formatDateTime(sc.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold whitespace-nowrap" style={{ color: '#121E6C' }}>
                      {formatDate(sc.scheduledDate)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={STATUS_STYLES[sc.status]}
                      >
                        {STATUS_LABELS[sc.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        {sc.status === 'pendiente' && iconBtn(
                          () => setEditTarget(sc),
                          'Editar fecha',
                          <Edit2 size={16} />,
                        )}
                        {iconBtn(
                          () => setDeleteTarget(sc),
                          'Eliminar',
                          <Trash2 size={16} />,
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

      <ScheduleDateModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onConfirm={handleReschedule}
        title="Editar fecha de programación"
        description="Selecciona la nueva fecha de vigencia para este cambio de cuenta."
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar programación"
        message={`¿Eliminar el cambio programado de ${deleteTarget?.oldAccountCode} → ${deleteTarget?.newAccountCode} para ${deleteTarget?.transactionType}?`}
        confirmLabel="Eliminar"
      />
    </div>
  )
}

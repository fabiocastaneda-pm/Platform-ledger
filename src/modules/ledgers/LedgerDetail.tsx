import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Upload, Edit2 } from 'lucide-react'
import { useAppStore } from '../../store'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Modal, ConfirmModal } from '../../components/ui/Modal'
import { Textarea } from '../../components/ui/Input'
import { AccountingConfigTab } from '../accounting/AccountingConfigTab'
import { GeneralConfigTab } from './GeneralConfigTab'
import { EditLedgerModal } from './EditLedgerModal'
import { FREQUENCIES, CURRENCIES } from '../../services/mock/ledgers'

const TABS = ['Información General', 'Configuración Tipo Transacción', 'Configuraciones Generales']

export function LedgerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { ledgers, updateLedger, addToast } = useAppStore()
  const ledger = ledgers.find(l => l.id === id)

  const [activeTab, setActiveTab] = useState<number>(
    (location.state as { tab?: number } | null)?.tab ?? 0
  )
  const [showEdit, setShowEdit]           = useState(false)
  const [showActivate, setShowActivate]   = useState(false)
  const [showDeactivate, setShowDeactivate] = useState(false)
  const [deactivateReason, setDeactivateReason] = useState('')
  const [loading, setLoading]             = useState(false)

  if (!ledger) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-[#6c759f] mb-4">Ledger no encontrado</p>
        <Button variant="secondary" onClick={() => navigate('/ledgers')}>
          <ArrowLeft size={16} /> Volver
        </Button>
      </div>
    )
  }

  const handleActivate = async () => {
    if (ledger.configs.length === 0) {
      addToast('error', 'El ledger debe tener al menos una configuración contable antes de activarse')
      setShowActivate(false)
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    updateLedger(ledger.id, { status: 'activo' })
    addToast('success', ledger.status === 'inactivo' ? 'Ledger reactivado correctamente' : 'Ledger activado correctamente')
    setLoading(false)
    setShowActivate(false)
  }

  const handleDeactivate = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    updateLedger(ledger.id, { status: 'inactivo' })
    addToast('success', 'Ledger desactivado')
    setLoading(false)
    setShowDeactivate(false)
    setDeactivateReason('')
  }

  const formatDate = (d: string) => new Date(d).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const isReactivate = ledger.status === 'inactivo'

  return (
    <div className="fade-in">
      <PageHeader
        title={ledger.name}
        breadcrumbs={[
          { label: 'Ledgers', to: '/ledgers' },
          { label: ledger.name },
        ]}
        actions={
          <div className="flex gap-3 items-center">
            <Badge status={ledger.status} />
            {(ledger.status === 'borrador' || ledger.status === 'inactivo') && (
              <Button onClick={() => setShowActivate(true)}>
                {isReactivate ? 'Reactivar' : 'Activar'}
              </Button>
            )}
            {ledger.status === 'activo' && (
              <Button variant="danger" onClick={() => { setShowDeactivate(true); setDeactivateReason('') }}>
                Desactivar
              </Button>
            )}
            <Button variant="secondary" onClick={() => setShowEdit(true)}>
              <Edit2 size={15} /> Editar
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-0 mb-6" style={{ borderBottom: '2px solid #F1F2F6' }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`h-12 px-6 text-sm font-semibold transition-all duration-150 border-b-[3px] -mb-[2px]
              ${activeTab === i
                ? 'border-[#FF2947]'
                : 'border-transparent hover:text-[#3E4983]'}`}
            style={{ color: activeTab === i ? '#121E6C' : '#606060' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-base font-bold text-[#121e6c] mb-4">Información del Ledger</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-semibold text-[#6c759f] uppercase tracking-wide">ID</dt>
                <dd className="text-sm font-mono text-[#121e6c] mt-0.5">{ledger.id}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#6c759f] uppercase tracking-wide">ID Interno</dt>
                <dd className="text-sm font-mono text-[#121e6c] mt-0.5">{ledger.internalId}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#6c759f] uppercase tracking-wide">Moneda</dt>
                <dd className="text-sm text-[#121e6c] mt-0.5">
                  {CURRENCIES.find(c => c.value === ledger.currency)?.label ?? ledger.currency}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#6c759f] uppercase tracking-wide">Nombre</dt>
                <dd className="text-sm text-[#121e6c] mt-0.5">{ledger.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#6c759f] uppercase tracking-wide">Descripción</dt>
                <dd className="text-sm text-[#121e6c] mt-0.5">{ledger.description || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#6c759f] uppercase tracking-wide">Frecuencia</dt>
                <dd className="text-sm text-[#121e6c] mt-0.5">
                  {FREQUENCIES.find(f => f.value === ledger.frequency)?.label ?? ledger.frequency}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#6c759f] uppercase tracking-wide">Estado</dt>
                <dd className="mt-0.5"><Badge status={ledger.status} /></dd>
              </div>
            </dl>
          </Card>
          <Card>
            <h3 className="text-base font-bold text-[#121e6c] mb-4">Auditoría</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-semibold text-[#6c759f] uppercase tracking-wide">Creado por</dt>
                <dd className="text-sm text-[#121e6c] mt-0.5">{ledger.createdBy}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#6c759f] uppercase tracking-wide">Fecha de creación</dt>
                <dd className="text-sm text-[#121e6c] mt-0.5">{formatDate(ledger.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#6c759f] uppercase tracking-wide">Última modificación</dt>
                <dd className="text-sm text-[#121e6c] mt-0.5">{formatDate(ledger.updatedAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#6c759f] uppercase tracking-wide">Configuraciones</dt>
                <dd className="text-sm text-[#121e6c] mt-0.5">{ledger.configs.length} tipo(s) de transacción</dd>
              </div>
            </dl>
            <div className="flex flex-col gap-2 mt-4">
              <button
                className="flex items-center gap-1.5 text-sm text-[#121e6c] font-semibold hover:text-[#ee424e] transition-colors"
                onClick={() => navigate('/audit')}
              >
                <ExternalLink size={14} /> Ver historial de cambios
              </button>
              <button
                className="flex items-center gap-1.5 text-sm text-[#121e6c] font-semibold hover:text-[#ee424e] transition-colors"
                onClick={() => navigate('/erp')}
              >
                <Upload size={14} /> Configurar Integraciones
              </button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 1 && <AccountingConfigTab ledger={ledger} />}
      {activeTab === 2 && <GeneralConfigTab ledger={ledger} />}

      {/* Modals */}
      <EditLedgerModal ledger={ledger} open={showEdit} onClose={() => setShowEdit(false)} />

      <ConfirmModal
        open={showActivate}
        onClose={() => setShowActivate(false)}
        onConfirm={handleActivate}
        title={isReactivate ? 'Reactivar Ledger' : 'Activar Ledger'}
        message={
          isReactivate
            ? `El ledger "${ledger.name}" volverá a procesar transacciones. ¿Continuar?`
            : `El ledger "${ledger.name}" comenzará a procesar transacciones reales. ¿Continuar?`
        }
        confirmLabel={isReactivate ? 'Reactivar' : 'Activar'}
        variant="primary"
        loading={loading}
      />

      <Modal
        open={showDeactivate}
        onClose={() => { setShowDeactivate(false); setDeactivateReason('') }}
        title="Desactivar Ledger"
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => { setShowDeactivate(false); setDeactivateReason('') }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeactivate} loading={loading}>
              Desactivar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: '#6c759f' }}>
            El ledger <strong>{ledger.name}</strong> dejará de aceptar nuevas transacciones.
            El historial se preserva.
          </p>
          <Textarea
            label="Motivo de desactivación"
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

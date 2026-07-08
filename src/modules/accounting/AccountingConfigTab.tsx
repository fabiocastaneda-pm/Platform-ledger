import { useState, useRef, useEffect } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, AlertTriangle, Search, Upload } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal, ConfirmModal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { ScheduleDateModal } from '../../components/ui/ScheduleDateModal'
import { BulkUploadModal } from '../ledgers/BulkUploadModal'
import { useAppStore } from '../../store'
import type { Ledger, AccountingEntryConfig, FieldMapping, AccountNature, ScheduledChange } from '../../types'

interface Props { ledger: Ledger }

// ─── Autocompletado de cuenta auxiliar ───────────────────────────────────────
interface AccountAutocompleteProps {
  value: string
  label: string
  onSelect: (code: string, name: string) => void
  placeholder?: string
}

function AccountAutocomplete({ value, label, onSelect, placeholder = 'Buscar cuenta auxiliar...' }: AccountAutocompleteProps) {
  const { accounts } = useAppStore()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const auxiliares = accounts.filter(a => a.level === 'auxiliar' && a.status === 'activa')

  const results = query.trim().length > 0
    ? auxiliares.filter(a =>
        a.code.includes(query) ||
        a.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : []

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const displayValue = value ? `${value} – ${label}` : ''

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#969696' }} />
        <input
          value={open ? query : displayValue}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { setQuery(''); setOpen(true) }}
          placeholder={placeholder}
          className="h-10 pl-8 pr-3 w-full border border-[#969696] text-xs text-[#121E6C] bg-white focus:outline-none focus:border-2 focus:border-[#FF2947]"
          style={{ borderRadius: '8px' }}
        />
      </div>

      {open && results.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full mt-1 py-1 z-50 fade-in"
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0px 4px 12px 0px rgba(18,30,108,0.10)',
            maxHeight: '220px',
            overflowY: 'auto',
          }}
        >
          {results.map(a => (
            <button
              key={a.code}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => { onSelect(a.code, a.name); setQuery(''); setOpen(false) }}
              className="flex items-baseline gap-2 w-full px-3 py-2 text-left transition-colors"
              style={{ fontSize: '12px' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F7F8FB')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span className="font-mono font-semibold shrink-0" style={{ color: '#3E4983' }}>{a.code}</span>
              <span style={{ color: '#121E6C' }}>{a.name}</span>
            </button>
          ))}
        </div>
      )}

      {open && query.length > 0 && results.length === 0 && (
        <div
          className="absolute left-0 right-0 top-full mt-1 px-3 py-3 z-50"
          style={{ background: '#FFFFFF', borderRadius: '12px', boxShadow: '0px 4px 12px 0px rgba(18,30,108,0.10)' }}
        >
          <p className="text-xs" style={{ color: '#969696' }}>Sin resultados para "{query}"</p>
        </div>
      )}
    </div>
  )
}

// ─── Indicador de partida doble ───────────────────────────────────────────────
function BalanceIndicator({ mappings }: { mappings: FieldMapping[] }) {
  const debits  = mappings.filter(m => m.nature === 'debito').length
  const credits = mappings.filter(m => m.nature === 'credito').length
  const balanced = debits > 0 && credits > 0 && debits === credits
  if (mappings.length === 0) return null
  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg"
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

// ─── Preview de asiento ───────────────────────────────────────────────────────
function AccountingPreview({ mappings }: { mappings: FieldMapping[] }) {
  if (mappings.length === 0) return null
  const EXAMPLE = 100000
  return (
    <div className="border border-[#F1F2F6] rounded-xl overflow-hidden">
      <p className="text-xs font-semibold px-4 py-2" style={{ background: '#F1F2F6', color: '#606060' }}>
        Preview de asiento (ejemplo: $100.000)
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: '#F1F2F6', borderBottom: '1px solid #F1F2F6' }}>
            <th className="text-left px-4 py-2 text-xs font-semibold" style={{ color: '#121E6C' }}>Cuenta</th>
            <th className="text-right px-4 py-2 text-xs font-semibold" style={{ color: '#121E6C' }}>Débito</th>
            <th className="text-right px-4 py-2 text-xs font-semibold" style={{ color: '#121E6C' }}>Crédito</th>
          </tr>
        </thead>
        <tbody>
          {mappings.map(m => (
            <tr key={m.id} style={{ borderBottom: '1px solid #F1F2F6' }}>
              <td className="px-4 py-2" style={{ color: '#121E6C' }}>{m.accountCode} {m.accountName}</td>
              <td className="px-4 py-2 text-right" style={{ color: '#121E6C' }}>
                {m.nature === 'debito' ? `$${EXAMPLE.toLocaleString('es-CO')}` : ''}
              </td>
              <td className="px-4 py-2 text-right" style={{ color: '#121E6C' }}>
                {m.nature === 'credito' ? `$${EXAMPLE.toLocaleString('es-CO')}` : ''}
              </td>
            </tr>
          ))}
          <tr style={{ background: '#F1F2F6' }}>
            <td className="px-4 py-2 text-xs font-bold" style={{ color: '#121E6C' }}>Total</td>
            <td className="px-4 py-2 text-right text-xs font-bold" style={{ color: '#121E6C' }}>
              ${(mappings.filter(m => m.nature === 'debito').length * EXAMPLE).toLocaleString('es-CO')}
            </td>
            <td className="px-4 py-2 text-right text-xs font-bold" style={{ color: '#121E6C' }}>
              ${(mappings.filter(m => m.nature === 'credito').length * EXAMPLE).toLocaleString('es-CO')}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── Tab principal ────────────────────────────────────────────────────────────
export function AccountingConfigTab({ ledger }: Props) {
  const { updateLedger, addToast, addScheduledChange, currentUser } = useAppStore()
  const [showModal, setShowModal]     = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [editingConfig, setEditingConfig] = useState<AccountingEntryConfig | null>(null)
  const [deleteTarget, setDeleteTarget]   = useState<string | null>(null)
  const [txType, setTxType]           = useState('')
  const [description, setDescription] = useState('')
  const [accountingNote, setAccountingNote] = useState('')
  const [mappings, setMappings]       = useState<FieldMapping[]>([])
  const [loading, setLoading]         = useState(false)
  const [errors, setErrors]           = useState<Record<string, string>>({})

  // Para interceptar cambios de cuenta en ledger activo
  const [pendingAccountChanges, setPendingAccountChanges] = useState<ScheduledChange[]>([])
  const [showScheduleDate, setShowScheduleDate] = useState(false)

  const blankMapping = (): FieldMapping => ({
    id: crypto.randomUUID(), fieldName: '', accountCode: '', accountName: '', nature: 'debito',
  })

  const openCreate = () => {
    setEditingConfig(null)
    setTxType(''); setDescription(''); setAccountingNote('')
    setMappings([blankMapping()])
    setErrors({})
    setShowModal(true)
  }

  const openEdit = (cfg: AccountingEntryConfig) => {
    setEditingConfig(cfg)
    setTxType(cfg.transactionType)
    setDescription(cfg.description || '')
    setAccountingNote(cfg.accountingNote || '')
    setMappings(cfg.fieldMappings.map(m => ({ ...m })))
    setErrors({})
    setShowModal(true)
  }

  const addMapping    = () => setMappings(p => [...p, blankMapping()])
  const removeMapping = (id: string) => setMappings(p => p.filter(m => m.id !== id))

  const updateMapping = (id: string, key: keyof FieldMapping, value: string) =>
    setMappings(p => p.map(m => m.id !== id ? m : { ...m, [key]: value }))

  const selectAccount = (id: string, code: string, name: string) =>
    setMappings(p => p.map(m => m.id !== id ? m : { ...m, accountCode: code, accountName: name }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!txType.trim()) e.txType = 'El tipo de transacción es obligatorio'
    else if (ledger.configs.some(c => c.transactionType === txType && c.id !== editingConfig?.id))
      e.txType = 'Este tipo ya existe en el ledger'
    if (mappings.some(m => !m.fieldName || !m.accountCode))
      e.mappings = 'Todos los campos deben tener nombre y cuenta'
    return e
  }

  const detectAccountChanges = (): ScheduledChange[] => {
    if (!editingConfig) return []
    const changes: ScheduledChange[] = []
    for (const newM of mappings) {
      const oldM = editingConfig.fieldMappings.find(m => m.id === newM.id)
      if (oldM && oldM.accountCode !== newM.accountCode && newM.accountCode) {
        changes.push({
          id: crypto.randomUUID(),
          ledgerId: ledger.id,
          ledgerName: ledger.name,
          configId: editingConfig.id,
          transactionType: editingConfig.transactionType,
          fieldMappingId: newM.id,
          fieldName: newM.fieldName,
          oldAccountCode: oldM.accountCode,
          oldAccountName: oldM.accountName,
          newAccountCode: newM.accountCode,
          newAccountName: newM.accountName,
          nature: newM.nature,
          scheduledDate: '',
          createdAt: new Date().toISOString(),
          createdBy: currentUser,
          status: 'pendiente',
        })
      }
    }
    return changes
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    // Si el ledger está activo y es edición, detectar cambios de cuenta
    if (ledger.status === 'activo' && editingConfig) {
      const accountChanges = detectAccountChanges()
      if (accountChanges.length > 0) {
        setPendingAccountChanges(accountChanges)
        setShowScheduleDate(true)
        return
      }
    }

    await saveConfig(mappings)
  }

  const saveConfig = async (mappingsToSave: FieldMapping[], successMsg?: string) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const newConfig: AccountingEntryConfig = {
      id: editingConfig?.id || crypto.randomUUID(),
      ledgerId: ledger.id,
      transactionType: txType.trim(),
      description: description.trim() || undefined,
      accountingNote: accountingNote.trim() || undefined,
      fieldMappings: mappingsToSave,
      createdAt: editingConfig?.createdAt || new Date().toISOString(),
      version: (editingConfig?.version || 0) + 1,
    }
    const updatedConfigs = editingConfig
      ? ledger.configs.map(c => c.id === editingConfig.id ? newConfig : c)
      : [...ledger.configs, newConfig]
    updateLedger(ledger.id, { configs: updatedConfigs })
    addToast('success', successMsg ?? (editingConfig ? 'Configuración actualizada' : 'Configuración creada exitosamente'))
    setLoading(false)
    setShowModal(false)
    setPendingAccountChanges([])
  }

  const handleScheduleConfirm = async (date: string) => {
    // Capturar antes de cualquier reset de estado
    const changes = pendingAccountChanges
    for (const change of changes) {
      addScheduledChange({ ...change, scheduledDate: date })
    }
    // Guardar config con cuentas ORIGINALES (los cambios son programados, no inmediatos)
    const mappingsWithOriginalAccounts = mappings.map(m => {
      const pending = changes.find(c => c.fieldMappingId === m.id)
      if (pending) return { ...m, accountCode: pending.oldAccountCode, accountName: pending.oldAccountName }
      return m
    })
    await saveConfig(
      mappingsWithOriginalAccounts,
      `Configuración guardada · ${changes.length} cambio(s) de cuenta programado(s) para el ${date}`,
    )
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    updateLedger(ledger.id, { configs: ledger.configs.filter(c => c.id !== deleteTarget) })
    addToast('success', 'Configuración eliminada')
    setLoading(false)
    setDeleteTarget(null)
  }

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
          <Button onClick={openCreate} size="sm">
            <Plus size={16} /> Agregar tipo de transacción
          </Button>
        </div>
      </div>

      {ledger.configs.length === 0 ? (
        <Card>
          <EmptyState
            title="Sin configuración contable"
            description="Agrega al menos un tipo de transacción para poder activar este ledger."
            action={{ label: 'Agregar tipo de transacción', onClick: openCreate }}
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
              <div className="flex gap-2">
                <button onClick={() => openEdit(cfg)} className="p-2 rounded-lg transition-colors" style={{ color: '#606060' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F1F2F6'; (e.currentTarget as HTMLElement).style.color = '#121E6C' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#606060' }}
                  title="Editar"><Edit2 size={16} /></button>
                <button onClick={() => setDeleteTarget(cfg.id)} className="p-2 rounded-lg transition-colors" style={{ color: '#606060' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FBF3F5'; (e.currentTarget as HTMLElement).style.color = '#910022' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#606060' }}
                  title="Eliminar"><Trash2 size={16} /></button>
              </div>
            </div>

            <table className="w-full text-sm mb-3">
              <thead>
                <tr style={{ borderBottom: '1px solid #F1F2F6' }}>
                  <th className="text-left py-2 text-xs font-semibold" style={{ color: '#606060' }}>Campo Monetario</th>
                  <th className="text-left py-2 text-xs font-semibold" style={{ color: '#606060' }}>Cuenta Auxiliar</th>
                  <th className="text-left py-2 text-xs font-semibold" style={{ color: '#606060' }}>Naturaleza</th>
                </tr>
              </thead>
              <tbody>
                {cfg.fieldMappings.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #F1F2F6' }}>
                    <td className="py-2 font-mono text-xs" style={{ color: '#121E6C' }}>{m.fieldName}</td>
                    <td className="py-2 text-sm" style={{ color: '#121E6C' }}>{m.accountCode} – {m.accountName}</td>
                    <td className="py-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={m.nature === 'debito'
                          ? { background: '#F1F9FF', color: '#0A53A5' }
                          : { background: '#FBF3F5', color: '#910022' }}>
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

      {/* Modal crear / editar */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setPendingAccountChanges([]) }}
        title={editingConfig ? 'Editar Configuración' : 'Nueva Configuración Contable'}
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowModal(false); setPendingAccountChanges([]) }} disabled={loading}>Cancelar</Button>
            <Button onClick={handleSave} loading={loading}>Guardar Configuración</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Tipo de Transacción *"
            value={txType}
            onChange={e => { setTxType(e.target.value); setErrors(p => ({ ...p, txType: '' })) }}
            placeholder="cashout_high_amount"
            error={errors.txType}
            helper="Debe coincidir exactamente con el transaction_type del payload API"
          />
          <Input
            label="Descripción"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe este tipo de transacción..."
          />
          <Input
            label="Nota Contable"
            value={accountingNote}
            onChange={e => setAccountingNote(e.target.value)}
            placeholder="Nota contable para este tipo de transacción"
          />

          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-semibold" style={{ color: '#121E6C' }}>Mapeo de Campos Monetarios</p>
              <button onClick={addMapping}
                className="text-sm font-semibold flex items-center gap-1 transition-colors"
                style={{ color: '#121E6C' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FF2947')}
                onMouseLeave={e => (e.currentTarget.style.color = '#121E6C')}
              >
                <Plus size={14} /> Agregar campo
              </button>
            </div>

            {errors.mappings && (
              <p className="text-xs font-semibold mb-2" style={{ color: '#910022' }}>{errors.mappings}</p>
            )}

            <div className="space-y-2">
              {mappings.map((m, i) => (
                <div key={m.id} className="grid gap-2 items-start" style={{ gridTemplateColumns: '1fr 2fr auto auto' }}>
                  <div>
                    {i === 0 && <p className="text-xs font-semibold mb-1" style={{ color: '#606060' }}>Campo</p>}
                    <input
                      value={m.fieldName}
                      onChange={e => updateMapping(m.id, 'fieldName', e.target.value)}
                      placeholder="amount_principal"
                      className="h-10 px-3 w-full border border-[#969696] text-xs font-mono text-[#121E6C] bg-white focus:outline-none focus:border-2 focus:border-[#FF2947]"
                      style={{ borderRadius: '8px' }}
                    />
                  </div>

                  <div>
                    {i === 0 && <p className="text-xs font-semibold mb-1" style={{ color: '#606060' }}>Cuenta Auxiliar</p>}
                    <AccountAutocomplete
                      value={m.accountCode}
                      label={m.accountName}
                      onSelect={(code, name) => selectAccount(m.id, code, name)}
                    />
                  </div>

                  <div>
                    {i === 0 && <p className="text-xs font-semibold mb-1" style={{ color: '#606060' }}>Naturaleza</p>}
                    <select
                      value={m.nature}
                      onChange={e => updateMapping(m.id, 'nature', e.target.value as AccountNature)}
                      className="h-10 px-3 border border-[#969696] text-sm text-[#121E6C] bg-white focus:outline-none focus:border-2 focus:border-[#FF2947] cursor-pointer"
                      style={{ borderRadius: '8px' }}
                    >
                      <option value="debito">Débito</option>
                      <option value="credito">Crédito</option>
                    </select>
                  </div>

                  <div>
                    {i === 0 && <p className="text-xs opacity-0 mb-1">x</p>}
                    <button
                      onClick={() => removeMapping(m.id)}
                      disabled={mappings.length === 1}
                      className="h-10 w-10 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30"
                      style={{ color: '#969696' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FBF3F5'; (e.currentTarget as HTMLElement).style.color = '#910022' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#969696' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <BalanceIndicator mappings={mappings} />
          <AccountingPreview mappings={mappings} />
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar Configuración"
        message="¿Estás seguro de que deseas eliminar este tipo de transacción? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loading={loading}
      />

      <ScheduleDateModal
        open={showScheduleDate}
        onClose={() => { setShowScheduleDate(false); setPendingAccountChanges([]) }}
        onConfirm={handleScheduleConfirm}
        title="Programar cambio de cuenta"
        description={`Este ledger está activo. Detectamos ${pendingAccountChanges.length} cambio(s) de cuenta. No es posible aplicarlos hoy — selecciona la fecha de vigencia.`}
      />

      <BulkUploadModal
        open={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        ledger={ledger}
      />
    </div>
  )
}

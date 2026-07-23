import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Trash2, Search, ArrowDown,
  CalendarClock, CheckCircle, AlertTriangle,
} from 'lucide-react'
import { useAppStore } from '../../store'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Drawer } from '../../components/ui/Drawer'
import type { FieldMapping, AccountNature, ScheduledChange, AccountingEntryConfig } from '../../types'

// ─── Date helpers ──────────────────────────────────────────────────────────────
function getTomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}
function getMaxDate() {
  const d = new Date()
  d.setMonth(d.getMonth() + 2)
  return d.toISOString().split('T')[0]
}

// ─── Blank mapping factory ─────────────────────────────────────────────────────
function blankMapping(): FieldMapping {
  return {
    id: crypto.randomUUID(),
    fieldName: '',
    accountCode: '',
    accountName: '',
    nature: 'debito',
    description: '',
    ceco: '',
    accountingNote: '',
  }
}

// ─── Account Autocomplete ──────────────────────────────────────────────────────
interface AccountAutocompleteProps {
  value: string
  label: string
  onSelect: (code: string, name: string) => void
}

function AccountAutocomplete({ value, label, onSelect }: AccountAutocompleteProps) {
  const { accounts } = useAppStore()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const auxiliares = accounts.filter(a => a.level === 'auxiliar' && a.status === 'activa')
  const results = auxiliares.filter(a =>
    query.trim().length === 0 ||
    a.code.includes(query) ||
    a.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 12)

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
          placeholder="Buscar cuenta auxiliar..."
          className="h-9 pl-8 pr-3 w-full border border-[#969696] text-xs text-[#121E6C] bg-white focus:outline-none focus:border-2 focus:border-[#FF2947]"
          style={{ borderRadius: '8px' }}
        />
      </div>
      {open && results.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full mt-1 py-1 z-50 fade-in"
          style={{
            background: '#FFFFFF', borderRadius: '12px',
            boxShadow: '0px 4px 12px 0px rgba(18,30,108,0.10)',
            maxHeight: '200px', overflowY: 'auto',
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

// ─── Balance indicator ─────────────────────────────────────────────────────────
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

// ─── Drawer change type ────────────────────────────────────────────────────────
interface DrawerChange {
  mappingId: string
  fieldLabel: string
  oldAccountCode: string
  oldAccountName: string
  newAccountCode: string
  newAccountName: string
}

// ─── Main component ────────────────────────────────────────────────────────────
export function ConfigEditor() {
  const { id, configId } = useParams<{ id: string; configId: string }>()
  const navigate = useNavigate()
  const { ledgers, updateLedger, addScheduledChange, addToast, currentUser } = useAppStore()

  const ledger = ledgers.find(l => l.id === id)
  const isNew  = configId === 'new'
  const config = isNew ? null : ledger?.configs.find(c => c.id === configId)

  const [txType, setTxType]         = useState(config?.transactionType || '')
  const [configDesc, setConfigDesc] = useState(config?.description || '')
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [loading, setLoading]       = useState(false)

  const [mappings, setMappings]           = useState<FieldMapping[]>(
    config ? config.fieldMappings.map(m => ({ ...m })) : [blankMapping()]
  )
  const [originalMappings]                = useState<FieldMapping[]>(
    config ? config.fieldMappings.map(m => ({ ...m })) : []
  )

  // Scheduling modal state
  const [scheduleModal, setScheduleModal] = useState<DrawerChange | null>(null)
  const [scheduleDate, setScheduleDate]   = useState('')
  const [pendingChanges, setPendingChanges] = useState<ScheduledChange[]>([])

  if (!ledger) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p style={{ color: '#6c759f' }}>Ledger no encontrado</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/ledgers')}>
          <ArrowLeft size={16} /> Volver
        </Button>
      </div>
    )
  }

  const goBack = () => navigate(`/ledgers/${ledger.id}`, { state: { tab: 1 } })

  // ─── Account change interception ─────────────────────────────────────────────
  const handleAccountSelect = (mappingId: string, newCode: string, newName: string) => {
    const originalM = originalMappings.find(m => m.id === mappingId)
    const currentM  = mappings.find(m => m.id === mappingId)

    if (ledger.status === 'activo' && originalM?.accountCode && originalM.accountCode !== newCode) {
      setScheduleModal({
        mappingId,
        fieldLabel: currentM?.fieldName || 'Campo',
        oldAccountCode: originalM.accountCode,
        oldAccountName: originalM.accountName,
        newAccountCode: newCode,
        newAccountName: newName,
      })
      setScheduleDate('')
    }

    setMappings(prev =>
      prev.map(m => m.id === mappingId ? { ...m, accountCode: newCode, accountName: newName } : m)
    )
  }

  const handleScheduleConfirm = () => {
    if (!scheduleModal || !scheduleDate) return

    const currentM = mappings.find(m => m.id === scheduleModal.mappingId)
    const change: ScheduledChange = {
      id: crypto.randomUUID(),
      ledgerId: ledger.id,
      ledgerName: ledger.name,
      configId: config?.id || 'pending',
      transactionType: txType,
      fieldMappingId: scheduleModal.mappingId,
      fieldName: scheduleModal.fieldLabel,
      oldAccountCode: scheduleModal.oldAccountCode,
      oldAccountName: scheduleModal.oldAccountName,
      newAccountCode: scheduleModal.newAccountCode,
      newAccountName: scheduleModal.newAccountName,
      nature: currentM?.nature || 'debito',
      scheduledDate: scheduleDate,
      createdAt: new Date().toISOString(),
      createdBy: currentUser,
      status: 'pendiente',
    }

    setPendingChanges(prev => [
      ...prev.filter(c => c.fieldMappingId !== scheduleModal.mappingId),
      change,
    ])

    // Revert cell to original value — the change applies on scheduledDate
    const originalM = originalMappings.find(m => m.id === scheduleModal.mappingId)
    if (originalM) {
      setMappings(prev =>
        prev.map(m =>
          m.id === scheduleModal.mappingId
            ? { ...m, accountCode: originalM.accountCode, accountName: originalM.accountName }
            : m
        )
      )
    }

    setScheduleModal(null)
    setScheduleDate('')
  }

  const handleScheduleCancel = () => {
    const originalM = originalMappings.find(m => m.id === scheduleModal?.mappingId)
    if (originalM) {
      setMappings(prev =>
        prev.map(m =>
          m.id === scheduleModal?.mappingId
            ? { ...m, accountCode: originalM.accountCode, accountName: originalM.accountName }
            : m
        )
      )
    }
    setScheduleModal(null)
    setScheduleDate('')
  }

  // ─── Save ─────────────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {}
    if (!txType.trim()) e.txType = 'El tipo de transacción es obligatorio'
    else if (ledger.configs.some(c => c.transactionType === txType && c.id !== config?.id))
      e.txType = 'Este tipo ya existe en el ledger'
    if (mappings.some(m => !m.fieldName || !m.accountCode))
      e.mappings = 'Todos los campos deben tener nombre de campo y cuenta auxiliar'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 600))

    for (const change of pendingChanges) addScheduledChange(change)

    const newConfig: AccountingEntryConfig = {
      id: config?.id || crypto.randomUUID(),
      ledgerId: ledger.id,
      transactionType: txType.trim(),
      description: configDesc.trim() || undefined,
      fieldMappings: mappings,
      createdAt: config?.createdAt || new Date().toISOString(),
      version: (config?.version || 0) + 1,
    }

    const updatedConfigs = config
      ? ledger.configs.map(c => c.id === config.id ? newConfig : c)
      : [...ledger.configs, newConfig]

    updateLedger(ledger.id, { configs: updatedConfigs })

    const msg = pendingChanges.length > 0
      ? `Configuración guardada · ${pendingChanges.length} cambio(s) programado(s)`
      : config ? 'Configuración actualizada' : 'Configuración creada exitosamente'

    addToast('success', msg)
    setLoading(false)
    goBack()
  }

  const updateMapping = (id: string, key: keyof FieldMapping, value: string) =>
    setMappings(prev => prev.map(m => m.id !== id ? m : { ...m, [key]: value }))

  const removeMapping = (id: string) =>
    setMappings(prev => prev.filter(m => m.id !== id))

  const cellInput = (value: string, onChange: (v: string) => void, placeholder: string, mono = false) => (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`h-9 px-3 w-full border border-[#969696] text-xs text-[#121E6C] bg-white focus:outline-none focus:border-2 focus:border-[#FF2947] ${mono ? 'font-mono' : ''}`}
      style={{ borderRadius: '8px' }}
    />
  )

  return (
    <div className="fade-in">
      {/* ─── Header ─── */}
      <div className="mb-6">
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 text-sm font-semibold mb-2 transition-colors"
          style={{ color: '#606060' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#121E6C')}
          onMouseLeave={e => (e.currentTarget.style.color = '#606060')}
        >
          <ArrowLeft size={15} />
          {ledger.name}
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 400, color: '#121E6C', margin: 0, lineHeight: '32px' }}>
              {isNew ? 'Nueva Configuración' : (txType || 'Editar Configuración')}
            </h1>
            <p className="text-sm mt-1" style={{ color: '#606060' }}>
              {ledger.name} · Configuración Tipo Transacción
            </p>
          </div>
          <Badge status={ledger.status} />
        </div>
      </div>

      {/* ─── Metadata ─── */}
      <Card className="mb-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tipo de Transacción *"
            value={txType}
            onChange={e => { setTxType(e.target.value); setErrors(p => ({ ...p, txType: '' })) }}
            placeholder="cashout_high_amount"
            error={errors.txType}
            helper="Debe coincidir con el transaction_type del payload API"
          />
          <Input
            label="Descripción"
            value={configDesc}
            onChange={e => setConfigDesc(e.target.value)}
            placeholder="Describe este tipo de transacción..."
          />
        </div>
      </Card>

      {/* ─── Mappings table ─── */}
      <Card padding={false} className="mb-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F1F2F6', borderBottom: '2px solid #F1F2F6' }}>
                {['Cuenta auxiliar', 'Descripción', 'CECO / CEBE', 'Naturaleza', 'Campo asociado', 'Nota contable', ''].map(h => (
                  <th
                    key={h}
                    className="text-left px-3 py-3 text-xs font-semibold whitespace-nowrap"
                    style={{ color: '#121E6C' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mappings.map(m => {
                const pending = pendingChanges.find(c => c.fieldMappingId === m.id)
                return (
                  <tr
                    key={m.id}
                    className="border-b border-[#F1F2F6] transition-colors"
                    style={{ background: pending ? '#FFFBF0' : undefined }}
                  >
                    {/* Cuenta auxiliar */}
                    <td className="px-3 py-2" style={{ minWidth: 200 }}>
                      <AccountAutocomplete
                        value={m.accountCode}
                        label={m.accountName}
                        onSelect={(code, name) => handleAccountSelect(m.id, code, name)}
                      />
                      {pending && (
                        <div className="flex items-center gap-1 mt-1">
                          <CalendarClock size={10} color="#5B3100" />
                          <span className="text-[10px] font-semibold" style={{ color: '#5B3100' }}>
                            → {pending.newAccountCode} desde {pending.scheduledDate}
                          </span>
                        </div>
                      )}
                    </td>
                    {/* Descripción */}
                    <td className="px-3 py-2" style={{ minWidth: 150 }}>
                      {cellInput(m.description || '', v => updateMapping(m.id, 'description', v), 'Ventas de terceros')}
                    </td>
                    {/* CECO */}
                    <td className="px-3 py-2" style={{ minWidth: 110 }}>
                      {cellInput(m.ceco || '', v => updateMapping(m.id, 'ceco', v), 'B1C21000', true)}
                    </td>
                    {/* Naturaleza */}
                    <td className="px-3 py-2" style={{ minWidth: 110 }}>
                      <select
                        value={m.nature}
                        onChange={e => updateMapping(m.id, 'nature', e.target.value as AccountNature)}
                        className="h-9 px-3 w-full border border-[#969696] text-xs text-[#121E6C] bg-white focus:outline-none focus:border-2 focus:border-[#FF2947] cursor-pointer"
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="debito">Débito</option>
                        <option value="credito">Crédito</option>
                      </select>
                    </td>
                    {/* Campo asociado */}
                    <td className="px-3 py-2" style={{ minWidth: 150 }}>
                      {cellInput(m.fieldName, v => updateMapping(m.id, 'fieldName', v), 'amount_principal', true)}
                    </td>
                    {/* Nota contable */}
                    <td className="px-3 py-2" style={{ minWidth: 150 }}>
                      {cellInput(m.accountingNote || '', v => updateMapping(m.id, 'accountingNote', v), 'Nota contable...')}
                    </td>
                    {/* Delete */}
                    <td className="px-3 py-2">
                      <button
                        onClick={() => removeMapping(m.id)}
                        disabled={mappings.length === 1}
                        className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                        style={{ color: '#969696' }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = '#FBF3F5'
                          ;(e.currentTarget as HTMLElement).style.color = '#910022'
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = 'transparent'
                          ;(e.currentTarget as HTMLElement).style.color = '#969696'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Add row */}
        <div className="px-4 py-3 border-t border-[#F1F2F6]">
          <button
            onClick={() => setMappings(prev => [...prev, blankMapping()])}
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
            style={{ color: '#121E6C' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FF2947')}
            onMouseLeave={e => (e.currentTarget.style.color = '#121E6C')}
          >
            <Plus size={15} /> Agregar fila
          </button>
        </div>

        {errors.mappings && (
          <div className="px-4 pb-3">
            <p className="text-xs font-semibold" style={{ color: '#910022' }}>{errors.mappings}</p>
          </div>
        )}
      </Card>

      <BalanceIndicator mappings={mappings} />

      {/* ─── Save bar ─── */}
      <div
        className="flex justify-between items-center mt-6 pt-5"
        style={{ borderTop: '2px solid #F1F2F6' }}
      >
        <div>
          {pendingChanges.length > 0 && (
            <div className="flex items-center gap-2">
              <CalendarClock size={15} color="#5B3100" />
              <span className="text-sm font-semibold" style={{ color: '#5B3100' }}>
                {pendingChanges.length} cambio(s) de cuenta programado(s)
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={goBack} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSave} loading={loading}>Guardar Configuración</Button>
        </div>
      </div>

      {/* ─── Scheduling Drawer ─── */}
      <Drawer
        open={!!scheduleModal}
        onClose={handleScheduleCancel}
        title="Programar cambio de cuenta"
        footer={
          <>
            <Button variant="secondary" onClick={handleScheduleCancel}>Cancelar</Button>
            <Button onClick={handleScheduleConfirm} disabled={!scheduleDate}>Programar</Button>
          </>
        }
      >
        {scheduleModal && (
          <div className="space-y-5">
            {/* Header info */}
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: '#FFF3D1' }}
            >
              <CalendarClock size={18} color="#5B3100" />
              <div>
                <p className="text-sm font-bold" style={{ color: '#121E6C' }}>Ledger activo</p>
                <p className="text-xs" style={{ color: '#606060' }}>El cambio se aplicará en la fecha seleccionada</p>
              </div>
            </div>

            {/* Campo */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#969696' }}>Campo monetario</p>
              <p className="text-sm font-mono font-semibold" style={{ color: '#3E4983' }}>{scheduleModal.fieldLabel}</p>
            </div>

            {/* Change summary */}
            <div className="rounded-xl p-4 space-y-3" style={{ background: '#F7F8FB' }}>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#969696' }}>Cuenta actual</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold" style={{ color: '#910022' }}>{scheduleModal.oldAccountCode}</span>
                  <span className="text-xs" style={{ color: '#606060' }}>{scheduleModal.oldAccountName}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-px flex-1" style={{ background: '#E0E2F0' }} />
                <ArrowDown size={13} color="#969696" />
                <div className="h-px flex-1" style={{ background: '#E0E2F0' }} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#969696' }}>Cuenta nueva</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold" style={{ color: '#1B8959' }}>{scheduleModal.newAccountCode}</span>
                  <span className="text-xs" style={{ color: '#606060' }}>{scheduleModal.newAccountName}</span>
                </div>
              </div>
            </div>

            {/* Date picker */}
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#606060' }}>
                Fecha de vigencia
                <span className="font-normal ml-1" style={{ color: '#969696' }}>(mín: mañana · máx: +2 meses)</span>
              </p>
              <input
                type="date"
                min={getTomorrow()}
                max={getMaxDate()}
                value={scheduleDate}
                onChange={e => setScheduleDate(e.target.value)}
                className="w-full h-11 px-3 border border-[#969696] text-sm text-[#121E6C] bg-white focus:outline-none focus:border-2 focus:border-[#FF2947]"
                style={{ borderRadius: '12px' }}
              />
            </div>

            {/* Already pending */}
            {pendingChanges.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: '#606060' }}>Ya programados ({pendingChanges.length})</p>
                <div className="space-y-1.5">
                  {pendingChanges.map(pc => (
                    <div key={pc.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F4FDF9' }}>
                      <CheckCircle size={11} color="#1B8959" />
                      <span className="text-xs font-mono" style={{ color: '#1B8959' }}>{pc.oldAccountCode} → {pc.newAccountCode}</span>
                      <span className="text-[10px] ml-auto shrink-0" style={{ color: '#606060' }}>{pc.scheduledDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}

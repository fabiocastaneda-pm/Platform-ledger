import { useState, useRef } from 'react'
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../store'
import type { Ledger, AccountingEntryConfig, FieldMapping, AccountNature } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  ledger: Ledger
}

interface ParsedRow {
  transactionType: string
  description: string
  accountingNote: string
  fieldName: string
  accountCode: string
  nature: string
  error?: string
}

const TEMPLATE_ROWS = [
  'transactionType,description,accountingNote,fieldName,accountCode,nature',
  'cashout_refund,Reembolsos de efectivo,Nota contable de reembolsos,amount_principal,1105,debito',
  'cashout_refund,Reembolsos de efectivo,Nota contable de reembolsos,amount_fee,4135,credito',
]

function downloadTemplate() {
  const csv = TEMPLATE_ROWS.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plantilla_configuracion_contable.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return []
  const dataLines = lines[0].trim().toLowerCase().startsWith('transactiontype') ? lines.slice(1) : lines
  return dataLines.map(line => {
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    const [transactionType = '', description = '', accountingNote = '', fieldName = '', accountCode = '', nature = ''] = cols
    return { transactionType, description, accountingNote, fieldName, accountCode, nature }
  })
}

export function BulkUploadModal({ open, onClose, ledger }: Props) {
  const { accounts, updateLedger, addToast } = useAppStore()
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const auxiliares = accounts.filter(a => a.level === 'auxiliar' && a.status === 'activa')

  const validateRows = (parsed: ParsedRow[]): ParsedRow[] =>
    parsed.map(row => {
      const errors: string[] = []
      if (!row.transactionType) errors.push('Tipo de transacción vacío')
      if (!row.fieldName) errors.push('Campo monetario vacío')
      if (!row.accountCode) errors.push('Código de cuenta vacío')
      const account = auxiliares.find(a => a.code === row.accountCode)
      if (row.accountCode && !account) errors.push(`Cuenta ${row.accountCode} no encontrada`)
      if (!['debito', 'credito'].includes(row.nature)) errors.push('Naturaleza debe ser "debito" o "credito"')
      return { ...row, error: errors.join(' · ') || undefined }
    })

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      const parsed = parseCSV(text)
      setRows(validateRows(parsed))
    }
    reader.readAsText(file)
  }

  const hasErrors = rows.some(r => r.error)
  const validCount = rows.filter(r => !r.error).length

  const handleConfirm = async () => {
    if (hasErrors || rows.length === 0) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))

    // Agrupar filas por transactionType
    const grouped = new Map<string, ParsedRow[]>()
    for (const row of rows) {
      if (!grouped.has(row.transactionType)) grouped.set(row.transactionType, [])
      grouped.get(row.transactionType)!.push(row)
    }

    const newConfigs: AccountingEntryConfig[] = []
    grouped.forEach((groupRows, txType) => {
      const first = groupRows[0]
      const existingIdx = ledger.configs.findIndex(c => c.transactionType === txType)
      const existing = existingIdx >= 0 ? ledger.configs[existingIdx] : null
      const fieldMappings: FieldMapping[] = groupRows.map(row => {
        const account = auxiliares.find(a => a.code === row.accountCode)
        return {
          id: crypto.randomUUID(),
          fieldName: row.fieldName,
          accountCode: row.accountCode,
          accountName: account?.name || row.accountCode,
          nature: row.nature as AccountNature,
        }
      })
      newConfigs.push({
        id: existing?.id || crypto.randomUUID(),
        ledgerId: ledger.id,
        transactionType: txType,
        description: first.description || undefined,
        accountingNote: first.accountingNote || undefined,
        fieldMappings,
        createdAt: existing?.createdAt || new Date().toISOString(),
        version: (existing?.version || 0) + 1,
      })
    })

    // Mezclar con configs existentes (reemplaza si mismo txType, agrega si nuevo)
    const existingKept = ledger.configs.filter(c => !newConfigs.some(n => n.transactionType === c.transactionType))
    updateLedger(ledger.id, { configs: [...existingKept, ...newConfigs] })
    addToast('success', `${newConfigs.length} configuración(es) importadas correctamente`)
    setLoading(false)
    handleClose()
  }

  const handleClose = () => {
    setRows([])
    setFileName('')
    if (fileRef.current) fileRef.current.value = ''
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Carga masiva de configuraciones"
      maxWidth="max-w-3xl"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>Cancelar</Button>
          <Button
            onClick={handleConfirm}
            loading={loading}
            disabled={rows.length === 0 || hasErrors}
          >
            Importar {validCount > 0 ? `(${validCount} fila${validCount !== 1 ? 's' : ''})` : ''}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Paso 1: Plantilla */}
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#F7F8FB', border: '1px solid #F1F2F6' }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#121E6C' }}>1. Descarga la plantilla CSV</p>
            <p className="text-xs mt-0.5" style={{ color: '#606060' }}>
              Columnas requeridas: transactionType, description, accountingNote, fieldName, accountCode, nature
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={downloadTemplate}>
            <Download size={15} /> Descargar
          </Button>
        </div>

        {/* Paso 2: Cargar archivo */}
        <div>
          <p className="text-sm font-semibold mb-2" style={{ color: '#121E6C' }}>2. Carga tu archivo CSV</p>
          <label
            className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl cursor-pointer transition-colors"
            style={{ border: '2px dashed #969696', background: '#FAFAFA' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#FF2947')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#969696')}
          >
            <Upload size={24} style={{ color: '#969696' }} />
            <span className="text-sm font-semibold" style={{ color: '#606060' }}>
              {fileName || 'Haz clic o arrastra tu archivo CSV'}
            </span>
            <span className="text-xs" style={{ color: '#969696' }}>Solo archivos .csv</span>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
          </label>
        </div>

        {/* Paso 3: Preview */}
        {rows.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold" style={{ color: '#121E6C' }}>
                3. Preview — {rows.length} fila{rows.length !== 1 ? 's' : ''}
              </p>
              {hasErrors
                ? <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#910022' }}>
                    <AlertCircle size={13} /> Hay errores — corrígelos antes de importar
                  </span>
                : <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#1B8959' }}>
                    <CheckCircle size={13} /> Todo listo para importar
                  </span>
              }
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#F1F2F6]">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: '#F1F2F6' }}>
                    {['Tipo Tx', 'Campo', 'Cuenta', 'Naturaleza', 'Nota', 'Estado'].map(h => (
                      <th key={h} className="text-left px-3 py-2 font-semibold" style={{ color: '#121E6C' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F1F2F6', background: row.error ? '#FFF5F5' : undefined }}>
                      <td className="px-3 py-2 font-mono" style={{ color: '#121E6C' }}>{row.transactionType || '—'}</td>
                      <td className="px-3 py-2 font-mono" style={{ color: '#121E6C' }}>{row.fieldName || '—'}</td>
                      <td className="px-3 py-2" style={{ color: '#121E6C' }}>{row.accountCode || '—'}</td>
                      <td className="px-3 py-2" style={{ color: '#121E6C' }}>{row.nature || '—'}</td>
                      <td className="px-3 py-2 max-w-[120px] truncate" style={{ color: '#606060' }}>{row.accountingNote || '—'}</td>
                      <td className="px-3 py-2">
                        {row.error
                          ? <span className="text-xs" style={{ color: '#910022' }}>{row.error}</span>
                          : <CheckCircle size={13} color="#1B8959" />
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Database } from 'lucide-react'
import type { Ledger } from '../../types'

interface FlatRow {
  accountCode: string
  accountName: string
  accountingNote: string
  transactionType: string
  fieldName: string
  nature: 'debito' | 'credito'
  configId: string
  mappingId: string
}

function groupByAccount(rows: FlatRow[]): Map<string, { accountName: string; accountingNote: string; rows: FlatRow[] }> {
  const map = new Map<string, { accountName: string; accountingNote: string; rows: FlatRow[] }>()
  for (const row of rows) {
    const key = row.accountCode
    if (!map.has(key)) {
      map.set(key, { accountName: row.accountName, accountingNote: row.accountingNote, rows: [] })
    }
    map.get(key)!.rows.push(row)
  }
  return map
}

export function GeneralConfigTab({ ledger }: { ledger: Ledger }) {
  const flat: FlatRow[] = ledger.configs.flatMap(cfg =>
    cfg.fieldMappings.map(fm => ({
      accountCode: fm.accountCode,
      accountName: fm.accountName,
      accountingNote: cfg.accountingNote || '',
      transactionType: cfg.transactionType,
      fieldName: fm.fieldName,
      nature: fm.nature,
      configId: cfg.id,
      mappingId: fm.id,
    }))
  )

  if (flat.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Database size={28} />}
          title="Sin configuraciones"
          description="Agrega configuraciones contables en el tab anterior para verlas agrupadas aquí."
        />
      </Card>
    )
  }

  const grouped = groupByAccount(flat)

  return (
    <div className="space-y-4 fade-in">
      <p className="text-sm" style={{ color: '#606060' }}>
        Vista agrupada por cuenta contable — {grouped.size} cuenta{grouped.size !== 1 ? 's' : ''} en uso
      </p>

      {Array.from(grouped.entries()).map(([accountCode, group]) => (
        <Card key={accountCode}>
          {/* Cabecera de grupo */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md" style={{ background: '#F3F3F3', color: '#3E4983' }}>
                {accountCode}
              </span>
              <h3 className="text-base font-bold" style={{ color: '#121E6C' }}>{group.accountName}</h3>
            </div>
            {group.accountingNote && (
              <p className="text-xs italic" style={{ color: '#969696' }}>{group.accountingNote}</p>
            )}
          </div>

          {/* Tabla de mappings de esta cuenta */}
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F2F6' }}>
                <th className="text-left py-2 text-xs font-semibold" style={{ color: '#606060' }}>Tipo de Transacción</th>
                <th className="text-left py-2 text-xs font-semibold" style={{ color: '#606060' }}>Campo Monetario</th>
                <th className="text-left py-2 text-xs font-semibold" style={{ color: '#606060' }}>Naturaleza</th>
              </tr>
            </thead>
            <tbody>
              {group.rows.map(row => (
                <tr key={`${row.configId}-${row.mappingId}`} style={{ borderBottom: '1px solid #F1F2F6' }}>
                  <td className="py-2 font-mono text-xs" style={{ color: '#121E6C' }}>{row.transactionType}</td>
                  <td className="py-2 font-mono text-xs" style={{ color: '#121E6C' }}>{row.fieldName}</td>
                  <td className="py-2">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={row.nature === 'debito'
                        ? { background: '#F1F9FF', color: '#0A53A5' }
                        : { background: '#FBF3F5', color: '#910022' }}
                    >
                      {row.nature === 'debito' ? 'Débito' : 'Crédito'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
    </div>
  )
}

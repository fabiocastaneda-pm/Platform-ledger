import { create } from 'zustand'
import type { Ledger, Account, LedgerCountry, ScheduledChange } from '../types'
import { mockLedgers } from '../services/mock/ledgers'
import { mockAccounts } from '../services/mock/accounts'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning'
  message: string
}

const mockScheduledChanges: ScheduledChange[] = [
  {
    id: 'sc-001',
    ledgerId: 'ldg-001',
    ledgerName: 'ledger_cashout_montos_altos',
    configId: 'cfg-001',
    transactionType: 'cashout_high_amount',
    fieldMappingId: 'fm-001',
    fieldName: 'amount_principal',
    oldAccountCode: '1105',
    oldAccountName: 'Caja',
    newAccountCode: '1110',
    newAccountName: 'Bancos',
    nature: 'debito',
    scheduledDate: '2026-07-20',
    createdAt: '2026-07-08T10:00:00Z',
    createdBy: 'maria.lopez@bold.co',
    status: 'pendiente',
  },
  {
    id: 'sc-002',
    ledgerId: 'ldg-003',
    ledgerName: 'ledger_pagos_pse',
    configId: 'cfg-003',
    transactionType: 'pse_payment',
    fieldMappingId: 'fm-005',
    fieldName: 'amount_principal',
    oldAccountCode: '2205',
    oldAccountName: 'Proveedores nacionales',
    newAccountCode: '2210',
    newAccountName: 'Cuentas por pagar',
    nature: 'credito',
    scheduledDate: '2026-08-01',
    createdAt: '2026-07-07T15:30:00Z',
    createdBy: 'maria.lopez@bold.co',
    status: 'pendiente',
  },
]

interface AppStore {
  ledgers: Ledger[]
  accounts: Account[]
  toasts: Toast[]
  currentUser: string
  selectedCountry: LedgerCountry
  scheduledChanges: ScheduledChange[]
  setCountry: (country: LedgerCountry) => void
  addLedger: (ledger: Omit<Ledger, 'internalId'>) => void
  updateLedger: (id: string, updates: Partial<Ledger>) => void
  addToast: (type: Toast['type'], message: string) => void
  removeToast: (id: string) => void
  addAccount: (account: Account) => void
  addScheduledChange: (change: ScheduledChange) => void
  updateScheduledChange: (id: string, updates: Partial<ScheduledChange>) => void
  deleteScheduledChange: (id: string) => void
}

export const useAppStore = create<AppStore>((set) => ({
  ledgers: mockLedgers,
  accounts: mockAccounts,
  toasts: [],
  currentUser: 'maria.lopez@bold.co',
  selectedCountry: 'colombia',
  scheduledChanges: mockScheduledChanges,
  setCountry: (country) => set({ selectedCountry: country }),

  addLedger: (ledger) =>
    set((s) => {
      // internalId counter from length; collision risk if delete is added later
      const internalId = `LDG-${String(s.ledgers.length + 1).padStart(3, '0')}`
      const ledgerWithId = { ...ledger, internalId }
      return { ledgers: [ledgerWithId, ...s.ledgers] }
    }),

  updateLedger: (id, updates) =>
    set((s) => ({
      ledgers: s.ledgers.map((l) => {
        if (l.id !== id) return l
        const current = l
        if (current.status === 'inactivo' && (updates as Partial<Ledger>).status !== undefined) {
          updates = { ...updates }
          delete (updates as Partial<Ledger>).status
        }
        return { ...l, ...updates, updatedAt: new Date().toISOString() }
      }),
    })),

  addToast: (type, message) => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  addAccount: (account) =>
    set((s) => ({ accounts: [account, ...s.accounts] })),

  addScheduledChange: (change) =>
    set((s) => ({ scheduledChanges: [change, ...s.scheduledChanges] })),

  updateScheduledChange: (id, updates) =>
    set((s) => ({
      scheduledChanges: s.scheduledChanges.map(c => c.id === id ? { ...c, ...updates } : c),
    })),

  deleteScheduledChange: (id) =>
    set((s) => ({ scheduledChanges: s.scheduledChanges.filter(c => c.id !== id) })),
}))

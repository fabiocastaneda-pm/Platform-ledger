import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppLayout } from './components/ui/AppLayout'
import { LedgerList } from './modules/ledgers/LedgerList'
import { LedgerDetail } from './modules/ledgers/LedgerDetail'
import { Dashboard } from './modules/monitoring/Dashboard'
import { TransactionLog } from './modules/monitoring/TransactionLog'
import { AuditLog } from './modules/audit/AuditLog'
import { ChartOfAccounts } from './modules/accounts/ChartOfAccounts'
import { ERPModule } from './modules/erp/ERPModule'
import { ProgramacionesList } from './modules/programaciones/ProgramacionesList'
import { ConfigEditor } from './modules/accounting/ConfigEditor'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/Platform-ledger">
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/ledgers" replace />} />
            <Route path="ledgers" element={<LedgerList />} />
            <Route path="ledgers/:id" element={<LedgerDetail />} />
            <Route path="ledgers/:id/config/:configId" element={<ConfigEditor />} />
            <Route path="monitoring" element={<Dashboard />} />
            <Route path="transactions" element={<TransactionLog />} />
            <Route path="audit" element={<AuditLog />} />
            <Route path="accounts" element={<ChartOfAccounts />} />
            <Route path="erp" element={<ERPModule />} />
            <Route path="programaciones" element={<ProgramacionesList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

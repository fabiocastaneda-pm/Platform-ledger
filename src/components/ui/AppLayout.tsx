import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { ToastContainer } from './Toast'

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ background: '#F7F8FB' }}>
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
      <ToastContainer />
    </div>
  )
}

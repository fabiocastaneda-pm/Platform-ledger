import { useEffect } from 'react'
import { X } from 'lucide-react'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  width?: string
}

export function Drawer({ open, onClose, title, children, footer, width = '480px' }: DrawerProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="absolute inset-y-0 right-0 flex flex-col slide-in-right"
        style={{
          width,
          background: '#FFFFFF',
          boxShadow: '-4px 0 24px rgba(18,30,108,0.12)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: '1px solid #F1F2F6' }}
        >
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#606060' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#F1F2F6'
              ;(e.currentTarget as HTMLElement).style.color = '#121E6C'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = '#606060'
            }}
          >
            <X size={18} />
          </button>
          <h2
            className="text-base font-bold text-center flex-1"
            style={{ color: '#121E6C' }}
          >
            {title}
          </h2>
          {/* spacer para centrar el título */}
          <div style={{ width: 30 }} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="shrink-0 flex justify-end gap-3 px-6 py-5"
            style={{ borderTop: '1px solid #F1F2F6' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

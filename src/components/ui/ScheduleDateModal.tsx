import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (date: string) => void
  title?: string
  description?: string
}

function getTomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

function getMaxDate(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 2)
  return d.toISOString().split('T')[0]
}

export function ScheduleDateModal({ open, onClose, onConfirm, title, description }: Props) {
  const [date, setDate] = useState(getTomorrow())
  const min = getTomorrow()
  const max = getMaxDate()

  const isValid = date >= min && date <= max

  const handleConfirm = () => {
    if (!isValid) return
    onConfirm(date)
    setDate(getTomorrow())
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || 'Programar cambio de cuenta'}
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!isValid}>Confirmar programación</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: '#FFF3D1' }}>
          <CalendarClock size={18} style={{ color: '#5B3100', marginTop: 2, flexShrink: 0 }} />
          <p className="text-sm" style={{ color: '#5B3100' }}>
            {description || 'No es posible cambiar una cuenta contable en el mismo día (periodo contable). Selecciona la fecha en que debe entrar en vigencia el nuevo mapeo.'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: '#121E6C' }}>
            Fecha de vigencia *
          </label>
          <input
            type="date"
            value={date}
            min={min}
            max={max}
            onChange={e => setDate(e.target.value)}
            className="h-12 w-full px-4 border border-[#969696] text-sm text-[#121E6C] bg-white focus:outline-none focus:border-2 focus:border-[#FF2947]"
            style={{ borderRadius: '12px' }}
          />
          <p className="text-xs mt-1.5" style={{ color: '#969696' }}>
            Mínimo mañana · Máximo 2 meses en el futuro
          </p>
        </div>
      </div>
    </Modal>
  )
}

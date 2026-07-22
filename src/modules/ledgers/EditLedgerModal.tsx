import { useState, useEffect } from 'react'
import { Modal, ConfirmModal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Input, Select, Textarea } from '../../components/ui/Input'
import { useAppStore } from '../../store'
import { PRODUCTS } from '../../services/mock/ledgers'
import type { Ledger } from '../../types'

interface Props {
  ledger: Ledger
  open: boolean
  onClose: () => void
}

export function EditLedgerModal({ ledger, open, onClose }: Props) {
  const { updateLedger, addToast } = useAppStore()
  const [warningConfirmed, setWarningConfirmed] = useState(false)
  const [editName, setEditName] = useState(ledger.name)
  const [editDesc, setEditDesc] = useState(ledger.description || '')
  const [editProduct, setEditProduct] = useState(ledger.product)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setEditName(ledger.name)
      setEditDesc(ledger.description || '')
      setEditProduct(ledger.product)
      setWarningConfirmed(false)
      setLoading(false)
    }
  }, [open])

  const handleSave = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    updateLedger(ledger.id, { name: editName, description: editDesc, product: editProduct })
    addToast('success', 'Ledger actualizado correctamente')
    setLoading(false)
    onClose()
  }

  if (!open) return null

  if (ledger.status === 'activo' && !warningConfirmed) {
    return (
      <ConfirmModal
        open
        onClose={onClose}
        onConfirm={() => setWarningConfirmed(true)}
        title="Editar Ledger Activo"
        message="Este ledger está procesando transacciones. Los cambios se aplicarán solo a nuevas transacciones. ¿Continuar?"
        confirmLabel="Continuar editando"
        variant="primary"
      />
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Editar Ledger"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSave} loading={loading}>Guardar cambios</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Nombre *" value={editName} onChange={e => setEditName(e.target.value)} />
        <Select
          label="Producto Asociado *"
          value={editProduct}
          onChange={e => setEditProduct(e.target.value)}
          options={PRODUCTS.map(p => ({ value: p, label: p }))}
        />
        <Textarea label="Descripción" value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} />
      </div>
    </Modal>
  )
}

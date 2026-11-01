'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertCircle, AlertTriangle, Loader2 } from 'lucide-react'
import Modal from '@/components/Modal'

interface FinalizarViagemModalProps {
  isOpen: boolean
  onClose: () => void
  titulo: string
  // Deve lançar erro em caso de falha (a mensagem é exibida aqui)
  onConfirmar: () => Promise<void>
}

export default function FinalizarViagemModal({ isOpen, onClose, titulo, onConfirmar }: FinalizarViagemModalProps) {
  const [erro, setErro] = useState('')
  const [finalizando, setFinalizando] = useState(false)
  const enviando = useRef(false)

  useEffect(() => {
    if (!isOpen) return
    setErro('')
    setFinalizando(false)
    enviando.current = false
  }, [isOpen])

  async function confirmar() {
    if (enviando.current) return
    enviando.current = true
    setFinalizando(true)
    setErro('')
    try {
      await onConfirmar()
      onClose()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível finalizar a viagem')
    } finally {
      enviando.current = false
      setFinalizando(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={finalizando ? () => {} : onClose} title="Finalizar viagem">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-2">
            <p>
              Deseja finalizar <strong className="wrap-break-word">{titulo}</strong>? A data e a hora da finalização
              serão registradas agora e não poderão ser alteradas.
            </p>
            <p>
              Depois de finalizada, não será mais possível adicionar ou remover pedidos. Despesas e dados gerais
              continuam editáveis e a viagem segue disponível para consulta.
            </p>
          </div>
        </div>

        {erro && (
          <div role="alert" className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span className="wrap-break-word">{erro}</span>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={finalizando}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={finalizando}
            className="flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {finalizando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {finalizando ? 'Finalizando…' : 'Finalizar viagem'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

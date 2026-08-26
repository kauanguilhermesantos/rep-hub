"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, AlertTriangle } from "lucide-react"
import Modal from "@/components/Modal"
import { excluirConta } from "@/services/usuarioService"

interface ExcluirContaModalProps {
  isOpen: boolean
  onClose: () => void
}

const FRASE_CONFIRMACAO = "EXCLUIR"

export default function ExcluirContaModal({ isOpen, onClose }: ExcluirContaModalProps) {
  const router = useRouter()
  const [senha, setSenha] = useState("")
  const [confirmacao, setConfirmacao] = useState("")
  const [erro, setErro] = useState("")
  const [excluindo, setExcluindo] = useState(false)

  const confirmacaoValida = confirmacao === FRASE_CONFIRMACAO

  function fecharEResetar() {
    setSenha("")
    setConfirmacao("")
    setErro("")
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro("")

    if (!confirmacaoValida) {
      setErro(`Digite "${FRASE_CONFIRMACAO}" para confirmar`)
      return
    }

    setExcluindo(true)

    try {
      await excluirConta(senha)
      router.push("/login")
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível excluir a conta")
      setExcluindo(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={fecharEResetar} title="Excluir conta">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-sm">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <span>
            Essa ação é <strong>permanente e irreversível</strong>. Todos os seus
            dados serão excluídos e você não conseguirá recuperar sua conta.
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Digite sua senha para confirmar
          </label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Digite <strong>{FRASE_CONFIRMACAO}</strong> para confirmar
          </label>
          <input
            type="text"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
          />
        </div>

        {erro && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={16} />
            <span>{erro}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={fecharEResetar}
            className="flex-1 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={excluindo || !confirmacaoValida}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {excluindo ? "Excluindo..." : "Excluir conta"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
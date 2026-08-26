"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
import Modal from "@/components/Modal"
import { alterarSenha } from "@/services/usuarioService"
import { passwordRequirements, isPasswordValid } from "@/lib/validation"

interface AlterarSenhaModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AlterarSenhaModal({ isOpen, onClose }: AlterarSenhaModalProps) {
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("")
  const [mostrarRequisitos, setMostrarRequisitos] = useState(false)
  const [erro, setErro] = useState("")
  const [salvando, setSalvando] = useState(false)

  const novaSenhaValida = isPasswordValid(novaSenha)
  const senhasCoincidem = novaSenha === confirmarNovaSenha && confirmarNovaSenha.length > 0

  function fecharEResetar() {
    setSenhaAtual("")
    setNovaSenha("")
    setConfirmarNovaSenha("")
    setErro("")
    setMostrarRequisitos(false)
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro("")

    if (!novaSenhaValida) {
      setErro("A nova senha não atende a todos os requisitos")
      return
    }

    if (!senhasCoincidem) {
      setErro("As senhas não coincidem")
      return
    }

    if (novaSenha === senhaAtual) {
      setErro("A nova senha precisa ser diferente da atual")
      return
    }

    setSalvando(true)

    try {
      await alterarSenha(senhaAtual, novaSenha)
      fecharEResetar()
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível alterar a senha")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={fecharEResetar} title="Alterar senha">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha atual
          </label>
          <input
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nova senha
          </label>
          <input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            onFocus={() => setMostrarRequisitos(true)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {mostrarRequisitos && (
            <ul className="mt-2 space-y-1">
              {passwordRequirements.map((req) => {
                const atendido = req.test(novaSenha)
                return (
                  <li
                    key={req.label}
                    className={`text-xs flex items-center gap-1.5 ${
                      atendido ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    <span>{atendido ? "✓" : "○"}</span>
                    {req.label}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmar nova senha
          </label>
          <input
            type="password"
            value={confirmarNovaSenha}
            onChange={(e) => setConfirmarNovaSenha(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
            disabled={salvando}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import ViagemForm from '@/components/ViagemForm'
import { atualizarViagem, buscarViagem, guardarMensagemViagem, Viagem, ViagemPayload } from '@/services/viagensService'

export default function EditarViagemPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  const [viagem, setViagem] = useState<Viagem | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      setViagem(await buscarViagem(id))
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível carregar a viagem')
    } finally {
      setCarregando(false)
    }
  }, [id])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function salvar(payload: ViagemPayload) {
    await atualizarViagem(id, payload)
    guardarMensagemViagem('Viagem atualizada com sucesso.')
    router.push('/viagens')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Editar viagem</h1>
        <p className="text-sm text-gray-500 mt-1">Campos marcados com * são obrigatórios.</p>
      </div>

      {carregando ? (
        <div className="flex justify-center py-16" role="status" aria-live="polite">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          <span className="sr-only">Carregando viagem…</span>
        </div>
      ) : erro ? (
        <div role="alert" className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm max-w-3xl">
          <div className="flex items-start gap-2 min-w-0">
            <AlertCircle size={20} className="shrink-0" aria-hidden="true" />
            <span className="wrap-break-word">{erro}</span>
          </div>
          <div className="sm:ml-auto flex gap-2">
            <button type="button" onClick={carregar} className="px-3 py-1.5 font-medium bg-white border border-red-300 rounded-lg hover:bg-red-100 transition-colors">
              Tentar novamente
            </button>
            <Link href="/viagens" className="px-3 py-1.5 font-medium bg-white border border-red-300 rounded-lg hover:bg-red-100 transition-colors">
              Voltar
            </Link>
          </div>
        </div>
      ) : viagem ? (
        <ViagemForm modo="editar" inicial={viagem} onSubmit={salvar} cancelarHref="/viagens" />
      ) : null}
    </div>
  )
}

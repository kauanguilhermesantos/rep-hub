'use client'

import { useRouter } from 'next/navigation'
import ViagemForm from '@/components/ViagemForm'
import { criarViagem, guardarMensagemViagem, ViagemPayload } from '@/services/viagensService'

export default function NovaViagemPage() {
  const router = useRouter()

  async function salvar(payload: ViagemPayload) {
    await criarViagem(payload)
    // A listagem recarrega do backend ao abrir e mostra a mensagem de sucesso
    guardarMensagemViagem('Viagem cadastrada com sucesso.')
    router.push('/viagens')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Nova viagem</h1>
        <p className="text-sm text-gray-500 mt-1">Campos marcados com * são obrigatórios.</p>
      </div>
      <ViagemForm modo="criar" onSubmit={salvar} cancelarHref="/viagens" />
    </div>
  )
}

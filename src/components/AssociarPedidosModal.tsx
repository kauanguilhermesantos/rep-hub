'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, Loader2, Search } from 'lucide-react'
import Modal from '@/components/Modal'
import { associarPedidos, listarPedidosDisponiveis, PedidoDaViagem } from '@/services/viagemPedidosService'
import { formatarData } from '@/lib/formatoHora'
import { formatarMoeda } from '@/lib/formatoMoeda'
import { VALOR_OCULTO } from '@/lib/useOcultarValores'

interface AssociarPedidosModalProps {
  isOpen: boolean
  onClose: () => void
  viagemId: string
  ocultarValores?: boolean
  // Chamado depois que o backend confirmou a associação (a página recarrega os dados)
  onAssociados: (quantidade: number) => Promise<void> | void
  // Chamado quando o backend indica que a viagem mudou (ex.: finalizada em outra sessão)
  onViagemAlterada: () => void
}

function localidade(p: PedidoDaViagem): string {
  if (p.cidade && p.estado) return `${p.cidade} - ${p.estado}`
  return p.cidade || p.estado || '—'
}

export default function AssociarPedidosModal({
  isOpen, onClose, viagemId, ocultarValores = false, onAssociados, onViagemAlterada,
}: AssociarPedidosModalProps) {
  const [disponiveis, setDisponiveis] = useState<PedidoDaViagem[]>([])
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erroCarga, setErroCarga] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const enviando = useRef(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErroCarga('')
    try {
      setDisponiveis(await listarPedidosDisponiveis(viagemId))
    } catch (err) {
      setDisponiveis([])
      setErroCarga(err instanceof Error ? err.message : 'Não foi possível carregar os pedidos disponíveis')
    } finally {
      setCarregando(false)
    }
  }, [viagemId])

  // Sempre busca a lista atual do backend ao abrir (outro pedido pode ter sido vinculado/excluído)
  useEffect(() => {
    if (!isOpen) return
    setSelecionados(new Set())
    setBusca('')
    setErro('')
    setSalvando(false)
    enviando.current = false
    carregar()
  }, [isOpen, carregar])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return disponiveis
    return disponiveis.filter((p) =>
      [p.cliente, p.marcaNome, p.cidade, p.estado].some((c) => c?.toLowerCase().includes(termo))
    )
  }, [disponiveis, busca])

  function alternar(id: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      return novo
    })
  }

  async function confirmar() {
    if (enviando.current || selecionados.size === 0) return
    enviando.current = true
    setSalvando(true)
    setErro('')
    const ids = Array.from(selecionados)
    try {
      await associarPedidos(viagemId, ids)
      await onAssociados(ids.length)
      onClose()
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Não foi possível associar os pedidos'
      setErro(mensagem)
      // 404 (pedido sumiu/não é seu) e 409 (já em outra viagem / viagem finalizada):
      // a situação mudou, então recarrega a lista e os dados da viagem para não oferecer opções inválidas
      setSelecionados(new Set())
      carregar()
      onViagemAlterada()
    } finally {
      enviando.current = false
      setSalvando(false)
    }
  }

  const valor = (v: number) => (ocultarValores ? VALOR_OCULTO : formatarMoeda(v))

  return (
    <Modal isOpen={isOpen} onClose={salvando ? () => {} : onClose} title="Adicionar pedidos à viagem" larguraMaxima="max-w-2xl">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Selecione pedidos já cadastrados. Eles não são copiados nem alterados: a viagem apenas os referencia.
          Um pedido só pode estar em uma viagem.
        </p>

        <div className="relative">
          <label htmlFor="busca-pedidos" className="sr-only">Buscar pedidos</label>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            id="busca-pedidos"
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cliente, marca ou cidade"
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {erro && (
          <div role="alert" className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span className="wrap-break-word">{erro}</span>
          </div>
        )}

        {carregando ? (
          <div className="flex justify-center py-10" role="status" aria-live="polite">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            <span className="sr-only">Carregando pedidos…</span>
          </div>
        ) : erroCarga ? (
          <div role="alert" className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <span className="wrap-break-word">{erroCarga}</span>
            <button type="button" onClick={carregar} className="sm:ml-auto px-3 py-1.5 font-medium bg-white border border-red-300 rounded-lg hover:bg-red-100">
              Tentar novamente
            </button>
          </div>
        ) : disponiveis.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Nenhum pedido disponível. Todos os seus pedidos já estão associados a alguma viagem, ou ainda não há pedidos cadastrados.
          </p>
        ) : filtrados.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">Nenhum pedido encontrado para essa busca.</p>
        ) : (
          <ul className="max-h-[45vh] overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-lg">
            {filtrados.map((p) => {
              const marcado = selecionados.has(p.id)
              return (
                <li key={p.id}>
                  <label className={`flex items-start gap-3 p-3 cursor-pointer min-w-0 ${marcado ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() => alternar(p.id)}
                      disabled={salvando}
                      className="mt-1 h-4 w-4 shrink-0"
                    />
                    <span className="flex-1 min-w-0 text-sm">
                      <span className="block font-medium text-gray-800 wrap-break-word">{p.cliente}</span>
                      <span className="block text-gray-500 wrap-break-word">
                        {p.marcaNome ?? 'Marca removida'} · {localidade(p)} · {formatarData(p.dataCadastro)}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium text-gray-800 text-sm" aria-label={ocultarValores ? 'Valor oculto' : undefined}>
                      {valor(p.valorTotal)}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={salvando || selecionados.size === 0}
            className="flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {salvando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {salvando
              ? 'Associando…'
              : selecionados.size === 0
                ? 'Associar pedidos'
                : `Associar ${selecionados.size} ${selecionados.size === 1 ? 'pedido' : 'pedidos'}`}
          </button>
        </div>
      </div>
    </Modal>
  )
}

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, MapPin, Plus, RefreshCw } from 'lucide-react'

import FiltroPeriodo, { PeriodoSelecionado } from '@/components/Filtroperiodo'
import BotaoOcultarValores from '@/components/BotaoOcultarValores'
import ViagemCard from '@/components/ViagemCard'
import { useOcultarValores } from '@/lib/useOcultarValores'
import { listarViagens, StatusViagem, Viagem } from '@/services/viagensService'

type FiltroStatus = '' | StatusViagem

export default function ViagensPage() {
  const [viagens, setViagens] = useState<Viagem[]>([])
  const [carregando, setCarregando] = useState(true)   // primeira carga / troca de filtro sem dados
  const [atualizando, setAtualizando] = useState(false) // recarga mantendo a lista na tela
  const [erro, setErro] = useState('')
  const [status, setStatus] = useState<FiltroStatus>('')
  const [periodo, setPeriodo] = useState<PeriodoSelecionado>({})
  const { oculto, alternar } = useOcultarValores()

  // Evita que uma resposta antiga (filtro anterior) sobrescreva a mais recente
  const requisicaoAtual = useRef(0)

  const carregar = useCallback(async () => {
    const id = ++requisicaoAtual.current
    setErro('')
    setAtualizando(true)
    try {
      const dados = await listarViagens({
        status: status || undefined,
        inicio: periodo.inicio,
        fim: periodo.fim,
      })
      if (id !== requisicaoAtual.current) return
      setViagens(dados)
    } catch (err) {
      if (id !== requisicaoAtual.current) return
      setViagens([]) // não manter na tela uma lista que pertence a outro filtro
      setErro(err instanceof Error ? err.message : 'Não foi possível carregar as viagens')
    } finally {
      if (id === requisicaoAtual.current) {
        setCarregando(false)
        setAtualizando(false)
      }
    }
  }, [status, periodo])

  useEffect(() => {
    carregar()
  }, [carregar])

  const filtrando = status !== '' || !!periodo.inicio || !!periodo.fim
  const primeiraCargaFalhou = !!erro && viagens.length === 0

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-800">Viagens</h1>
          <p className="text-sm text-gray-500 mt-1">Acompanhe suas viagens, despesas e pedidos.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BotaoOcultarValores oculto={oculto} onClick={alternar} />
          <button
            type="button"
            onClick={carregar}
            disabled={atualizando}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={atualizando ? 'animate-spin' : ''} aria-hidden="true" />
            <span>Atualizar</span>
          </button>
          <Link
            href="/viagens/nova"
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} aria-hidden="true" />
            <span>Nova viagem</span>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor="filtro-status" className="text-sm text-gray-600">Status</label>
          <select
            id="filtro-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as FiltroStatus)}
            className="w-full sm:w-56 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Todas</option>
            <option value="EM_ANDAMENTO">Em andamento</option>
            <option value="FINALIZADA">Finalizadas</option>
          </select>
        </div>
        <FiltroPeriodo onChange={setPeriodo} />
      </div>

      {/* Erro (com a lista anterior mantida, se houver) */}
      {erro && (
        <div role="alert" className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <div className="flex items-start gap-2 min-w-0">
            <AlertCircle size={20} className="shrink-0" aria-hidden="true" />
            <span className="break-words">{erro}</span>
          </div>
          <button
            type="button"
            onClick={carregar}
            className="sm:ml-auto px-3 py-1.5 text-sm font-medium bg-white border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Conteúdo */}
      {carregando ? (
        <div className="flex justify-center py-16" role="status" aria-live="polite">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          <span className="sr-only">Carregando viagens…</span>
        </div>
      ) : primeiraCargaFalhou ? null : viagens.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-12 px-4 text-center">
          <MapPin size={40} className="mx-auto text-gray-300 mb-3" aria-hidden="true" />
          <p className="text-gray-700 font-medium">
            {filtrando ? 'Nenhuma viagem encontrada com esses filtros' : 'Você ainda não cadastrou nenhuma viagem'}
          </p>
          {!filtrando && (
            <>
              <p className="text-sm text-gray-500 mt-1">Cadastre uma viagem para registrar despesas e pedidos.</p>
              <Link
                href="/viagens/nova"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} aria-hidden="true" />
                Cadastrar primeira viagem
              </Link>
            </>
          )}
        </div>
      ) : (
        <ul className={`grid grid-cols-1 xl:grid-cols-2 gap-4 transition-opacity ${atualizando ? 'opacity-60' : ''}`} aria-busy={atualizando}>
          {viagens.map((viagem) => (
            <li key={viagem.id} className="min-w-0">
              <ViagemCard viagem={viagem} ocultarValores={oculto} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

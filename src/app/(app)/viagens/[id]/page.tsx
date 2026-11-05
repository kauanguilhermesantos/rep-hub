'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  AlertCircle, ArrowLeft, CalendarCheck, CalendarDays, Info,
  Flag, Lock, MapPin, Pencil, Plus, ShoppingBag, Tag, Trash2, Unlink, Wallet,
} from 'lucide-react'

import ResumoCard from '@/components/ResumoCard'
import ResultadoFinanceiroCard from '@/components/ResultadoFinanceiroCard'
import StatusViagemBadge from '@/components/StatusViagemBadge'
import BotaoOcultarValores from '@/components/BotaoOcultarValores'
import DespesaModal from '@/components/DespesaModal'
import AssociarPedidosModal from '@/components/AssociarPedidosModal'
import FinalizarViagemModal from '@/components/FinalizarViagemModal'
import CategoriasModal from '@/components/CategoriasModal'
import { useOcultarValores, VALOR_OCULTO } from '@/lib/useOcultarValores'
import { buscarViagem, finalizarViagem, Viagem } from '@/services/viagensService'
import { listarPedidosDaViagem, PedidosDaViagem, removerPedidoDaViagem } from '@/services/viagemPedidosService'
import {
  atualizarDespesa, criarDespesa, DespesaPayload, Despesa, DespesasViagem,
  excluirDespesa, listarDespesas,
} from '@/services/despesasService'
import { notificar } from '@/services/notificacoesService'
import { PedidoDaViagem } from '@/services/viagemPedidosService'
import { formatarData, formatarDataHora, formatarDataIso } from '@/lib/formatoHora'
import { formatarMoeda } from '@/lib/formatoMoeda'

export default function DetalheViagemPage() {
  const params = useParams<{ id: string }>()
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  // Tudo que aparece (inclusive totais) vem do backend; nada é somado aqui
  const [viagem, setViagem] = useState<Viagem | null>(null)
  const [despesas, setDespesas] = useState<DespesasViagem | null>(null)
  const [pedidos, setPedidos] = useState<PedidosDaViagem | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [atualizando, setAtualizando] = useState(false)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [emEdicao, setEmEdicao] = useState<Despesa | null>(null)
  const [excluindoId, setExcluindoId] = useState<string | null>(null)
  const [modalPedidos, setModalPedidos] = useState(false)
  const [modalFinalizar, setModalFinalizar] = useState(false)
  const [modalCategorias, setModalCategorias] = useState(false)
  const [removendoPedidoId, setRemovendoPedidoId] = useState<string | null>(null)
  const { oculto, alternar } = useOcultarValores()
  const requisicaoAtual = useRef(0)

  const carregar = useCallback(async () => {
    const req = ++requisicaoAtual.current
    setErro('')
    setAtualizando(true)
    try {
      const [v, d, p] = await Promise.all([buscarViagem(id), listarDespesas(id), listarPedidosDaViagem(id)])
      if (req !== requisicaoAtual.current) return
      setViagem(v)
      setDespesas(d)
      setPedidos(p)
    } catch (err) {
      if (req !== requisicaoAtual.current) return
      setErro(err instanceof Error ? err.message : 'Não foi possível carregar a viagem')
    } finally {
      if (req === requisicaoAtual.current) {
        setCarregando(false)
        setAtualizando(false)
      }
    }
  }, [id])

  useEffect(() => {
    carregar()
  }, [carregar])

  function abrirNova() {
    setEmEdicao(null)
    setModalAberto(true)
  }

  function abrirEdicao(despesa: Despesa) {
    setEmEdicao(despesa)
    setModalAberto(true)
  }

  async function salvarDespesa(payload: DespesaPayload) {
    if (emEdicao) {
      await atualizarDespesa(id, emEdicao.id, payload)
      notificar.sucesso('Despesa atualizada com sucesso.')
    } else {
      await criarDespesa(id, payload)
      notificar.sucesso('Despesa adicionada com sucesso.')
    }
    await carregar() // total e lista vêm de novo do backend
  }

  async function excluir(despesa: Despesa) {
    if (!window.confirm(`Excluir a despesa "${despesa.descricao}"?`)) return
    setExcluindoId(despesa.id)
    try {
      await excluirDespesa(id, despesa.id)
      notificar.sucesso('Despesa excluída com sucesso.')
      await carregar()
    } catch (err) {
      notificar.erro(err instanceof Error ? err.message : 'Não foi possível excluir a despesa')
    } finally {
      setExcluindoId(null)
    }
  }

  async function removerPedido(pedido: PedidoDaViagem) {
    if (!window.confirm(`Remover o pedido de "${pedido.cliente}" desta viagem? O pedido em si não será excluído.`)) return
    setRemovendoPedidoId(pedido.id)
    try {
      await removerPedidoDaViagem(id, pedido.id)
      notificar.sucesso('Pedido removido da viagem.')
    } catch (err) {
      notificar.erro(err instanceof Error ? err.message : 'Não foi possível remover o pedido da viagem')
    } finally {
      setRemovendoPedidoId(null)
      await carregar() // reflete também mudanças feitas em outra sessão (ex.: viagem finalizada)
    }
  }

  async function finalizar() {
    try {
      await finalizarViagem(id)
    } catch (err) {
      await carregar() // a viagem pode ter sido alterada em outra sessão
      throw err
    }
    notificar.sucesso('Viagem finalizada com sucesso.')
    await carregar() // status, data de finalização e totais vêm do backend
  }

  if (carregando) {
    return (
      <div className="flex justify-center py-16" role="status" aria-live="polite">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <span className="sr-only">Carregando viagem…</span>
      </div>
    )
  }

  if (!viagem || !despesas || !pedidos) {
    return (
      <div className="space-y-4">
        <Link href="/viagens" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
          <ArrowLeft size={16} aria-hidden="true" /> Voltar para viagens
        </Link>
        <div role="alert" className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <div className="flex items-start gap-2 min-w-0">
            <AlertCircle size={20} className="shrink-0" aria-hidden="true" />
            <span className="wrap-break-word">{erro || 'Não foi possível carregar a viagem'}</span>
          </div>
          <button type="button" onClick={carregar} className="sm:ml-auto px-3 py-1.5 font-medium bg-white border border-red-300 rounded-lg hover:bg-red-100 transition-colors">
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  const finalizada = viagem.status === 'FINALIZADA'
  const roteiro = viagem.roteiro ?? []
  const totaisPorCategoria = despesas.totalPorCategoria ?? []
  const mostrarValor = (valor: number) => (oculto ? VALOR_OCULTO : formatarMoeda(valor))

  return (
    <div className="space-y-6">
      <Link href="/viagens" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
        <ArrowLeft size={16} aria-hidden="true" /> Voltar para viagens
      </Link>

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800 wrap-break-word min-w-0">{viagem.titulo}</h1>
            <StatusViagemBadge status={viagem.status} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BotaoOcultarValores oculto={oculto} onClick={alternar} />
          {!finalizada && (
            <button
              type="button"
              onClick={() => setModalFinalizar(true)}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Flag size={16} aria-hidden="true" /> Finalizar viagem
            </button>
          )}
          <Link
            href={`/viagens/${viagem.id}/editar`}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Pencil size={16} aria-hidden="true" /> Editar viagem
          </Link>
        </div>
      </div>

      {erro && (
        <div role="alert" className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span className="flex-1 wrap-break-word">{erro} Os dados exibidos podem estar desatualizados.</span>
          <button type="button" onClick={carregar} className="underline shrink-0">Tentar novamente</button>
        </div>
      )}

      {/* Informações gerais */}
      <section aria-labelledby="titulo-geral" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4">
        <h2 id="titulo-geral" className="text-lg font-semibold text-gray-800">Informações gerais</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div className="flex items-start gap-2 min-w-0">
            <CalendarDays size={16} className="shrink-0 mt-0.5 text-gray-400" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="text-gray-500">Data de início</dt>
              <dd className="font-medium text-gray-800">{formatarDataIso(viagem.dataInicio)}</dd>
            </div>
          </div>
          {finalizada && (
            <div className="flex items-start gap-2 min-w-0">
              <CalendarCheck size={16} className="shrink-0 mt-0.5 text-gray-400" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="text-gray-500">Finalizada em</dt>
                <dd className="font-medium text-gray-800">{formatarDataHora(viagem.dataFinalizacao ?? undefined)}</dd>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2 min-w-0 sm:col-span-2">
            <MapPin size={16} className="shrink-0 mt-0.5 text-gray-400" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="text-gray-500">Municípios visitados</dt>
              <dd className="font-medium text-gray-800 wrap-break-word">
                {roteiro.length > 0 ? roteiro.join(' → ') : <span className="text-gray-400 font-normal">Não informado</span>}
              </dd>
            </div>
          </div>
          <div className="sm:col-span-2 min-w-0">
            <dt className="text-gray-500">Observações</dt>
            <dd className="font-medium text-gray-800 whitespace-pre-line wrap-break-word">
              {viagem.observacoes ? viagem.observacoes : <span className="text-gray-400 font-normal">Sem observações</span>}
            </dd>
          </div>
        </dl>
      </section>

      {/* Indicadores financeiros: todos calculados e devolvidos pelo backend */}
      <section aria-label="Indicadores financeiros" className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ResumoCard title="Total de vendas" value={formatarMoeda(viagem.totalVendas ?? 0)} icon={ShoppingBag} color="green" oculto={oculto} />
          <ResumoCard title="Total de despesas" value={formatarMoeda(viagem.totalDespesas ?? despesas.totalDespesas)} icon={Wallet} color="red" oculto={oculto} />
          <ResultadoFinanceiroCard resultado={viagem.resultadoFinanceiro ?? 0} oculto={oculto} />
        </div>
        <p className="flex items-start gap-1.5 text-xs text-gray-500">
          <Info size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            O resultado financeiro é a diferença entre vendas e despesas registradas na viagem. Não é o lucro líquido:
            não considera custo de mercadorias, impostos, comissões ou outros custos que não estejam no sistema.
          </span>
        </p>
      </section>

      <section aria-label="Resumo da viagem" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResumoCard title="Despesas registradas" value={String(despesas.despesas.length)} icon={Wallet} color="gray" oculto={oculto} />
        <ResumoCard title="Pedidos associados" value={String(viagem.quantidadePedidos ?? 0)} icon={ShoppingBag} color="blue" oculto={oculto} />
      </section>

      {totaisPorCategoria.length > 0 && (
        <section aria-label="Total por categoria" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">Total por categoria</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
            {totaisPorCategoria.map((c) => (
              <li key={c.categoria} className="flex justify-between gap-3 min-w-0">
                <span className="text-gray-600 wrap-break-word min-w-0">{c.categoriaNome}</span>
                <span className="font-medium text-gray-800 shrink-0">{mostrarValor(c.total)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Despesas */}
      <section aria-labelledby="titulo-despesas" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 id="titulo-despesas" className="text-lg font-semibold text-gray-800">Despesas</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setModalCategorias(true)}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Tag size={16} aria-hidden="true" /> Categorias
            </button>
            <button
              type="button"
              onClick={abrirNova}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} aria-hidden="true" /> Adicionar despesa
            </button>
          </div>
        </div>

        {finalizada && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
            <Info size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span>Esta viagem está finalizada, mas as despesas ainda podem ser adicionadas, editadas e excluídas.</span>
          </div>
        )}

        {despesas.despesas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-10 px-4 text-center">
            <Wallet size={36} className="mx-auto text-gray-300 mb-3" aria-hidden="true" />
            <p className="text-gray-700 font-medium">Nenhuma despesa registrada nesta viagem</p>
            <p className="text-sm text-gray-500 mt-1">Use “Adicionar despesa” para registrar o primeiro gasto.</p>
          </div>
        ) : (
          <ul className={`space-y-3 transition-opacity ${atualizando ? 'opacity-60' : ''}`} aria-busy={atualizando}>
            {despesas.despesas.map((d) => (
              <li key={d.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                        {d.categoriaNome}
                      </span>
                      <span className="text-xs text-gray-500">{formatarDataIso(d.data)}</span>
                    </div>
                    <p className="mt-1 font-medium text-gray-800 wrap-break-word">{d.descricao}</p>
                    {d.observacoes && <p className="mt-0.5 text-sm text-gray-500 wrap-break-word whitespace-pre-line">{d.observacoes}</p>}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <p className="text-lg font-semibold text-gray-800 whitespace-nowrap" aria-label={oculto ? 'Valor oculto' : undefined}>
                      {mostrarValor(d.valor)}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => abrirEdicao(d)}
                        aria-label={`Editar despesa ${d.descricao}`}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <Pencil size={18} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => excluir(d)}
                        disabled={excluindoId === d.id}
                        aria-label={`Excluir despesa ${d.descricao}`}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pedidos associados (referências a pedidos existentes) */}
      <section aria-labelledby="titulo-pedidos" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 id="titulo-pedidos" className="text-lg font-semibold text-gray-800">Pedidos associados</h2>
          {!finalizada && (
            <button
              type="button"
              onClick={() => setModalPedidos(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} aria-hidden="true" /> Adicionar pedidos
            </button>
          )}
        </div>

        {finalizada && (
          <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
            <Lock size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span>Os pedidos desta viagem estão bloqueados porque ela foi finalizada. A consulta continua disponível.</span>
          </div>
        )}

        {pedidos.pedidos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResumoCard title="Valor dos pedidos" value={formatarMoeda(pedidos.valorTotalPedidos)} icon={ShoppingBag} color="green" oculto={oculto} />
            <ResumoCard title="Comissão dos pedidos" value={formatarMoeda(pedidos.valorTotalComissao)} icon={ShoppingBag} color="purple" oculto={oculto} />
          </div>
        )}

        {pedidos.pedidos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-10 px-4 text-center">
            <ShoppingBag size={36} className="mx-auto text-gray-300 mb-3" aria-hidden="true" />
            <p className="text-gray-700 font-medium">Nenhum pedido associado a esta viagem</p>
            {!finalizada && <p className="text-sm text-gray-500 mt-1">Use “Adicionar pedidos” para vincular pedidos já cadastrados.</p>}
          </div>
        ) : (
          <ul className={`space-y-3 transition-opacity ${atualizando ? 'opacity-60' : ''}`} aria-busy={atualizando}>
            {pedidos.pedidos.map((p) => (
              <li key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 wrap-break-word">{p.cliente}</p>
                    <p className="text-sm text-gray-500 wrap-break-word">
                      {p.marcaNome ?? 'Marca removida'} · {p.cidade ? `${p.cidade}${p.estado ? ` - ${p.estado}` : ''}` : '—'} · {formatarData(p.dataCadastro)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <p className="text-lg font-semibold text-gray-800 whitespace-nowrap" aria-label={oculto ? 'Valor oculto' : undefined}>
                      {mostrarValor(p.valorTotal)}
                    </p>
                    {!finalizada && (
                      <button
                        type="button"
                        onClick={() => removerPedido(p)}
                        disabled={removendoPedidoId === p.id}
                        aria-label={`Remover o pedido de ${p.cliente} da viagem`}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        <Unlink size={18} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AssociarPedidosModal
        isOpen={modalPedidos}
        onClose={() => setModalPedidos(false)}
        viagemId={viagem.id}
        ocultarValores={oculto}
        onAssociados={async (qtd) => {
          notificar.sucesso(qtd === 1 ? 'Pedido associado à viagem.' : `${qtd} pedidos associados à viagem.`)
          await carregar()
        }}
        onViagemAlterada={carregar}
      />

      <FinalizarViagemModal
        isOpen={modalFinalizar}
        onClose={() => setModalFinalizar(false)}
        titulo={viagem.titulo}
        onConfirmar={finalizar}
      />

      <CategoriasModal
        isOpen={modalCategorias}
        onClose={(alterou) => {
          setModalCategorias(false)
          if (alterou) carregar() // nomes renomeados/removidos aparecem nas despesas e nos totais
        }}
      />

      <DespesaModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        despesa={emEdicao}
        onSave={salvarDespesa}
      />
    </div>
  )
}

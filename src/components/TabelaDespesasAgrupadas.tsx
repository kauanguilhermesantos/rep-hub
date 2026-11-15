'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle } from 'lucide-react'

import { FORMAS_PAGAMENTO } from '@/services/despesasService'
import { buscarDespesasAgrupadas } from '@/services/relatorioService'
import type { AgrupamentoDespesas, RelatorioDespesas } from '@/types/relatorio'
import { formatarMoeda, formatarPercentual } from '@/lib/formatoMoeda'
import { VALOR_OCULTO } from '@/lib/useOcultarValores'

const AGRUPAMENTOS: Record<AgrupamentoDespesas, string> = {
  FORMA_PAGAMENTO: 'Forma de pagamento',
  CATEGORIA: 'Categoria de despesa',
}
const ROTULOS_FORMA: Record<string, string> = FORMAS_PAGAMENTO

interface Props {
  viagemId: string
  oculto: boolean
  // Muda sempre que a lista de despesas é recarregada (cadastro, edição, exclusão) -> tabela refeita
  recarregarQuando: unknown
}

export default function TabelaDespesasAgrupadas({ viagemId, oculto, recarregarQuando }: Props) {
  const [agruparPor, setAgruparPor] = useState<AgrupamentoDespesas>('FORMA_PAGAMENTO')
  const [dados, setDados] = useState<RelatorioDespesas | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const requisicaoAtual = useRef(0)

  const carregar = useCallback(async () => {
    const req = ++requisicaoAtual.current
    setCarregando(true)
    setErro('')
    try {
      const r = await buscarDespesasAgrupadas(viagemId, agruparPor)
      if (req === requisicaoAtual.current) setDados(r)
    } catch (err) {
      if (req === requisicaoAtual.current) setErro(err instanceof Error ? err.message : 'Não foi possível carregar o relatório')
    } finally {
      if (req === requisicaoAtual.current) setCarregando(false)
    }
  }, [viagemId, agruparPor])

  useEffect(() => {
    carregar()
  }, [carregar, recarregarQuando])

  const moeda = (valor: number) => (oculto ? VALOR_OCULTO : formatarMoeda(valor))
  const nomeGrupo = (chave: string, nome: string | null) =>
    nome ?? (chave === 'NAO_INFORMADO' ? 'Não informado' : ROTULOS_FORMA[chave] ?? chave)
  const grupos = dados?.grupos ?? []

  return (
    <section aria-labelledby="titulo-despesas-agrupadas" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 id="titulo-despesas-agrupadas" className="text-lg font-semibold text-gray-800">Resumo das despesas</h2>
          <p className="text-sm text-gray-500">Considera todas as despesas da viagem.</p>
        </div>
        <label className="w-full sm:w-auto">
          <span className="sr-only">Agrupar por</span>
          <select
            value={agruparPor}
            onChange={(e) => setAgruparPor(e.target.value as AgrupamentoDespesas)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            {Object.entries(AGRUPAMENTOS).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </label>
      </div>

      {erro && (
        <div role="alert" className="flex items-start gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span className="flex-1 wrap-break-word">{erro}</span>
          <button type="button" onClick={carregar} className="underline shrink-0">Tentar novamente</button>
        </div>
      )}

      {carregando && !dados ? (
        <div className="flex justify-center py-10" role="status" aria-live="polite">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          <span className="sr-only">Carregando resumo…</span>
        </div>
      ) : dados && (grupos.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">Nenhuma despesa registrada nesta viagem.</p>
      ) : (
        <div className={`overflow-x-auto overscroll-x-contain transition-opacity ${carregando ? 'opacity-60' : ''}`} aria-busy={carregando}>
          <table className="w-full min-w-120">
            <thead>
              <tr className="border-b border-gray-200 text-sm font-medium text-gray-500">
                <th className="text-left py-3 px-3 sm:px-4 whitespace-nowrap">{AGRUPAMENTOS[agruparPor]}</th>
                <th className="text-right py-3 px-3 sm:px-4 whitespace-nowrap">Despesas</th>
                <th className="text-right py-3 px-3 sm:px-4 whitespace-nowrap">Valor total</th>
                <th className="text-right py-3 px-3 sm:px-4 whitespace-nowrap">% do total</th>
              </tr>
            </thead>
            <tbody>
              {grupos.map((g, i) => (
                <tr key={g.chave} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="py-3 px-3 sm:px-4 whitespace-nowrap font-medium text-gray-800">{nomeGrupo(g.chave, g.nome)}</td>
                  <td className="py-3 px-3 sm:px-4 whitespace-nowrap text-right text-gray-600">{g.quantidade}</td>
                  <td className="py-3 px-3 sm:px-4 whitespace-nowrap text-right text-gray-600">{moeda(g.total)}</td>
                  <td className="py-3 px-3 sm:px-4 whitespace-nowrap text-right text-gray-600">{formatarPercentual(g.percentual)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold text-gray-800">
                <td className="py-4 px-3 sm:px-4 whitespace-nowrap">Total</td>
                <td className="py-4 px-3 sm:px-4 whitespace-nowrap text-right">{dados.quantidadeDespesas}</td>
                <td className="py-4 px-3 sm:px-4 whitespace-nowrap text-right">{moeda(dados.totalDespesas)}</td>
                <td className="py-4 px-3 sm:px-4 whitespace-nowrap text-right">{formatarPercentual(100)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ))}
    </section>
  )
}

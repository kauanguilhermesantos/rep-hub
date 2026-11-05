'use client'

import Link from 'next/link'
import { Eye, Edit2 } from 'lucide-react'
import StatusViagemBadge from '@/components/StatusViagemBadge'
import { contarCidades, situacaoResultado, Viagem } from '@/services/viagensService'
import { formatarDataHora, formatarDataIso } from '@/lib/formatoHora'
import { formatarMoeda } from '@/lib/formatoMoeda'
import { VALOR_OCULTO } from '@/lib/useOcultarValores'

interface ViagemTabelaProps {
  viagens: Viagem[]
  ocultarValores?: boolean
}

const TH = 'py-3 px-3 sm:px-4 text-sm font-medium whitespace-nowrap text-gray-500'
const TD = 'py-3 px-3 sm:px-4 whitespace-nowrap'

// Visualização em lista: mesmo estilo de PedidoTabela (rolagem horizontal em telas pequenas)
export default function ViagemTabela({ viagens, ocultarValores = false }: ViagemTabelaProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto overscroll-x-contain">
        <table className="w-full min-w-280">
          <caption className="sr-only">Lista de viagens</caption>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th scope="col" className={`text-left ${TH}`}>Viagem</th>
              <th scope="col" className={`text-left ${TH}`}>Status</th>
              <th scope="col" className={`text-left ${TH}`}>Início</th>
              <th scope="col" className={`text-left ${TH}`}>Finalização</th>
              <th scope="col" className={`text-right ${TH}`}>Cidades</th>
              <th scope="col" className={`text-right ${TH}`}>Vendas</th>
              <th scope="col" className={`text-right ${TH}`}>Despesas</th>
              <th scope="col" className={`text-right ${TH}`}>Resultado</th>
              <th scope="col" className={`text-right ${TH}`}>Pedidos</th>
              <th scope="col" className={`text-center ${TH}`}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {viagens.map((viagem, index) => {
              const cidades = contarCidades(viagem.roteiro)
              return (
                <tr
                  key={viagem.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="py-3 px-3 sm:px-4 max-w-[18rem]">
                    <Link
                      href={`/viagens/${viagem.id}`}
                      className="font-medium text-gray-800 hover:text-blue-600 transition-colors block truncate"
                      title={viagem.titulo}
                    >
                      {viagem.titulo}
                    </Link>
                  </td>
                  <td className={TD}><StatusViagemBadge status={viagem.status} /></td>
                  <td className={`${TD} text-gray-600`}>{formatarDataIso(viagem.dataInicio)}</td>
                  <td className={`${TD} text-gray-600`}>
                    {viagem.status === 'FINALIZADA' ? formatarDataHora(viagem.dataFinalizacao ?? undefined) : '—'}
                  </td>
                  <td className={`${TD} text-right text-gray-600`}>
                    {cidades > 0 ? cidades : <span aria-label="Nenhuma cidade">—</span>}
                  </td>
                  <td
                    className={`${TD} text-right text-gray-800`}
                    aria-label={ocultarValores ? 'Valor oculto' : undefined}
                  >
                    {ocultarValores ? VALOR_OCULTO : formatarMoeda(viagem.totalVendas ?? 0)}
                  </td>
                  <td
                    className={`${TD} text-right text-gray-800`}
                    aria-label={ocultarValores ? 'Valor oculto' : undefined}
                  >
                    {ocultarValores ? VALOR_OCULTO : formatarMoeda(viagem.totalDespesas ?? 0)}
                  </td>
                  <td
                    className={`${TD} text-right font-semibold ${
                      ocultarValores ? 'text-gray-800'
                        : situacaoResultado(viagem.resultadoFinanceiro) === 'positivo' ? 'text-green-700'
                        : situacaoResultado(viagem.resultadoFinanceiro) === 'negativo' ? 'text-red-700' : 'text-gray-700'
                    }`}
                    aria-label={ocultarValores ? 'Valor oculto' : undefined}
                  >
                    {ocultarValores ? VALOR_OCULTO : formatarMoeda(viagem.resultadoFinanceiro ?? 0)}
                  </td>
                  <td className={`${TD} text-right text-gray-600`}>{viagem.quantidadePedidos ?? 0}</td>
                  <td className={TD}>
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/viagens/${viagem.id}`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalhes"
                        aria-label={`Ver detalhes de ${viagem.titulo}`}
                      >
                        <Eye size={16} aria-hidden="true" />
                      </Link>
                      <Link
                        href={`/viagens/${viagem.id}/editar`}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Editar viagem"
                        aria-label={`Editar ${viagem.titulo}`}
                      >
                        <Edit2 size={16} aria-hidden="true" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

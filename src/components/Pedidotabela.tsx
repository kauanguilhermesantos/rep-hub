'use client'

import { Eye, Edit2, Trash2, Paperclip } from 'lucide-react'
import { Pedido } from '@/app/(app)/pedidos/page'

interface PedidoTabelaProps {
  pedidos: Pedido[]
  onView: (pedido: Pedido) => void
  onEdit: (pedido: Pedido) => void
  onDelete: (id: string) => void
}

export default function PedidoTabela({ pedidos, onView, onEdit, onDelete }: PedidoTabelaProps) {
  const formatCurrency = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Marca</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Cliente</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Pares</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Valor Total</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Comissão</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Pagamento</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Data</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido, index) => (
              <tr
                key={pedido.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {pedido.marcaNome.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{pedido.marcaNome}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600">{pedido.cliente}</td>
                <td className="py-3 px-4 text-right text-gray-600">{pedido.pares}</td>
                <td className="py-3 px-4 text-right text-gray-800 font-medium">
                  {formatCurrency(pedido.valorTotal)}
                </td>
                <td className="py-3 px-4 text-right text-green-600 font-medium">
                  {formatCurrency(pedido.valorComissao)}
                  <span className="text-xs text-gray-400 ml-1">({pedido.comissaoPercentual}%)</span>
                </td>
                <td className="py-3 px-4 text-gray-600">{pedido.condicaoPagamento}</td>
                <td className="py-3 px-4 text-gray-600">{pedido.dataCadastro}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onView(pedido)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Visualizar pedido"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(pedido)}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Editar pedido"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(pedido.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir pedido"
                    >
                      <Trash2 size={16} />
                    </button>
                    {pedido.anexo && (
                      <a
                        href={pedido.anexo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={pedido.anexo.nome}
                      >
                        <Paperclip size={16} />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
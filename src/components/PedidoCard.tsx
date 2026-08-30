'use client'

import { User, Paperclip, Eye, Edit2, Trash2 } from 'lucide-react'
import { Pedido } from '@/app/(app)/pedidos/page'

interface PedidoCardProps {
  pedido: Pedido
  onView: (pedido: Pedido) => void
  onEdit: (pedido: Pedido) => void
  onDelete: (id: string) => void
}

export default function PedidoCard({ pedido, onView, onEdit, onDelete }: PedidoCardProps) {
  // Função para gerar cor gradiente baseada no nome da marca
  const getAvatarColor = (marcaNome: string) => {
    const cores = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-yellow-500 to-yellow-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-red-500 to-red-600',
      'from-teal-500 to-teal-600',
    ]
    const index = marcaNome.length % cores.length
    return cores[index]
  }

  // Formatar valor para moeda brasileira
  const formatCurrency = (valor: number) => {
    return valor.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
      <div className="p-6">
        {/* Cabeçalho do Card */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar com gradiente baseado na marca */}
            <div className={`w-12 h-12 rounded-lg bg-linear-to-br ${getAvatarColor(pedido.marcaNome)} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
              {pedido.marcaNome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{pedido.marcaNome}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <User size={14} className="text-gray-400" />
                <span>{pedido.cliente}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detalhes do Pedido */}
        <div className="space-y-3 mb-4 bg-gray-50 p-4 rounded-lg">
          {/* ID do Pedido */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-1">
              Pedido #:
            </span>
            <span className="font-medium text-gray-800 font-mono">
              {pedido.id.slice(-6).toUpperCase()}
            </span>
          </div>

          {/* Pares */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Pares:</span>
            <span className="font-medium text-gray-800">{pedido.pares}</span>
          </div>

          {/* Valor Total */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Valor Total:</span>
            <span className="font-medium text-gray-800">
              {formatCurrency(pedido.valorTotal)}
            </span>
          </div>

          {/* Comissão */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Comissão ({pedido.comissaoPercentual}%):</span>
            <span className="font-medium text-green-600">
              {formatCurrency(pedido.valorComissao)}
            </span>
          </div>

          {/* Condição de Pagamento */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Pagamento:</span>
            <span className="font-medium text-gray-800">{pedido.condicaoPagamento}</span>
          </div>

          {/* Data de Cadastro */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Data:</span>
            <span className="font-medium text-gray-800">{pedido.dataCadastro}</span>
          </div>
        </div>

        {/* Anexo e Ações */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Anexo */}
          <div>
            {pedido.anexo ? (
              <a 
                href={pedido.anexo.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg"
              >
                <Paperclip size={14} />
                <span className="truncate max-w-30">{pedido.anexo.nome}</span>
              </a>
            ) : (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Paperclip size={14} />
                Sem anexo
              </span>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onView(pedido)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Visualizar pedido"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => onEdit(pedido)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Editar pedido"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => onDelete(pedido.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Excluir pedido"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
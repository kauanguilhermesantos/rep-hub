// components/VisualizarPedidoModal.tsx
'use client'

import { X, FileText, Download, User, Package, DollarSign, Calendar, CreditCard, Tag, Paperclip } from 'lucide-react'
import { Pedido } from '@/app/pedidos/page'

interface VisualizarPedidoModalProps {
  isOpen: boolean
  onClose: () => void
  pedido: Pedido | null
}

export default function VisualizarPedidoModal({ isOpen, onClose, pedido }: VisualizarPedidoModalProps) {
  if (!isOpen || !pedido) return null

  // Formatar valor para moeda brasileira
  const formatCurrency = (valor: number) => {
    return valor.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    })
  }

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Entregue': return 'bg-green-100 text-green-700'
      case 'Processando': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Função para gerar cor gradiente baseada no nome da marca
  const getAvatarColor = (marcaNome: string) => {
    const cores = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-yellow-500 to-yellow-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
    ]
    const index = marcaNome.length % cores.length
    return cores[index]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-linear-to-br ${getAvatarColor(pedido.marcaNome)} flex items-center justify-center text-white font-bold`}>
              {pedido.marcaNome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Detalhes do Pedido</h3>
              <p className="text-sm text-gray-500">ID: {pedido.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Fechar"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status do pedido</span>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(pedido.status)}`}>
              {pedido.status}
            </span>
          </div>

          {/* Informações principais em grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna 1 */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Tag size={16} className="text-blue-500" />
                  Informações da Marca
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Marca</p>
                    <p className="font-medium text-gray-800">{pedido.marcaNome}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cliente</p>
                    <p className="font-medium text-gray-800 flex items-center gap-1">
                      <User size={14} className="text-gray-400" />
                      {pedido.cliente}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Package size={16} className="text-green-500" />
                  Detalhes do Pedido
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Pares</p>
                    <p className="font-medium text-gray-800">{pedido.pares}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Data de Cadastro</p>
                    <p className="font-medium text-gray-800 flex items-center gap-1">
                      <Calendar size={14} className="text-gray-400" />
                      {pedido.dataCadastro}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna 2 */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <DollarSign size={16} className="text-yellow-500" />
                  Valores
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Valor Total</p>
                    <p className="font-medium text-gray-800 text-lg">
                      {formatCurrency(pedido.valorTotal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Comissão</p>
                    <p className="font-medium text-green-600 text-lg">
                      {formatCurrency(pedido.valorComissao)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <CreditCard size={16} className="text-purple-500" />
                  Pagamento
                </h4>
                <div>
                  <p className="text-xs text-gray-500">Condição de Pagamento</p>
                  <p className="font-medium text-gray-800">{pedido.condicaoPagamento}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Anexo */}
          {pedido.anexo && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Paperclip size={16} className="text-blue-500" />
                Anexo
              </h4>
              <a 
                href={pedido.anexo.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-blue-600 hover:text-blue-700 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all group"
              >
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <FileText size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{pedido.anexo.nome}</p>
                  <p className="text-xs text-gray-500">Clique para baixar</p>
                </div>
                <Download size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
              </a>
            </div>
          )}

          {/* Informações adicionais */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 text-center">
              Pedido criado em {pedido.dataCadastro} • ID: {pedido.id}
            </p>
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex justify-end p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
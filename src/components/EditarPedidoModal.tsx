'use client'

import { useState, useEffect } from 'react'
import { X, Package, User, DollarSign, Tag, Percent } from 'lucide-react'
import { Marca } from '@/components/MarcaCard'
import { Pedido } from '@/app/(app)/pedidos/page'
import { PedidoFormPayload } from '@/services/pedidoService'

interface EditarPedidoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, payload: PedidoFormPayload) => Promise<void>
  pedido: Pedido | null
  marcas: Marca[]
}

export default function EditarPedidoModal({ isOpen, onClose, onSave, pedido, marcas }: EditarPedidoModalProps) {
  const [cliente, setCliente] = useState('')
  const [marcaId, setMarcaId] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [comissaoPercentual, setComissaoPercentual] = useState('')
  const [condicaoPagamento, setCondicaoPagamento] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  // Preencher o formulário quando o pedido for carregado
  useEffect(() => {
    if (pedido) {
      setCliente(pedido.cliente)
      setMarcaId(pedido.marcaId)
      setQuantidade(pedido.pares.toString())
      setValorTotal(pedido.valorTotal.toString())
      setComissaoPercentual(pedido.comissaoPercentual.toString())
      setCondicaoPagamento(pedido.condicaoPagamento)
      setErro('')
    }
  }, [pedido])

  if (!isOpen || !pedido) return null

  const valorTotalNum = parseFloat(valorTotal) || 0
  const comissaoNum = parseFloat(comissaoPercentual) || 0
  const valorComissaoCalculado = (valorTotalNum * comissaoNum) / 100

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!marcaId) {
      setErro('Selecione uma marca')
      return
    }

    setSalvando(true)
    try {
      await onSave(pedido!.id, {
        marcaId,
        cliente,
        quantPares: parseInt(quantidade) || 0,
        valorTotal: valorTotalNum,
        comissaoPercentual: comissaoNum,
        valorComissao: valorComissaoCalculado,
        condicaoPagamento,
      })
      onClose()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível salvar as alterações')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Package className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">Editar Pedido</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-1">
                <User size={16} />
                <span>Cliente</span>
              </div>
            </label>
            <input
              type="text"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-1">
                <Tag size={16} />
                <span>Marca</span>
              </div>
            </label>
            <select
              value={marcaId}
              onChange={(e) => setMarcaId(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">Selecione uma marca</option>
              {marcas.map(marca => (
                <option key={marca.id} value={marca.id}>{marca.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-1">
                <Package size={16} />
                <span>Quantidade de Pares</span>
              </div>
            </label>
            <input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-1">
                  <DollarSign size={16} />
                  <span>Valor Total</span>
                </div>
              </label>
              <input
                type="number"
                value={valorTotal}
                onChange={(e) => setValorTotal(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-1">
                  <Percent size={16} />
                  <span>Comissão %</span>
                </div>
              </label>
              <input
                type="number"
                value={comissaoPercentual}
                onChange={(e) => setComissaoPercentual(e.target.value)}
                required
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {valorTotalNum > 0 && comissaoNum > 0 && (
            <p className="text-xs text-gray-500">
              Comissão calculada:{' '}
              <strong>
                {valorComissaoCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condição de Pagamento
            </label>
            <input
              type="text"
              value={condicaoPagamento}
              onChange={(e) => setCondicaoPagamento(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">
              ID do Pedido: <span className="font-mono text-gray-700">{pedido.id}</span>
            </p>
          </div>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { X, Package, User, Calendar, DollarSign, Tag } from 'lucide-react'
import { Pedido } from '@/app/pedidos/page'

interface EditarPedidoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, pedidoAtualizado: any) => void
  pedido: Pedido | null
}

export default function EditarPedidoModal({ isOpen, onClose, onSave, pedido }: EditarPedidoModalProps) {
  const [formData, setFormData] = useState({
    cliente: '',
    marca: '',
    quantidade: '',
    valor: '',
    data: '',
    status: 'Processando' as 'Pendente' | 'Processando' | 'Preparando' | 'Entregue'
  })

  // Preencher o formulário quando o pedido for carregado
  useEffect(() => {
    if (pedido) {
      setFormData({
        cliente: pedido.cliente,
        marca: pedido.marcaNome,
        quantidade: pedido.pares.toString(),
        valor: pedido.valorTotal.toString(),
        data: pedido.dataCadastro.split('/').reverse().join('-'), // Converte dd/mm/aaaa para aaaa-mm-dd
        status: pedido.status
      })
    }
  }, [pedido])

  if (!isOpen || !pedido) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Atualizar pedido
    const pedidoAtualizado = {
      ...pedido,
      cliente: formData.cliente,
      marca: formData.marca,
      quantidade: parseInt(formData.quantidade) || 0,
      valor: parseFloat(formData.valor) || 0,
      data: formData.data.split('-').reverse().join('/'), // Converte aaaa-mm-dd para dd/mm/aaaa
      status: formData.status
    }
    
    onSave(pedido.id, pedidoAtualizado)
    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Lista de marcas mockada
  const marcas = [
    'Nike', 'Adidas', 'Puma', 'Vans', 'Oakley', 'New Balance'
  ]

  // Opções de status
  const statusOptions = [
    { value: 'Pendente', label: 'Pendente', color: 'gray' },
    { value: 'Processando', label: 'Processando', color: 'yellow' },
    { value: 'Preparando', label: 'Preparando', color: 'blue' },
    { value: 'Entregue', label: 'Entregue', color: 'green' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full animate-fade-in">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Package className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">Editar Pedido</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-1">
                <User size={16} />
                <span>Cliente</span>
              </div>
            </label>
            <input
              type="text"
              name="cliente"
              value={formData.cliente}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nome do cliente"
            />
          </div>

          {/* Marca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-1">
                <Tag size={16} />
                <span>Marca</span>
              </div>
            </label>
            <select
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">Selecione uma marca</option>
              {marcas.map(marca => (
                <option key={marca} value={marca}>{marca}</option>
              ))}
            </select>
          </div>

          {/* Quantidade de Pares */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-1">
                <Package size={16} />
                <span>Quantidade de Pares</span>
              </div>
            </label>
            <input
              type="number"
              name="quantidade"
              value={formData.quantidade}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Ex: 2"
            />
          </div>

          {/* Valor Total */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-1">
                <DollarSign size={16} />
                <span>Valor Total</span>
              </div>
            </label>
            <input
              type="number"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="R$ 0,00"
            />
          </div>

          {/* Data do Pedido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Data do Pedido</span>
              </div>
            </label>
            <input
              type="date"
              name="data"
              value={formData.data}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Status do Pedido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-1">
                <Package size={16} />
                <span>Status</span>
              </div>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Informação do ID */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">
              ID do Pedido: <span className="font-mono text-gray-700">{pedido.id}</span>
            </p>
          </div>

          {/* Botões */}
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
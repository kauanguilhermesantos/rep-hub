'use client'

import { useState } from 'react'
import { X, Package, User, DollarSign, Tag, Percent, Calendar, MapPin } from 'lucide-react'
import { Marca } from '@/components/MarcaCard'
import { PedidoFormPayload } from '@/services/pedidoService'
import { ApiError } from '@/lib/ApiError'
import { hojeIso } from '@/lib/formatoHora'

interface NovoPedidoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payload: PedidoFormPayload) => Promise<void>
  marcas: Marca[]
}

export default function NovoPedidoModal({ isOpen, onClose, onSave, marcas }: NovoPedidoModalProps) {
  const [cliente, setCliente] = useState('')
  const [marcaId, setMarcaId] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [condicaoPagamento, setCondicaoPagamento] = useState('')
  const [comissaoPercentual, setComissaoPercentual] = useState('')
  const [cidade, setCidade] = useState('')
  const [data, setData] = useState(hojeIso())
  const [erro, setErro] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [salvando, setSalvando] = useState(false)

  if (!isOpen) return null

  function resetar() {
    setCliente('')
    setMarcaId('')
    setQuantidade('')
    setValorTotal('')
    setCondicaoPagamento('')
    setComissaoPercentual('')
    setCidade('')
    setData(hojeIso())
    setErro('')
    setFieldErrors({})
  }

  function fechar() {
    resetar()
    onClose()
  }

  const valorTotalNum = parseFloat(valorTotal) || 0
  const comissaoNum = parseFloat(comissaoPercentual) || 0
  const valorComissaoCalculado = (valorTotalNum * comissaoNum) / 100

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setFieldErrors({})

    if (!marcaId) {
      setFieldErrors({ 'marca.id': 'Selecione uma marca' })
      return
    }

    setSalvando(true)
    try {
      await onSave({
        marcaId,
        cliente,
        quantPares: parseInt(quantidade) || 0,
        valorTotal: valorTotalNum,
        comissaoPercentual: comissaoNum,
        valorComissao: valorComissaoCalculado,
        condicaoPagamento,
        cidade: cidade.trim(),
        data,
      })
      fechar()
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors)
      }
      setErro(err instanceof Error ? err.message : 'Não foi possível criar o pedido')
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
            <h3 className="text-lg font-semibold text-gray-800">Novo Pedido</h3>
          </div>
          <button onClick={fechar} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${
                fieldErrors.cliente
                  ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder="Nome do cliente"
            />
            {fieldErrors.cliente && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.cliente}</p>
            )}
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors bg-white ${
                fieldErrors['marca.id']
                  ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            >
              <option value="">Selecione uma marca</option>
              {marcas.map(marca => (
                <option key={marca.id} value={marca.id}>{marca.nome}</option>
              ))}
            </select>
            {fieldErrors['marca.id'] && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors['marca.id']}</p>
            )}
            {marcas.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Cadastre uma marca antes de criar um pedido.
              </p>
            )}
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${
                fieldErrors.quantPares
                  ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder="Ex: 20"
            />
            {fieldErrors.quantPares && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.quantPares}</p>
            )}
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${
                  fieldErrors.valorTotal
                    ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="R$ 0,00"
              />
              {fieldErrors.valorTotal && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.valorTotal}</p>
              )}
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${
                  fieldErrors.comissaoPercentual
                    ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="Ex: 5"
              />
              {fieldErrors.comissaoPercentual && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.comissaoPercentual}</p>
              )}
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${
                fieldErrors.condicaoPagamento
                  ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder="Ex: 30 dias, à vista, 30/60 dias"
            />
            {fieldErrors.condicaoPagamento && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.condicaoPagamento}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>Cidade</span>
              </div>
            </label>
            <input
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              required
              maxLength={100}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${
                fieldErrors.cidade
                  ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder="Ex: Fortaleza"
            />
            {fieldErrors.cidade && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.cidade}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Data do Pedido</span>
              </div>
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
              max={hojeIso()}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${
                fieldErrors.data
                  ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
            {fieldErrors.data && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.data}</p>
            )}
          </div>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={fechar}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {salvando ? 'Cadastrando...' : 'Cadastrar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
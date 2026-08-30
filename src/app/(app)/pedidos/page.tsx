'use client'

import { useState, useEffect } from 'react'
import {
  Package,
  ShoppingBag,
  DollarSign,
  Percent,
  Plus,
  Search,
  AlertCircle
} from 'lucide-react'

import { Marca } from '@/components/MarcaCard'
import NovoPedidoModal from '@/components/NovoPedidoModal'
import EditarPedidoModal from '@/components/EditarPedidoModal'
import PedidoCard from '@/components/PedidoCard'
import VisualizarPedidoModal from '@/components/VisualizarPedidoModal'
import { listarPedidos, criarPedido, editarPedido, excluirPedido, PedidoFormPayload } from '@/services/pedidoService'
import { listarMarcas } from '@/services/marcaService'

export interface Pedido {
  id: string
  marcaId: string
  marcaNome: string
  cliente: string
  pares: number
  valorTotal: number
  condicaoPagamento: string
  comissaoPercentual: number
  valorComissao: number
  anexo?: {
    nome: string
    url: string
  }
  dataCadastro: string
}

// Componente de Card de Resumo
const SummaryCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-3 rounded-lg bg-${color}-50`}>
        <Icon className={`text-${color}-600`} size={24} />
      </div>
    </div>
    <p className="text-sm text-gray-500 mb-1">{title}</p>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
)

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarregamento, setErroCarregamento] = useState('')
  const [mensagem, setMensagem] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [modalNovoPedidoOpen, setModalNovoPedidoOpen] = useState(false)
  const [modalVisualizarOpen, setModalVisualizarOpen] = useState(false)
  const [modalEditarOpen, setModalEditarOpen] = useState(false)
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null)

  // Carrega pedidos e marcas reais do backend ao abrir a página
  useEffect(() => {
    Promise.all([listarPedidos(), listarMarcas()])
      .then(([pedidosData, marcasData]) => {
        setPedidos(pedidosData)
        setMarcas(marcasData)
      })
      .catch(() => setErroCarregamento('Não foi possível carregar os pedidos. Tente recarregar a página.'))
      .finally(() => setCarregando(false))
  }, [])

  function mostrarErro(texto: string) {
    setMensagem(texto)
    setTimeout(() => setMensagem(''), 4000)
  }

  // Cálculos para os cards
  const totalPedidos = pedidos.length
  const totalPares = pedidos.reduce((acc, p) => acc + p.pares, 0)
  const totalVendas = pedidos.reduce((acc, p) => acc + p.valorTotal, 0)
  const totalComissao = pedidos.reduce((acc, p) => acc + p.valorComissao, 0)

  // Funções CRUD
  const handleSavePedido = async (payload: PedidoFormPayload) => {
    const novo = await criarPedido(payload)
    setPedidos(prev => [novo, ...prev])
  }

  const handleEditPedido = (pedido: Pedido) => {
    setPedidoSelecionado(pedido)
    setModalEditarOpen(true)
  }

  const handleUpdatePedido = async (id: string, payload: PedidoFormPayload) => {
    const atualizado = await editarPedido(id, payload)
    setPedidos(prev => prev.map(p => (p.id === id ? atualizado : p)))
  }

  const handleViewPedido = (pedido: Pedido) => {
    setPedidoSelecionado(pedido)
    setModalVisualizarOpen(true)
  }

  const handleDeletePedido = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este pedido?')) return

    try {
      await excluirPedido(id)
      setPedidos(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      mostrarErro(err instanceof Error ? err.message : 'Não foi possível excluir o pedido')
    }
  }

  // Filtragem
  const pedidosFiltrados = pedidos.filter(pedido =>
    pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pedido.marcaNome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (erroCarregamento) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
        <AlertCircle size={20} />
        <span>{erroCarregamento}</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie todos os pedidos realizados
          </p>
        </div>
        <button
          onClick={() => setModalNovoPedidoOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Novo Pedido
        </button>
      </div>

      {/* Mensagem de feedback (erros de excluir, por ex.) */}
      {mensagem && (
        <div className="p-4 rounded-lg flex items-center gap-2 bg-red-50 text-red-700">
          <AlertCircle size={20} />
          <span>{mensagem}</span>
        </div>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total de Pedidos"
          value={totalPedidos}
          icon={Package}
          color="blue"
        />
        <SummaryCard
          title="Total de Pares"
          value={totalPares}
          icon={ShoppingBag}
          color="green"
        />
        <SummaryCard
          title="Valor em Vendas"
          value={totalVendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={DollarSign}
          color="yellow"
        />
        <SummaryCard
          title="Comissão Total"
          value={totalComissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={Percent}
          color="purple"
        />
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por cliente ou marca..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Lista de Pedidos */}
      {pedidosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pedidosFiltrados.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onView={handleViewPedido}
              onEdit={handleEditPedido}
              onDelete={handleDeletePedido}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Package className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {searchTerm ? 'Nenhum pedido encontrado' : 'Nenhum pedido cadastrado'}
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? 'Tente buscar por outro termo'
              : 'Clique em "Novo Pedido" para começar'}
          </p>
        </div>
      )}

      {/* Modais */}
      <NovoPedidoModal
        isOpen={modalNovoPedidoOpen}
        onClose={() => setModalNovoPedidoOpen(false)}
        onSave={handleSavePedido}
        marcas={marcas}
      />

      <EditarPedidoModal
        isOpen={modalEditarOpen}
        onClose={() => {
          setModalEditarOpen(false)
          setPedidoSelecionado(null)
        }}
        onSave={handleUpdatePedido}
        pedido={pedidoSelecionado}
        marcas={marcas}
      />

      <VisualizarPedidoModal
        isOpen={modalVisualizarOpen}
        onClose={() => {
          setModalVisualizarOpen(false)
          setPedidoSelecionado(null)
        }}
        pedido={pedidoSelecionado}
      />
    </div>
  )
}
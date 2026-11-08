'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Package,
  ShoppingBag,
  DollarSign,
  Percent,
  Plus,
  Search,
  AlertCircle,
  LayoutGrid,
  List
} from 'lucide-react'

import { Marca } from '@/components/MarcaCard'
import NovoPedidoModal from '@/components/NovoPedidoModal'
import EditarPedidoModal from '@/components/EditarPedidoModal'
import PedidoCard from '@/components/PedidoCard'
import PedidoTabela from '@/components/Pedidotabela'
import VisualizarPedidoModal from '@/components/VisualizarPedidoModal'
import BotaoOcultarValores from '@/components/BotaoOcultarValores'
import { useOcultarValores, VALOR_OCULTO } from '@/lib/useOcultarValores'
import FiltroPeriodo, { PeriodoSelecionado } from '@/components/Filtroperiodo'
import Paginacao from '@/components/Paginacao'
import { paginacaoRemota } from '@/lib/usePaginacao'
import { listarPedidos, criarPedido, editarPedido, excluirPedido, PedidoFormPayload, ResumoPedidos } from '@/services/pedidoService'
import { listarMarcas } from '@/services/marcaService'

export interface Pedido {
  id: string
  marcaId: string
  marcaNome: string
  cliente: string
  pares: number
  valorTotal: number
  condicaoPagamento: string
  estado: string
  cidade: string
  comissaoPercentual: number
  valorComissao: number
  anexo?: {
    nome: string
    url: string
  }
  dataCadastro: string
  dataCadastroIso: string
}

// Componente de Card de Resumo
const SummaryCard = ({ title, value, icon: Icon, color, oculto = false }: any) => (
  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 min-w-0">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-3 rounded-lg bg-${color}-50`}>
        <Icon className={`text-${color}-600`} size={24} />
      </div>
    </div>
    <p className="text-sm text-gray-500 mb-1">{title}</p>
    <p className="text-xl sm:text-2xl font-bold text-gray-800 wrap-break-word" aria-label={oculto ? 'Valor oculto' : undefined}>
      {oculto ? VALOR_OCULTO : value}
    </p>
  </div>
)

// O que define a consulta à API. Mudar busca ou período volta para a página 1;
// `recarga` força nova requisição da mesma consulta (após criar/editar/excluir).
interface Consulta {
  pagina: number
  busca: string
  inicio?: string
  fim?: string
  recarga: number
}

const RESUMO_VAZIO: ResumoPedidos = { totalPedidos: 0, totalPares: 0, valorTotalVendas: 0, valorTotalComissao: 0 }
const ATRASO_BUSCA_MS = 400

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [carregando, setCarregando] = useState(true)   // primeira carga
  const [atualizando, setAtualizando] = useState(false) // troca de página/filtro mantendo a tela
  const [consulta, setConsulta] = useState<Consulta>({ pagina: 1, busca: '', recarga: 0 })
  const [paginaExibida, setPaginaExibida] = useState(1) // página dos registros que estão na tela
  const [totalItens, setTotalItens] = useState(0)
  const [resumo, setResumo] = useState<ResumoPedidos>(RESUMO_VAZIO)
  const requisicaoAtual = useRef(0) // descarta respostas antigas
  const [erroCarregamento, setErroCarregamento] = useState('')
  const [mensagem, setMensagem] = useState('')
  const { oculto, alternar } = useOcultarValores()

  const [searchTerm, setSearchTerm] = useState('') // texto digitado; vira `consulta.busca` após uma pausa
  const [visualizacao, setVisualizacao] = useState<'cards' | 'lista'>('cards')
  const [modalNovoPedidoOpen, setModalNovoPedidoOpen] = useState(false)
  const [modalVisualizarOpen, setModalVisualizarOpen] = useState(false)
  const [modalEditarOpen, setModalEditarOpen] = useState(false)
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null)

  // Uma requisição por consulta: só a página pedida é buscada na API
  useEffect(() => {
    const id = ++requisicaoAtual.current
    setErroCarregamento('')
    setAtualizando(true)
    listarPedidos({ pagina: consulta.pagina, inicio: consulta.inicio, fim: consulta.fim, busca: consulta.busca })
      .then((resposta) => {
        if (id !== requisicaoAtual.current) return
        // Página sumiu (ex.: excluiu o último pedido da última página): vai para a última existente
        if (resposta.pedidos.length === 0 && resposta.pagina > 1 && resposta.totalPaginas > 0) {
          setConsulta((c) => ({ ...c, pagina: resposta.totalPaginas }))
          return
        }
        setPedidos(resposta.pedidos)
        setPaginaExibida(resposta.pagina)
        setTotalItens(resposta.totalItens)
        setResumo(resposta.resumo)
        setCarregando(false)
        setAtualizando(false)
      })
      .catch(() => {
        if (id !== requisicaoAtual.current) return
        setErroCarregamento('Não foi possível carregar os pedidos. Tente recarregar a página.')
        setCarregando(false)
        setAtualizando(false)
      })
  }, [consulta])

  // Carrega as marcas (usadas nos formulários) ao abrir a página
  useEffect(() => {
    listarMarcas()
      .then(setMarcas)
      .catch(() => mostrarErro('Não foi possível carregar as marcas'))
  }, [])

  // Pesquisa: espera o usuário parar de digitar e volta para a página 1
  useEffect(() => {
    const termo = searchTerm.trim()
    if (termo === consulta.busca) return
    const timer = setTimeout(() => setConsulta((c) => ({ ...c, busca: termo, pagina: 1 })), ATRASO_BUSCA_MS)
    return () => clearTimeout(timer)
  }, [searchTerm, consulta.busca])

  function handlePeriodoChange(periodo: PeriodoSelecionado) {
    setConsulta((c) => ({ ...c, inicio: periodo.inicio, fim: periodo.fim, pagina: 1 }))
  }

  const recarregar = (voltarParaPrimeira = false) =>
    setConsulta((c) => ({ ...c, pagina: voltarParaPrimeira ? 1 : c.pagina, recarga: c.recarga + 1 }))

  function mostrarErro(texto: string) {
    setMensagem(texto)
    setTimeout(() => setMensagem(''), 4000)
  }

  // Totais dos cards: calculados pelo backend sobre todos os pedidos do período
  const { totalPedidos, totalPares, valorTotalVendas: totalVendas, valorTotalComissao: totalComissao } = resumo

  // Funções CRUD
  const handleSavePedido = async (payload: PedidoFormPayload) => {
    await criarPedido(payload)
    recarregar(true) // o novo pedido é o mais recente: aparece na página 1
  }

  const handleEditPedido = (pedido: Pedido) => {
    setPedidoSelecionado(pedido)
    setModalEditarOpen(true)
  }

  const handleUpdatePedido = async (id: string, payload: PedidoFormPayload) => {
    await editarPedido(id, payload)
    recarregar()
  }

  const handleViewPedido = (pedido: Pedido) => {
    setPedidoSelecionado(pedido)
    setModalVisualizarOpen(true)
  }

  const handleDeletePedido = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este pedido?')) return

    try {
      await excluirPedido(id)
      recarregar() // total e páginas são recalculados pelo backend
    } catch (err) {
      mostrarErro(err instanceof Error ? err.message : 'Não foi possível excluir o pedido')
    }
  }

  // Alimenta o componente de paginação existente com os metadados da API
  const paginacao = paginacaoRemota(paginaExibida, totalItens, (pagina) =>
    setConsulta((c) => ({ ...c, pagina }))
  )

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie todos os pedidos realizados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BotaoOcultarValores oculto={oculto} onClick={alternar} />
          <button
            onClick={() => setModalNovoPedidoOpen(true)}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Novo Pedido
          </button>
        </div>
      </div>

      {/* Mensagem de feedback (erros de excluir, por ex.) */}
      {mensagem && (
        <div className="p-4 rounded-lg flex items-center gap-2 bg-red-50 text-red-700">
          <AlertCircle size={20} />
          <span>{mensagem}</span>
        </div>
      )}

      {/* Filtro de período */}
      <FiltroPeriodo onChange={handlePeriodoChange} />

      {erroCarregamento && (
        <div className="p-4 rounded-lg flex items-center gap-2 bg-red-50 text-red-700">
          <AlertCircle size={20} />
          <span>{erroCarregamento}</span>
        </div>
      )}

      {carregando ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !erroCarregamento && (
        <>
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <SummaryCard
              oculto={oculto}
              title="Total de Pedidos"
              value={totalPedidos}
              icon={Package}
              color="blue"
            />
            <SummaryCard
              oculto={oculto}
              title="Total de Pares"
              value={totalPares}
              icon={ShoppingBag}
              color="green"
            />
            <SummaryCard
              oculto={oculto}
              title="Valor em Vendas"
              value={totalVendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              icon={DollarSign}
              color="yellow"
            />
            <SummaryCard
              oculto={oculto}
              title="Comissão Total"
              value={totalComissao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              icon={Percent}
              color="purple"
            />
          </div>

          {/* Busca e alternância de visualização */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por cliente ou marca..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg self-end sm:self-auto">
              <button
                onClick={() => setVisualizacao('cards')}
                className={`p-2 rounded-md transition-colors ${
                  visualizacao === 'cards' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Visualizar em cards"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setVisualizacao('lista')}
                className={`p-2 rounded-md transition-colors ${
                  visualizacao === 'lista' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Visualizar em lista"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Lista de Pedidos */}
          {pedidos.length > 0 ? (
            <div className={`space-y-8 transition-opacity ${atualizando ? 'opacity-60' : ''}`} aria-busy={atualizando}>
              {visualizacao === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {pedidos.map((pedido) => (
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
                <PedidoTabela
                  pedidos={pedidos}
                  onView={handleViewPedido}
                  onEdit={handleEditPedido}
                  onDelete={handleDeletePedido}
                />
              )}
              <Paginacao paginacao={paginacao} rotulo="pedidos" />
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <Package className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {consulta.busca ? 'Nenhum pedido encontrado' : 'Nenhum pedido cadastrado'}
              </h3>
              <p className="text-gray-500">
                {consulta.busca
                  ? 'Tente buscar por outro termo'
                  : 'Clique em "Novo Pedido" para começar'}
              </p>
            </div>
          )}
        </>
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
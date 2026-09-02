'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  ShoppingBag, 
  DollarSign, 
  Percent,
  ArrowUpRight,
  Clock,
  Star,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

import ResumoCard from '@/components/ResumoCard'
import MarcaVendasCard from '@/components/MarcaVendasCard'
import PedidoRecenteCard from '@/components/PedidoRecenteCard'
import { RelatorioGeral, MarcaRelatorio } from '@/types/relatorio'
import { Pedido } from '@/app/(app)/pedidos/page'
import { buscarRelatorio } from '@/services/relatorioService'
import { listarPedidosRecentes } from '@/services/pedidoService'

interface MarcaComVisual {
  name: string
  logo: string
  sales: number
  percentage: number
  color: string
}

const CORES = ['blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'red', 'teal']

function isoHoje(): string {
  return new Date().toISOString().split('T')[0]
}

function isoDiasAtras(dias: number): string {
  const data = new Date()
  data.setDate(data.getDate() - dias)
  return data.toISOString().split('T')[0]
}

// Ordena as marcas por volume, mostra as 4 maiores individualmente e
// agrupa o restante em "Outras" — igual ao design original.
function prepararMarcas(vendasPorMarca: MarcaRelatorio[], totalPedidos: number): MarcaComVisual[] {
  const ordenadas = [...vendasPorMarca].sort((a, b) => b.totalPedidos - a.totalPedidos)
  const principais = ordenadas.slice(0, 4)
  const resto = ordenadas.slice(4)

  const calcularPercentual = (valor: number) =>
    totalPedidos > 0 ? Math.round((valor / totalPedidos) * 100) : 0

  const resultado: MarcaComVisual[] = principais.map((marca, index) => ({
    name: marca.nome,
    logo: marca.nome.charAt(0).toUpperCase(),
    sales: marca.totalPedidos,
    percentage: calcularPercentual(marca.totalPedidos),
    color: CORES[index % CORES.length],
  }))

  if (resto.length > 0) {
    const totalOutras = resto.reduce((acc, m) => acc + m.totalPedidos, 0)
    resultado.push({
      name: 'Outras',
      logo: 'O',
      sales: totalOutras,
      percentage: calcularPercentual(totalOutras),
      color: 'gray',
    })
  }

  return resultado
}

export default function Home() {
  const [dados, setDados] = useState<RelatorioGeral | null>(null)
  const [pedidosRecentes, setPedidosRecentes] = useState<Pedido[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarregamento, setErroCarregamento] = useState('')

  // Dashboard mostra os últimos 30 dias, como o texto da tela já indicava
  useEffect(() => {
    Promise.all([
      buscarRelatorio(isoDiasAtras(30), isoHoje()),
      listarPedidosRecentes(5),
    ])
      .then(([relatorio, recentes]) => {
        setDados(relatorio)
        setPedidosRecentes(recentes)
      })
      .catch(() => setErroCarregamento('Não foi possível carregar o dashboard. Tente recarregar a página.'))
      .finally(() => setCarregando(false))
  }, [])

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const formatNumber = (value: number) => value.toLocaleString('pt-BR')

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (erroCarregamento || !dados) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
        <AlertCircle size={20} />
        <span>{erroCarregamento || 'Não foi possível carregar o dashboard.'}</span>
      </div>
    )
  }

  const summaryData = [
    { title: 'Total de Pedidos', value: formatNumber(dados.totalPedidos), icon: Package, color: 'blue' },
    { title: 'Total de Pares', value: formatNumber(dados.totalPares), icon: ShoppingBag, color: 'green' },
    { title: 'Valor em Vendas', value: formatCurrency(dados.valorTotalVendas), icon: DollarSign, color: 'yellow' },
    { title: 'Comissão Total', value: formatCurrency(dados.valorTotalComissao), icon: Percent, color: 'purple' },
  ]

  const brandsData = prepararMarcas(dados.vendasPorMarca, dados.totalPedidos)

  const recentOrders = pedidosRecentes.map(pedido => ({
    id: pedido.id.slice(-6).toUpperCase(),
    date: pedido.dataCadastro,
    items: pedido.pares,
    value: formatCurrency(pedido.valorTotal),
  }))

  return (
    <div className="space-y-8">
      {/* Cabeçalho da página */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Visão geral do seu desempenho e atividades recentes
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryData.map((item, index) => (
          <ResumoCard key={index} {...item} />
        ))}
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendas por Marca */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Vendas por Marca</h2>
              <p className="text-sm text-gray-500">Distribuição de vendas nos últimos 30 dias</p>
            </div>
            <Link 
              href="/marcas" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Ver todas
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {brandsData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Nenhuma venda nos últimos 30 dias.
            </p>
          ) : (
            <>
              {/* Gráfico simples de barras (visual) */}
              <div className="mb-6">
                <div className="flex items-end h-32 gap-2">
                  {brandsData.map((brand, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className={`w-full bg-${brand.color}-500 rounded-t-lg`}
                        style={{ height: `${Math.max(brand.percentage, 4) * 1.5}px` }}
                      />
                      <span className="text-xs font-medium text-gray-600">{brand.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lista de marcas */}
              <div className="space-y-3">
                {brandsData.map((brand, index) => (
                  <MarcaVendasCard key={index} {...brand} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar direita - Informações rápidas */}
        <div className="space-y-6">
          {/* Pedidos Recentes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="text-gray-400" size={20} />
                <h2 className="text-lg font-semibold text-gray-800">Pedidos Recentes</h2>
              </div>
              <Link 
                href="/pedidos" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todos
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                Nenhum pedido cadastrado ainda.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order, index) => (
                  <PedidoRecenteCard key={index} order={order} />
                ))}
              </div>
            )}
          </div>

          {/* Top Marcas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="text-yellow-400" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Ranking Marcas</h2>
            </div>

            {brandsData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                Sem dados suficientes ainda.
              </p>
            ) : (
              <div className="space-y-4">
                {brandsData.slice(0, 3).map((brand, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-${brand.color}-100 flex items-center justify-center text-${brand.color}-600 font-bold`}>
                      {brand.logo}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-800">{brand.name}</span>
                        <span className="text-sm text-gray-600">{brand.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-${brand.color}-500 h-2 rounded-full`}
                          style={{ width: `${brand.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link 
              href="/marcas" 
              className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
            >
              Gerenciar marcas
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
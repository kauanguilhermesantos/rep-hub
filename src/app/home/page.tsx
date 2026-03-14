'use client'

import { 
  Package, 
  ShoppingBag, 
  DollarSign, 
  Percent,
  ArrowUpRight,
  Clock,
  TrendingUp,
  Star
} from 'lucide-react'
import Link from 'next/link'

import ResumoCard from '@/components/ResumoCard'
import MarcaCard from '@/components/MarcaCard'
import PedidoRecenteCard from '@/components/PedidoRecenteCard'

export default function Home() {
  // Dados mockados para exemplo
  const summaryData = [
    { title: 'Total de Pedidos', value: '156', icon: Package, color: 'blue', },
    { title: 'Total de Pares', value: '342', icon: ShoppingBag, color: 'green', },
    { title: 'Valor em Vendas', value: 'R$ 45.678,90', icon: DollarSign, color: 'yellow', },
    { title: 'Comissão Total', value: 'R$ 6.851,84', icon: Percent, color: 'purple', },
  ]

  const brandsData = [
    { name: 'Nike', logo: 'N', sales: 45, percentage: 32, color: 'blue' },
    { name: 'Adidas', logo: 'A', sales: 38, percentage: 27, color: 'green' },
    { name: 'Puma', logo: 'P', sales: 28, percentage: 20, color: 'yellow' },
    { name: 'Vans', logo: 'V', sales: 22, percentage: 16, color: 'purple' },
    { name: 'Outras', logo: 'O', sales: 23, percentage: 5, color: 'gray' },
  ]

  const recentOrders = [
    { id: '1234', date: '12 Mar 2026', items: 3, value: 'R$ 1.234,56' },
    { id: '1235', date: '11 Mar 2026', items: 2, value: 'R$ 890,00' },
    { id: '1236', date: '10 Mar 2026', items: 5, value: 'R$ 2.567,80' },
    { id: '1237', date: '09 Mar 2026', items: 1, value: 'R$ 299,90' },
    { id: '1238', date: '08 Mar 2026', items: 4, value: 'R$ 1.890,45' },
  ]

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-28">
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

          {/* Gráfico simples de barras (visual) */}
          <div className="mb-6">
            <div className="flex items-end h-32 gap-2">
              {brandsData.map((brand, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className={`w-full bg-${brand.color}-500 rounded-t-lg`}
                    style={{ height: `${brand.percentage * 1.5}px` }}
                  />
                  <span className="text-xs font-medium text-gray-600">{brand.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de marcas */}
          <div className="space-y-3">
            {brandsData.map((brand, index) => (
              <MarcaCard key={index} {...brand} />
            ))}
          </div>
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

            <div className="divide-y divide-gray-100">
              {recentOrders.map((order, index) => (
                <PedidoRecenteCard key={index} order={order} />
              ))}
            </div>
          </div>

          {/* Top Marcas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="text-yellow-400" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Ranking Marcas</h2>
            </div>

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
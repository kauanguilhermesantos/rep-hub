'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  ShoppingBag, 
  DollarSign, 
  Percent,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { RelatorioGeral, MarcaRelatorio, DadosGrafico } from '@/types/relatorio'
import GraficoPizza from '@/components/GraficoPizza'
import TabelaRelatorioMarcas from '@/components/TabelaRelatorioMarcas'

// Componente de Card de Resumo
const SummaryCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-3 rounded-lg bg-${color}-50`}>
        <Icon className={`text-${color}-600`} size={24} />
      </div>
      {trend && (
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
          +{trend}%
        </span>
      )}
    </div>
    <p className="text-sm text-gray-500 mb-1">{title}</p>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
)

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState('30')
  const [marcaSelecionada, setMarcaSelecionada] = useState('todas')
  
  // Dados mockados
  const [dados, setDados] = useState<RelatorioGeral>({
    totalPedidos: 156,
    totalPares: 342,
    valorTotalVendas: 45678.90,
    valorTotalComissao: 6851.84,
    vendasPorMarca: [
      { id: '1', nome: 'Nike', totalPedidos: 45, totalPares: 98, valorTotalVendas: 15678.50, valorTotalComissao: 2351.78 },
      { id: '2', nome: 'Adidas', totalPedidos: 38, totalPares: 84, valorTotalVendas: 12345.60, valorTotalComissao: 1851.84 },
      { id: '3', nome: 'Puma', totalPedidos: 28, totalPares: 62, valorTotalVendas: 9876.40, valorTotalComissao: 1481.46 },
      { id: '4', nome: 'Vans', totalPedidos: 22, totalPares: 48, valorTotalVendas: 5678.90, valorTotalComissao: 851.84 },
      { id: '5', nome: 'Oakley', totalPedidos: 15, totalPares: 32, valorTotalVendas: 3456.70, valorTotalComissao: 518.51 },
      { id: '6', nome: 'New Balance', totalPedidos: 8, totalPares: 18, valorTotalVendas: 2345.80, valorTotalComissao: 351.87 }
    ]
  })

  // Preparar dados para os gráficos
  const cores = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#14B8A6', '#F97316']
  
  const dadosGraficoPares: DadosGrafico[] = dados.vendasPorMarca.map((marca, index) => ({
    name: marca.nome,
    value: marca.totalPares,
    color: cores[index % cores.length]
  }))

  const dadosGraficoPedidos: DadosGrafico[] = dados.vendasPorMarca.map((marca, index) => ({
    name: marca.nome,
    value: marca.totalPedidos,
    color: cores[index % cores.length]
  }))

  const dadosGraficoComissao: DadosGrafico[] = dados.vendasPorMarca.map((marca, index) => ({
    name: marca.nome,
    value: marca.valorTotalComissao,
    color: cores[index % cores.length]
  }))

  // Formatação de valores
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const formatNumber = (value: number) => {
    return value.toLocaleString('pt-BR')
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
          <p className="text-gray-600 mt-1">
            Análise detalhada do seu desempenho de vendas
          </p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total de Pedidos" 
          value={formatNumber(dados.totalPedidos)} 
          icon={Package} 
          color="blue" 
        />
        <SummaryCard 
          title="Total de Pares" 
          value={formatNumber(dados.totalPares)} 
          icon={ShoppingBag} 
          color="green" 
        />
        <SummaryCard 
          title="Valor em Vendas" 
          value={formatCurrency(dados.valorTotalVendas)} 
          icon={DollarSign} 
          color="yellow" 
        />
        <SummaryCard 
          title="Comissão Total" 
          value={formatCurrency(dados.valorTotalComissao)} 
          icon={Percent} 
          color="purple" 
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GraficoPizza 
          dados={dadosGraficoPares} 
          titulo="Pares por Marca" 
          valorFormatado={(value) => `${value} pares`}
        />
        <GraficoPizza 
          dados={dadosGraficoPedidos} 
          titulo="Pedidos por Marca"
          valorFormatado={(value) => `${value} pedidos`}
        />
        <GraficoPizza 
          dados={dadosGraficoComissao} 
          titulo="Comissões por Marca"
          valorFormatado={(value) => formatCurrency(value)}
        />
      </div>

      {/* Tabela de Detalhamento */}
      <TabelaRelatorioMarcas 
        marcas={dados.vendasPorMarca}
        marcaSelecionada={marcaSelecionada}
        onMarcaChange={setMarcaSelecionada}
      />
    </div>
  )
}
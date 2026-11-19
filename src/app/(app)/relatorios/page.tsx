'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  ShoppingBag, 
  DollarSign, 
  Percent,
  AlertCircle
} from 'lucide-react'
import { RelatorioGeral, DadosGrafico } from '@/types/relatorio'
import ResumoCard from "@/components/ResumoCard"
import GraficoPizza from '@/components/GraficoPizza'
import TabelaRelatorioMarcas from '@/components/TabelaRelatorioMarcas'
import BotaoOcultarValores from '@/components/BotaoOcultarValores'
import { useOcultarValores } from '@/lib/useOcultarValores'
import FiltroPeriodo, { PeriodoSelecionado } from '@/components/Filtroperiodo'
import { buscarRelatorio } from '@/services/relatorioService'

export default function RelatoriosPage() {
  const [marcaSelecionada, setMarcaSelecionada] = useState('todas')
  const { oculto, alternar } = useOcultarValores()

  const [dados, setDados] = useState<RelatorioGeral | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erroCarregamento, setErroCarregamento] = useState('')

  function carregarRelatorio(inicio?: string, fim?: string) {
    setCarregando(true)
    setErroCarregamento('')
    buscarRelatorio(inicio, fim)
      .then(setDados)
      .catch(() => setErroCarregamento('Não foi possível carregar o relatório. Tente recarregar a página.'))
      .finally(() => setCarregando(false))
  }

  // Carrega o relatório completo (sem filtro) ao abrir a página
  useEffect(() => {
    carregarRelatorio()
  }, [])

  function handlePeriodoChange(periodo: PeriodoSelecionado) {
    carregarRelatorio(periodo.inicio, periodo.fim)
  }

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

  // Preparar dados para os gráficos (mesmo durante o carregamento, evita remount do filtro)
  const cores = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#14B8A6', '#F97316']

  const dadosGraficoPares: DadosGrafico[] = (dados?.vendasPorMarca ?? []).map((marca, index) => ({
    name: marca.nome,
    value: marca.totalPares,
    color: cores[index % cores.length]
  }))

  const dadosGraficoPedidos: DadosGrafico[] = (dados?.vendasPorMarca ?? []).map((marca, index) => ({
    name: marca.nome,
    value: marca.totalPedidos,
    color: cores[index % cores.length]
  }))

  const dadosGraficoComissao: DadosGrafico[] = (dados?.vendasPorMarca ?? []).map((marca, index) => ({
    name: marca.nome,
    value: marca.valorTotalComissao,
    color: cores[index % cores.length]
  }))

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
        <BotaoOcultarValores oculto={oculto} onClick={alternar} />
      </div>

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
      ) : dados && (
        <>
          {/* Cards de Resumo */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6">
            <ResumoCard
              oculto={oculto}
              title="Total de Pedidos" 
              value={formatNumber(dados.totalPedidos)} 
              icon={Package} 
              color="blue" 
            />
            <ResumoCard
              oculto={oculto}
              title="Total de Pares" 
              value={formatNumber(dados.totalPares)} 
              icon={ShoppingBag} 
              color="green" 
            />
            <ResumoCard
              oculto={oculto}
              title="Valor em Vendas" 
              value={formatCurrency(dados.valorTotalVendas)} 
              icon={DollarSign} 
              color="yellow" 
            />
            <ResumoCard
              oculto={oculto}
              title="Comissão Total" 
              value={formatCurrency(dados.valorTotalComissao)} 
              icon={Percent} 
              color="purple" 
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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
        </>
      )}
    </div>
  )
}
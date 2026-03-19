// components/TabelaRelatorioMarcas.tsx
'use client'

import { useState } from 'react'
import { MarcaRelatorio } from '@/types/relatorio'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'

interface TabelaRelatorioMarcasProps {
  marcas: MarcaRelatorio[]
  marcaSelecionada: string
  onMarcaChange: (marca: string) => void
}

export default function TabelaRelatorioMarcas({ 
  marcas, 
  marcaSelecionada, 
  onMarcaChange 
}: TabelaRelatorioMarcasProps) {
  const [ordenacao, setOrdenacao] = useState<{
    coluna: keyof MarcaRelatorio | null
    direcao: 'asc' | 'desc'
  }>({ coluna: null, direcao: 'asc' })

  // Formatar valor para moeda
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  // Filtrar marcas baseado na seleção
  const marcasFiltradas = marcaSelecionada === 'todas' 
    ? marcas 
    : marcas.filter(m => m.nome === marcaSelecionada)

  // Ordenar marcas
  const marcasOrdenadas = [...marcasFiltradas].sort((a, b) => {
    if (!ordenacao.coluna) return 0
    
    const aValor = a[ordenacao.coluna]
    const bValor = b[ordenacao.coluna]
    
    if (typeof aValor === 'number' && typeof bValor === 'number') {
      return ordenacao.direcao === 'asc' ? aValor - bValor : bValor - aValor
    }
    
    if (typeof aValor === 'string' && typeof bValor === 'string') {
      return ordenacao.direcao === 'asc' 
        ? aValor.localeCompare(bValor)
        : bValor.localeCompare(aValor)
    }
    
    return 0
  })

  // Calcular totais
  const totais = marcasFiltradas.reduce(
    (acc, marca) => ({
      totalPedidos: acc.totalPedidos + marca.totalPedidos,
      totalPares: acc.totalPares + marca.totalPares,
      valorTotalVendas: acc.valorTotalVendas + marca.valorTotalVendas,
      valorTotalComissao: acc.valorTotalComissao + marca.valorTotalComissao
    }),
    { totalPedidos: 0, totalPares: 0, valorTotalVendas: 0, valorTotalComissao: 0 }
  )

  const handleOrdenar = (coluna: keyof MarcaRelatorio) => {
    setOrdenacao({
      coluna,
      direcao: ordenacao.coluna === coluna && ordenacao.direcao === 'asc' ? 'desc' : 'asc'
    })
  }

  const renderSetaOrdenacao = (coluna: keyof MarcaRelatorio) => {
    if (ordenacao.coluna !== coluna) return null
    return ordenacao.direcao === 'asc' 
      ? <ChevronUp size={16} className="inline ml-1" />
      : <ChevronDown size={16} className="inline ml-1" />
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Detalhamento por Marca</h3>
        
        {/* Filtro por marca */}
        <select
          value={marcaSelecionada}
          onChange={(e) => onMarcaChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          <option value="todas">Todas as marcas</option>
          {marcas.map(marca => (
            <option key={marca.id} value={marca.nome}>{marca.nome}</option>
          ))}
        </select>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th 
                className="text-left py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => handleOrdenar('nome')}
              >
                Marca {renderSetaOrdenacao('nome')}
              </th>
              <th 
                className="text-right py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => handleOrdenar('totalPedidos')}
              >
                Pedidos {renderSetaOrdenacao('totalPedidos')}
              </th>
              <th 
                className="text-right py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => handleOrdenar('totalPares')}
              >
                Pares {renderSetaOrdenacao('totalPares')}
              </th>
              <th 
                className="text-right py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => handleOrdenar('valorTotalVendas')}
              >
                Valor Vendas {renderSetaOrdenacao('valorTotalVendas')}
              </th>
              <th 
                className="text-right py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => handleOrdenar('valorTotalComissao')}
              >
                Comissão {renderSetaOrdenacao('valorTotalComissao')}
              </th>
            </tr>
          </thead>
          <tbody>
            {marcasOrdenadas.map((marca, index) => (
              <tr 
                key={marca.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <td className="py-3 px-4 font-medium text-gray-800">{marca.nome}</td>
                <td className="py-3 px-4 text-right text-gray-600">{marca.totalPedidos}</td>
                <td className="py-3 px-4 text-right text-gray-600">{marca.totalPares}</td>
                <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(marca.valorTotalVendas)}</td>
                <td className="py-3 px-4 text-right text-green-600 font-medium">{formatCurrency(marca.valorTotalComissao)}</td>
              </tr>
            ))}
          </tbody>
          
          {/* Linha de totais */}
          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td className="py-4 px-4 text-gray-800">Total</td>
              <td className="py-4 px-4 text-right text-gray-800">{totais.totalPedidos}</td>
              <td className="py-4 px-4 text-right text-gray-800">{totais.totalPares}</td>
              <td className="py-4 px-4 text-right text-gray-800">{formatCurrency(totais.valorTotalVendas)}</td>
              <td className="py-4 px-4 text-right text-green-700">{formatCurrency(totais.valorTotalComissao)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Informação de registros */}
      <p className="text-sm text-gray-500 mt-4">
        Mostrando {marcasOrdenadas.length} de {marcas.length} marcas
      </p>
    </div>
  )
}
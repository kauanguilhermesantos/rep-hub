'use client'

import { DadosGrafico } from '@/types/relatorio'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface GraficoPizzaProps {
  dados: DadosGrafico[]
  titulo: string
  valorFormatado?: (value: number) => string
}

export default function GraficoPizza({ dados, titulo, valorFormatado }: GraficoPizzaProps) {
  // Se não houver dados ou todos os valores forem zero
  const hasData = dados.some(item => item.value > 0)

  if (!hasData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{titulo}</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400">Sem dados disponíveis</p>
        </div>
      </div>
    )
  }

  const formatTooltip = (value: any, name: any, item: any) => {
    if (!value) return value
    if (valorFormatado) {
      return valorFormatado(value)
    }
    return value
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{titulo}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dados}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {dados.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
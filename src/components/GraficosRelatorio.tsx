'use client'

import { ReactNode, useMemo } from 'react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  MarcaDesempenho, MarcaMensal, PontoMensal, PontoViagemMensal, TotalCategoriaDashboard,
} from '@/types/relatorio'
import { formatarMoeda } from '@/lib/formatoMoeda'
import { VALOR_OCULTO } from '@/lib/useOcultarValores'

const CORES = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#9CA3AF']
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function rotuloMes(mes: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(mes)
  if (!m) return mes === 'sem-data' ? 'Sem data' : mes
  return `${MESES[Number(m[2]) - 1]}/${m[1].slice(2)}`
}

interface PropsBase { oculto?: boolean }

function Cartao({ titulo, subtitulo, children, vazio }: { titulo: string; subtitulo?: string; children: ReactNode; vazio: boolean }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 min-w-0">
      <h3 className="text-lg font-semibold text-gray-800">{titulo}</h3>
      {subtitulo && <p className="text-sm text-gray-500 mb-3">{subtitulo}</p>}
      <div className="h-72 mt-2">
        {vazio ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">Sem dados no período</div>
        ) : children}
      </div>
    </div>
  )
}

const estiloTooltip = { backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px' }
const moeda = (oculto?: boolean) => (v: unknown) => (oculto ? VALOR_OCULTO : formatarMoeda(Number(v)))
const eixoMoeda = (v: number) =>
  v >= 1000 ? `${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil` : String(v)

export function GraficoVendasMensal({ dados, oculto }: PropsBase & { dados: PontoMensal[] }) {
  return (
    <Cartao titulo="Evolução das vendas" subtitulo="Valor vendido por mês" vazio={dados.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dados} margin={{ left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="mes" tickFormatter={rotuloMes} tick={{ fontSize: 12 }} />
          <YAxis hide={oculto} tickFormatter={eixoMoeda} tick={{ fontSize: 12 }} width={56} />
          <Tooltip formatter={moeda(oculto)} labelFormatter={(l) => rotuloMes(String(l))} contentStyle={estiloTooltip} />
          <Legend />
          <Area type="monotone" dataKey="vendas" name="Vendas" stroke="#3B82F6" fill="#DBEAFE" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </Cartao>
  )
}

export function GraficoMarcas({ dados, oculto }: PropsBase & { dados: MarcaDesempenho[] }) {
  const topo = dados.slice(0, 8)
  return (
    <Cartao titulo="Comparação entre marcas" subtitulo="Vendas e comissão por marca" vazio={topo.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={topo} layout="vertical" margin={{ left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis type="number" hide={oculto} tickFormatter={eixoMoeda} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="marcaNome" width={90} tick={{ fontSize: 12 }} />
          <Tooltip formatter={moeda(oculto)} contentStyle={estiloTooltip} />
          <Legend />
          <Bar dataKey="vendas" name="Vendas" fill="#3B82F6" radius={[0, 4, 4, 0]} />
          <Bar dataKey="comissao" name="Comissão" fill="#10B981" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Cartao>
  )
}

// Só formata para exibição: 5 marcas com mais vendas em linhas próprias, o restante agrupado em "Outras"
export function GraficoMarcasMensal({ dados, marcas, oculto }: PropsBase & { dados: MarcaMensal[]; marcas: MarcaDesempenho[] }) {
  const { linhas, series } = useMemo(() => {
    const principais = marcas.slice(0, 5).map((m) => m.marcaId)
    const nomes = new Map(marcas.map((m) => [m.marcaId, m.marcaNome]))
    const porMes = new Map<string, Record<string, number | string>>()
    for (const d of dados) {
      const chave = principais.includes(d.marcaId) ? (nomes.get(d.marcaId) ?? d.marcaNome) : 'Outras'
      const linha = porMes.get(d.mes) ?? { mes: d.mes }
      linha[chave] = Number(linha[chave] ?? 0) + d.vendas
      porMes.set(d.mes, linha)
    }
    const nomesSeries = principais.map((id) => nomes.get(id) ?? id)
    if (marcas.length > 5) nomesSeries.push('Outras')
    return { linhas: [...porMes.values()].sort((a, b) => String(a.mes).localeCompare(String(b.mes))), series: nomesSeries }
  }, [dados, marcas])

  return (
    <Cartao titulo="Evolução mensal por marca" subtitulo="Vendas por mês de cada marca" vazio={linhas.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={linhas} margin={{ left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="mes" tickFormatter={rotuloMes} tick={{ fontSize: 12 }} />
          <YAxis hide={oculto} tickFormatter={eixoMoeda} tick={{ fontSize: 12 }} width={56} />
          <Tooltip formatter={moeda(oculto)} labelFormatter={(l) => rotuloMes(String(l))} contentStyle={estiloTooltip} />
          <Legend />
          {series.map((nome, i) => (
            <Line key={nome} type="monotone" dataKey={nome} name={nome} stroke={CORES[i % CORES.length]}
              strokeWidth={2} dot={{ r: 3 }} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Cartao>
  )
}

export function GraficoViagensMensal({ dados, oculto }: PropsBase & { dados: PontoViagemMensal[] }) {
  return (
    <Cartao titulo="Vendas, despesas e resultado" subtitulo="Por mês de início das viagens" vazio={dados.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={dados} margin={{ left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="mes" tickFormatter={rotuloMes} tick={{ fontSize: 12 }} />
          <YAxis hide={oculto} tickFormatter={eixoMoeda} tick={{ fontSize: 12 }} width={56} />
          <Tooltip formatter={moeda(oculto)} labelFormatter={(l) => rotuloMes(String(l))} contentStyle={estiloTooltip} />
          <Legend />
          <Bar dataKey="vendas" name="Vendas" fill="#10B981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="despesas" name="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="resultado" name="Resultado" stroke="#1F2937" strokeWidth={2} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </Cartao>
  )
}

export function GraficoDespesasCategoria({ dados, oculto }: PropsBase & { dados: TotalCategoriaDashboard[] }) {
  return (
    <Cartao titulo="Despesas por categoria" subtitulo="Despesas das viagens do filtro" vazio={dados.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} layout="vertical" margin={{ left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis type="number" hide={oculto} tickFormatter={eixoMoeda} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="categoriaNome" width={100} tick={{ fontSize: 12 }} />
          <Tooltip formatter={moeda(oculto)} contentStyle={estiloTooltip} />
          <Legend />
          <Bar dataKey="total" name="Despesas" fill="#F59E0B" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Cartao>
  )
}
'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'

export interface PeriodoSelecionado {
  inicio?: string
  fim?: string
}

interface FiltroPeriodoProps {
  onChange: (periodo: PeriodoSelecionado) => void
}

function formatarISO(data: Date): string {
  return data.toISOString().split('T')[0]
}

function diasAtras(dias: number): string {
  const data = new Date()
  data.setDate(data.getDate() - dias)
  return formatarISO(data)
}

function inicioDoMes(): string {
  const data = new Date()
  return formatarISO(new Date(data.getFullYear(), data.getMonth(), 1))
}

function inicioDoAno(): string {
  const data = new Date()
  return formatarISO(new Date(data.getFullYear(), 0, 1))
}

const PRESETS: { label: string; inicio: () => string | undefined }[] = [
  { label: 'Últimos 7 dias', inicio: () => diasAtras(7) },
  { label: 'Últimos 30 dias', inicio: () => diasAtras(30) },
  { label: 'Últimos 90 dias', inicio: () => diasAtras(90) },
  { label: 'Este mês', inicio: () => inicioDoMes() },
  { label: 'Este ano', inicio: () => inicioDoAno() },
  { label: 'Tudo', inicio: () => undefined },
]

export default function FiltroPeriodo({ onChange }: FiltroPeriodoProps) {
  const [presetAtivo, setPresetAtivo] = useState('Tudo')
  const [dataInicioCustom, setDataInicioCustom] = useState('')
  const [dataFimCustom, setDataFimCustom] = useState('')

  function selecionarPreset(preset: (typeof PRESETS)[number]) {
    setPresetAtivo(preset.label)
    setDataInicioCustom('')
    setDataFimCustom('')

    const inicio = preset.inicio()
    onChange({ inicio, fim: inicio ? formatarISO(new Date()) : undefined })
  }

  function aplicarCustom() {
    if (!dataInicioCustom || !dataFimCustom) return
    setPresetAtivo('')
    onChange({ inicio: dataInicioCustom, fim: dataFimCustom })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex items-center gap-2 text-gray-500 text-sm shrink-0">
        <Calendar size={18} />
        <span>Período</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(preset => (
          <button
            key={preset.label}
            onClick={() => selecionarPreset(preset)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              presetAtivo === preset.label
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 lg:ml-auto">
        <input
          type="date"
          value={dataInicioCustom}
          onChange={(e) => setDataInicioCustom(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <span className="text-gray-400 text-sm">até</span>
        <input
          type="date"
          value={dataFimCustom}
          onChange={(e) => setDataFimCustom(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <button
          onClick={aplicarCustom}
          disabled={!dataInicioCustom || !dataFimCustom}
          className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}
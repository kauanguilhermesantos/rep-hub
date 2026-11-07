'use client'

import { FilterX } from 'lucide-react'
import { FiltrosDashboard, StatusViagemFiltro } from '@/types/relatorio'
import { hojeIso } from '@/lib/formatoHora'

interface FiltrosRelatorioProps {
  filtros: FiltrosDashboard
  marcas: { id: string; nome: string }[]
  onChange: (filtros: FiltrosDashboard) => void
  onLimpar: () => void
}

export function periodoValido(f: FiltrosDashboard): boolean {
  return !(f.inicio && f.fim && f.inicio > f.fim)
}

const campo =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'

export default function FiltrosRelatorio({ filtros, marcas, onChange, onLimpar }: FiltrosRelatorioProps) {
  const temFiltro = !!(filtros.inicio || filtros.fim || filtros.marcaId || filtros.status)
  const invalido = !periodoValido(filtros)

  const set = (parcial: Partial<FiltrosDashboard>) => onChange({ ...filtros, ...parcial })

  return (
    <section aria-label="Filtros do relatório" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label htmlFor="rel-inicio" className="block text-xs font-medium text-gray-500 mb-1">Período inicial</label>
          <input id="rel-inicio" type="date" value={filtros.inicio ?? ''} max={hojeIso()}
            onChange={(e) => set({ inicio: e.target.value || undefined })} className={campo} />
        </div>
        <div>
          <label htmlFor="rel-fim" className="block text-xs font-medium text-gray-500 mb-1">Período final</label>
          <input id="rel-fim" type="date" value={filtros.fim ?? ''} max={hojeIso()}
            onChange={(e) => set({ fim: e.target.value || undefined })} className={campo} />
        </div>
        <div>
          <label htmlFor="rel-marca" className="block text-xs font-medium text-gray-500 mb-1">Marca</label>
          <select id="rel-marca" value={filtros.marcaId ?? ''}
            onChange={(e) => set({ marcaId: e.target.value || undefined })} className={campo}>
            <option value="">Todas as marcas</option>
            {marcas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="rel-status" className="block text-xs font-medium text-gray-500 mb-1">Status da viagem</label>
          <select id="rel-status" value={filtros.status ?? ''}
            onChange={(e) => set({ status: (e.target.value || undefined) as StatusViagemFiltro | undefined })} className={campo}>
            <option value="">Todos</option>
            <option value="EM_ANDAMENTO">Em andamento</option>
            <option value="FINALIZADA">Finalizadas</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        {invalido && (
          <p role="alert" className="text-xs text-red-600">A data inicial não pode ser posterior à data final.</p>
        )}
        <button type="button" onClick={onLimpar} disabled={!temFiltro}
          className="sm:ml-auto flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <FilterX size={16} aria-hidden="true" /> Limpar filtros
        </button>
      </div>
    </section>
  )
}
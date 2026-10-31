import Link from 'next/link'
import { CalendarDays, Pencil, CalendarCheck, MapPin, ShoppingBag, Wallet } from 'lucide-react'
import StatusViagemBadge from '@/components/StatusViagemBadge'
import { Viagem } from '@/services/viagensService'
import { formatarDataHora, formatarDataIso } from '@/lib/formatoHora'
import { formatarMoeda } from '@/lib/formatoMoeda'
import { VALOR_OCULTO } from '@/lib/useOcultarValores'

interface ViagemCardProps {
  viagem: Viagem
  ocultarValores?: boolean
}

export default function ViagemCard({ viagem, ocultarValores = false }: ViagemCardProps) {
  const roteiro = viagem.roteiro ?? []
  const finalizada = viagem.status === 'FINALIZADA'

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 min-w-0 flex flex-col gap-4">
      <header className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-800 wrap-break-word min-w-0">{viagem.titulo}</h2>
        <StatusViagemBadge status={viagem.status} />
      </header>

      {roteiro.length > 0 && (
        <p className="flex items-start gap-2 text-sm text-gray-600 min-w-0">
          <MapPin size={16} className="shrink-0 mt-0.5 text-gray-400" aria-hidden="true" />
          <span className="wrap-break-word min-w-0">
            <span className="sr-only">Roteiro: </span>
            {roteiro.join(' → ')}
          </span>
        </p>
      )}

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarDays size={16} className="shrink-0 text-gray-400" aria-hidden="true" />
          <div className="min-w-0">
            <dt className="text-gray-500">Início</dt>
            <dd className="font-medium text-gray-800">{formatarDataIso(viagem.dataInicio)}</dd>
          </div>
        </div>

        {finalizada && (
          <div className="flex items-center gap-2 min-w-0">
            <CalendarCheck size={16} className="shrink-0 text-gray-400" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="text-gray-500">Finalizada em</dt>
              <dd className="font-medium text-gray-800">{formatarDataHora(viagem.dataFinalizacao ?? undefined)}</dd>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <Wallet size={16} className="shrink-0 text-gray-400" aria-hidden="true" />
          <div className="min-w-0">
            <dt className="text-gray-500">Total de despesas</dt>
            <dd
              className="font-medium text-gray-800 wrap-break-word"
              aria-label={ocultarValores ? 'Valor oculto' : undefined}
            >
              {ocultarValores ? VALOR_OCULTO : formatarMoeda(viagem.totalDespesas ?? 0)}
            </dd>
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <ShoppingBag size={16} className="shrink-0 text-gray-400" aria-hidden="true" />
          <div className="min-w-0">
            <dt className="text-gray-500">Pedidos associados</dt>
            <dd className="font-medium text-gray-800">{viagem.quantidadePedidos ?? 0}</dd>
          </div>
        </div>
      </dl>

      <footer className="pt-3 border-t border-gray-100 flex flex-wrap gap-2">
        <Link
          href={`/viagens/${viagem.id}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ver detalhes<span className="sr-only"> de {viagem.titulo}</span>
        </Link>
        <Link
          href={`/viagens/${viagem.id}/editar`}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Pencil size={14} aria-hidden="true" />
          Editar<span className="sr-only"> {viagem.titulo}</span>
        </Link>
      </footer>
    </article>
  )
}

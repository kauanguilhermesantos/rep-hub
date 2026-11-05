'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Paginacao as PaginacaoState } from '@/lib/usePaginacao'

interface PaginacaoProps {
  paginacao: Pick<
    PaginacaoState<unknown>,
    'pagina' | 'totalPaginas' | 'totalItens' | 'inicio' | 'fim' | 'irParaPagina' | 'anterior' | 'proxima'
  >
  /** Nome no plural usado no resumo, ex.: "pedidos" */
  rotulo: string
}

// Números de página a exibir (com reticências), ex.: 1 … 4 5 6 … 12
function paginasVisiveis(atual: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const paginas = new Set([1, total, atual, atual - 1, atual + 1])
  const ordenadas = [...paginas].filter(p => p >= 1 && p <= total).sort((a, b) => a - b)
  const resultado: (number | '…')[] = []
  ordenadas.forEach((p, i) => {
    if (i > 0 && p - ordenadas[i - 1] > 1) resultado.push('…')
    resultado.push(p)
  })
  return resultado
}

const botaoBase =
  'inline-flex items-center justify-center h-9 min-w-9 px-2 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500'

// Não renderiza nada quando há uma única página (ou nenhum registro)
export default function Paginacao({ paginacao, rotulo }: PaginacaoProps) {
  const { pagina, totalPaginas, totalItens, inicio, fim, irParaPagina, anterior, proxima } = paginacao
  if (totalPaginas <= 1) return null

  return (
    <nav
      aria-label={`Paginação de ${rotulo}`}
      className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3"
    >
      <p className="text-sm text-gray-500 text-center sm:text-left" role="status" aria-live="polite">
        Mostrando <span className="font-medium text-gray-700">{inicio}–{fim}</span> de{' '}
        <span className="font-medium text-gray-700">{totalItens}</span> {rotulo}
        <span className="hidden sm:inline"> · Página {pagina} de {totalPaginas}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={anterior}
          disabled={pagina <= 1}
          aria-label="Página anterior"
          className={`${botaoBase} gap-1 bg-white border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white`}
        >
          <ChevronLeft size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Telas pequenas: indicador compacto */}
        <span className="sm:hidden px-3 text-sm text-gray-600" aria-current="page">
          Página <span className="font-medium text-gray-800">{pagina}</span> de {totalPaginas}
        </span>

        {/* Telas maiores: números de página */}
        <ul className="hidden sm:flex items-center gap-1">
          {paginasVisiveis(pagina, totalPaginas).map((p, i) =>
            p === '…' ? (
              <li key={`reticencias-${i}`} className="px-1 text-gray-400" aria-hidden="true">…</li>
            ) : (
              <li key={p}>
                <button
                  type="button"
                  onClick={() => irParaPagina(p)}
                  aria-label={`Página ${p}`}
                  aria-current={p === pagina ? 'page' : undefined}
                  className={`${botaoBase} ${
                    p === pagina
                      ? 'bg-blue-600 border-blue-600 text-white font-medium'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              </li>
            )
          )}
        </ul>

        <button
          type="button"
          onClick={proxima}
          disabled={pagina >= totalPaginas}
          aria-label="Próxima página"
          className={`${botaoBase} gap-1 bg-white border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white`}
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
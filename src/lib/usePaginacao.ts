import { useMemo, useState } from 'react'

export const TAMANHO_PAGINA = 10

export interface Paginacao<T> {
  /** Itens da página atual (no máximo `tamanho`) */
  itensPagina: T[]
  /** Página atual, sempre dentro de 1..totalPaginas */
  pagina: number
  totalPaginas: number
  totalItens: number
  /** Posição (1-based) do primeiro e do último item exibidos; 0 quando vazio */
  inicio: number
  fim: number
  irParaPagina: (pagina: number) => void
  anterior: () => void
  proxima: () => void
}

/**
 * Paginação em memória, aplicada sobre a lista JÁ filtrada/ordenada.
 *
 * `chaveReset` identifica o conjunto de busca/filtros atual: quando muda, volta à página 1.
 * Se a lista encolher (ex.: exclusão do último item da última página), a página é
 * ajustada automaticamente para a última existente.
 */
export function usePaginacao<T>(itens: T[], chaveReset: string = '', tamanho: number = TAMANHO_PAGINA): Paginacao<T> {
  const [paginaSolicitada, setPaginaSolicitada] = useState(1)
  const [chaveAnterior, setChaveAnterior] = useState(chaveReset)

  // Ajuste de estado durante a renderização (padrão recomendado pelo React): evita um
  // render intermediário exibindo a página antiga com os filtros novos
  let paginaBase = paginaSolicitada
  if (chaveReset !== chaveAnterior) {
    setChaveAnterior(chaveReset)
    setPaginaSolicitada(1)
    paginaBase = 1
  }

  const totalItens = itens.length
  const totalPaginas = Math.max(1, Math.ceil(totalItens / tamanho))
  const pagina = Math.min(Math.max(1, paginaBase), totalPaginas)

  const itensPagina = useMemo(
    () => itens.slice((pagina - 1) * tamanho, pagina * tamanho),
    [itens, pagina, tamanho]
  )

  const irParaPagina = (destino: number) =>
    setPaginaSolicitada(Math.min(Math.max(1, Math.trunc(destino) || 1), totalPaginas))

  return {
    itensPagina,
    pagina,
    totalPaginas,
    totalItens,
    inicio: totalItens === 0 ? 0 : (pagina - 1) * tamanho + 1,
    fim: Math.min(pagina * tamanho, totalItens),
    irParaPagina,
    anterior: () => irParaPagina(pagina - 1),
    proxima: () => irParaPagina(pagina + 1),
  }
}
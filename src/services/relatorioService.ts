import { authFetch } from "@/lib/Auth"
import { lancarErroApi } from "@/lib/ApiError"
import { AgrupamentoDespesas, RelatorioDespesas, RelatorioGeral } from "@/types/relatorio"

// Os tipos do backend batem exatamente com RelatorioGeral/MarcaRelatorio,
// então não é necessário nenhum mapeamento aqui.
// inicio/fim no formato yyyy-MM-dd. Se omitidos, retorna o relatório completo.
export async function buscarRelatorio(inicio?: string, fim?: string): Promise<RelatorioGeral> {
  const params = new URLSearchParams()
  if (inicio) params.set('inicio', inicio)
  if (fim) params.set('fim', fim)
  const query = params.toString() ? `?${params.toString()}` : ''

  const response = await authFetch(`/api/relatorios${query}`)
  if (!response.ok) {
    throw new Error("Não foi possível carregar o relatório")
  }
  return response.json()
}

// Agregado no backend sobre TODAS as despesas da viagem (independe da paginação da listagem)
export async function buscarDespesasAgrupadas(viagemId: string, agruparPor: AgrupamentoDespesas): Promise<RelatorioDespesas> {
  const params = new URLSearchParams({ viagemId, agruparPor })
  const response = await authFetch(`/api/relatorios/despesas?${params.toString()}`)
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível carregar o relatório de despesas")
  }
  return response.json()
}

import { authFetch } from "@/lib/Auth"
import { RelatorioGeral } from "@/types/relatorio"

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
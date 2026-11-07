import { authFetch } from "@/lib/Auth"
import { lancarErroApi } from "@/lib/ApiError"
import { DashboardRelatorio, FiltrosDashboard } from "@/types/relatorio"

// Todos os totais vêm calculados do backend; nada é somado no frontend
export async function buscarDashboard(filtros: FiltrosDashboard = {}): Promise<DashboardRelatorio> {
  const params = new URLSearchParams()
  if (filtros.inicio) params.set("inicio", filtros.inicio)
  if (filtros.fim) params.set("fim", filtros.fim)
  if (filtros.marcaId) params.set("marcaId", filtros.marcaId)
  if (filtros.status) params.set("status", filtros.status)
  const query = params.toString() ? `?${params.toString()}` : ""

  const response = await authFetch(`/api/relatorios/dashboard${query}`)
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível carregar o relatório")
  }
  return (await response.json()) as DashboardRelatorio
}
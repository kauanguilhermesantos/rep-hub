import { authFetch } from "@/lib/Auth"
import { RelatorioGeral } from "@/types/relatorio"

export async function buscarRelatorio(): Promise<RelatorioGeral> {
  const response = await authFetch("/api/relatorios")
  if (!response.ok) {
    throw new Error("Não foi possível carregar o relatório")
  }
  return response.json()
}
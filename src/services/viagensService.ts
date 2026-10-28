import { authFetch } from "@/lib/Auth"
import { lancarErroApi } from "@/lib/ApiError"

export type StatusViagem = "EM_ANDAMENTO" | "FINALIZADA"

// Formato real devolvido por GET /api/viagens (ViagemResponse do backend)
export interface Viagem {
  id: string
  titulo: string
  roteiro: string[]              // ex.: ["Fortaleza - CE", "Sobral - CE"]
  dataInicio: string             // yyyy-MM-dd (data pura)
  dataFinalizacao: string | null // yyyy-MM-ddTHH:mm:ss (sem fuso); nula enquanto em andamento
  observacoes: string | null
  status: StatusViagem
  totalDespesas: number          // calculado pelo backend a partir das despesas
  quantidadeDespesas: number
  quantidadePedidos: number
  criadoEm: string
  atualizadoEm: string
}

export interface FiltrosViagens {
  status?: StatusViagem
  inicio?: string // yyyy-MM-dd (filtra pela data de início da viagem)
  fim?: string
}

export async function listarViagens(filtros: FiltrosViagens = {}): Promise<Viagem[]> {
  const params = new URLSearchParams()
  if (filtros.status) params.set("status", filtros.status)
  if (filtros.inicio) params.set("inicio", filtros.inicio)
  if (filtros.fim) params.set("fim", filtros.fim)
  const query = params.toString() ? `?${params.toString()}` : ""

  const response = await authFetch(`/api/viagens${query}`)
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível carregar as viagens")
  }
  return (await response.json()) as Viagem[]
}

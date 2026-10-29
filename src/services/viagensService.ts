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

// Corpo aceito pelo backend em POST/PUT. Dono, status e data de finalização NÃO fazem parte:
// o backend os define a partir da autenticação e das regras de negócio.
export interface ViagemPayload {
  titulo: string
  roteiro: string[]
  dataInicio: string // yyyy-MM-dd
  observacoes?: string | null
}

export async function buscarViagem(id: string): Promise<Viagem> {
  const response = await authFetch(`/api/viagens/${encodeURIComponent(id)}`)
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível carregar a viagem")
  }
  return (await response.json()) as Viagem
}

export async function criarViagem(payload: ViagemPayload): Promise<Viagem> {
  const response = await authFetch("/api/viagens", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível cadastrar a viagem")
  }
  return (await response.json()) as Viagem
}

export async function atualizarViagem(id: string, payload: ViagemPayload): Promise<Viagem> {
  const response = await authFetch(`/api/viagens/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível salvar as alterações")
  }
  return (await response.json()) as Viagem
}

// Mensagem de sucesso exibida na listagem depois de salvar (sobrevive à troca de página)
const CHAVE_MENSAGEM = "rephub:mensagem-viagem"

export function guardarMensagemViagem(mensagem: string): void {
  try {
    sessionStorage.setItem(CHAVE_MENSAGEM, mensagem)
  } catch {
    // sem armazenamento: a mensagem simplesmente não aparece
  }
}

export function consumirMensagemViagem(): string {
  try {
    const mensagem = sessionStorage.getItem(CHAVE_MENSAGEM) ?? ""
    if (mensagem) sessionStorage.removeItem(CHAVE_MENSAGEM)
    return mensagem
  } catch {
    return ""
  }
}

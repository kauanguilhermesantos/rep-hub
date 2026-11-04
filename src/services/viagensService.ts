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

// POST /api/viagens/{id}/finalizar — idempotente no backend: repetir não muda a data original
export async function finalizarViagem(id: string): Promise<Viagem> {
  const response = await authFetch(`/api/viagens/${encodeURIComponent(id)}/finalizar`, { method: "POST" })
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível finalizar a viagem")
  }
  return (await response.json()) as Viagem
}

// Quantidade de cidades visitadas = municípios cadastrados no roteiro da viagem (ignora itens vazios)
export function contarCidades(roteiro?: string[] | null): number {
  return (roteiro ?? []).filter((c) => c && c.trim() !== "").length
}

// "1 cidade visitada" / "3 cidades visitadas"; null quando não há cidades (nada a exibir)
export function textoCidadesVisitadas(roteiro?: string[] | null): string | null {
  const total = contarCidades(roteiro)
  if (total === 0) return null
  return `${total} ${total === 1 ? "cidade visitada" : "cidades visitadas"}`
}

// Texto de busca sem acentos, em minúsculas e sem espaços nas pontas ("Pedágio " -> "pedagio")
export function normalizarBusca(texto: string): string {
  return texto.normalize("NFD").replace(/\p{M}+/gu, "").trim().toLowerCase()
}

// Busca pelo nome da viagem: parcial, sem diferenciar maiúsculas/minúsculas nem acentos.
// Filtra em memória a lista já carregada (o backend não tem busca por nome e o volume por
// representante é pequeno), então digitar ou trocar a visualização não gera chamadas à API.
export function filtrarViagensPorNome(viagens: Viagem[], termo: string): Viagem[] {
  const busca = normalizarBusca(termo)
  if (!busca) return viagens
  return viagens.filter((v) => normalizarBusca(v.titulo).includes(busca))
}

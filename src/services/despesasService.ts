import { authFetch } from "@/lib/Auth"
import { lancarErroApi } from "@/lib/ApiError"

// Mesmas categorias do enum CategoriaDespesa do backend
export type CategoriaDespesa =
  | "ALIMENTACAO"
  | "HOSPEDAGEM"
  | "COMBUSTIVEL"
  | "TRANSPORTE"
  | "ESTACIONAMENTO"
  | "OUTROS"

export const CATEGORIAS: { valor: CategoriaDespesa; rotulo: string }[] = [
  { valor: "ALIMENTACAO", rotulo: "Alimentação" },
  { valor: "HOSPEDAGEM", rotulo: "Hospedagem" },
  { valor: "COMBUSTIVEL", rotulo: "Combustível" },
  { valor: "TRANSPORTE", rotulo: "Transporte" },
  { valor: "ESTACIONAMENTO", rotulo: "Estacionamento" },
  { valor: "OUTROS", rotulo: "Outros" },
]

export function rotuloCategoria(categoria: CategoriaDespesa): string {
  return CATEGORIAS.find((c) => c.valor === categoria)?.rotulo ?? categoria
}

// Formato real devolvido pelo backend (DespesaResponse)
export interface Despesa {
  id: string
  viagemId: string
  categoria: CategoriaDespesa
  descricao: string
  valor: number          // já com 2 casas, vindo do backend
  data: string           // yyyy-MM-dd
  observacoes: string | null
  criadoEm: string
  atualizadoEm: string
}

// GET /api/viagens/{id}/despesas — os totais vêm prontos do backend
export interface DespesasViagem {
  despesas: Despesa[]
  totalDespesas: number
  totalPorCategoria: Partial<Record<CategoriaDespesa, number>>
}

export interface DespesaPayload {
  categoria: CategoriaDespesa
  descricao: string
  valor: number
  data: string // yyyy-MM-dd
  observacoes: string | null
}

const base = (viagemId: string) => `/api/viagens/${encodeURIComponent(viagemId)}/despesas`

export async function listarDespesas(viagemId: string): Promise<DespesasViagem> {
  const response = await authFetch(base(viagemId))
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível carregar as despesas")
  }
  return (await response.json()) as DespesasViagem
}

export async function criarDespesa(viagemId: string, payload: DespesaPayload): Promise<Despesa> {
  const response = await authFetch(base(viagemId), { method: "POST", body: JSON.stringify(payload) })
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível cadastrar a despesa")
  }
  return (await response.json()) as Despesa
}

export async function atualizarDespesa(
  viagemId: string,
  despesaId: string,
  payload: DespesaPayload
): Promise<Despesa> {
  const response = await authFetch(`${base(viagemId)}/${encodeURIComponent(despesaId)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível salvar a despesa")
  }
  return (await response.json()) as Despesa
}

export async function excluirDespesa(viagemId: string, despesaId: string): Promise<void> {
  const response = await authFetch(`${base(viagemId)}/${encodeURIComponent(despesaId)}`, { method: "DELETE" })
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível excluir a despesa")
  }
}

// "33,33" / "33.33" / "1234" -> número; devolve null se não for um valor monetário válido
// (apenas dígitos, separador decimal opcional e no máximo 2 casas).
export function interpretarValor(texto: string): number | null {
  const limpo = texto.trim().replace(/^R\$\s*/, "")
  if (!/^\d+([.,]\d{1,2})?$/.test(limpo)) return null
  return Number(limpo.replace(",", "."))
}

import { authFetch } from "@/lib/Auth"
import { lancarErroApi } from "@/lib/ApiError"

// Formato real devolvido por /api/categorias-despesa (CategoriaResponse do backend)
export interface CategoriaDespesa {
  id: string          // padrão: "COMBUSTIVEL"...; personalizada: id do documento
  nome: string
  padrao: boolean
  criadoEm?: string | null
  atualizadoEm?: string | null
}

export const MAX_NOME_CATEGORIA = 40

const BASE = "/api/categorias-despesa"

// As 6 padrão (ordem fixa) seguidas das personalizadas do usuário em ordem alfabética
export async function listarCategorias(): Promise<CategoriaDespesa[]> {
  const response = await authFetch(BASE)
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível carregar as categorias")
  }
  return (await response.json()) as CategoriaDespesa[]
}

export async function criarCategoria(nome: string): Promise<CategoriaDespesa> {
  const response = await authFetch(BASE, { method: "POST", body: JSON.stringify({ nome }) })
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível cadastrar a categoria")
  }
  return (await response.json()) as CategoriaDespesa
}

export async function atualizarCategoria(id: string, nome: string): Promise<CategoriaDespesa> {
  const response = await authFetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ nome }),
  })
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível salvar a categoria")
  }
  return (await response.json()) as CategoriaDespesa
}

// O backend recusa (409) se houver despesas usando a categoria e devolve o motivo
export async function excluirCategoria(id: string): Promise<void> {
  const response = await authFetch(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" })
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível excluir a categoria")
  }
}

// Validação de formulário (a regra de duplicidade é só do backend, que é quem tem os dados)
export function validarNomeCategoria(nome: string): string | null {
  const limpo = nome.trim()
  if (!limpo) return "O nome da categoria é obrigatório"
  if (limpo.length > MAX_NOME_CATEGORIA) return `O nome deve ter no máximo ${MAX_NOME_CATEGORIA} caracteres`
  return null
}

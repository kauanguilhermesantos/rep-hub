import { authFetch, updateToken } from "@/lib/Auth"
import { Usuario } from "@/types/usuario"

// Busca os dados do usuário atualmente logado
export async function getMe(): Promise<Usuario> {
  const response = await authFetch("/api/usuarios/me")

  if (!response.ok) {
    throw new Error("Não foi possível carregar seus dados")
  }

  return response.json()
}

interface AtualizarPerfilPayload {
  nomeCompleto: string
  email: string
  telefone: string
}

interface AtualizarPerfilResponse {
  usuario: Usuario
  token: string | null
}

// Atualiza nome, e-mail e telefone do usuário logado
export async function updateMe(payload: AtualizarPerfilPayload): Promise<Usuario> {
  const response = await authFetch("/api/usuarios/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("Já existe uma conta com esse e-mail")
    }
    throw new Error("Não foi possível salvar as alterações")
  }

  const data: AtualizarPerfilResponse = await response.json()

  // Se o e-mail foi alterado, o backend devolve um token novo — precisa
  // substituir o token salvo, senão a próxima requisição falha (401)
  if (data.token) {
    updateToken(data.token)
  }

  return data.usuario
}
import { authFetch, updateToken, logout } from "@/lib/Auth"
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

  if (data.token) {
    updateToken(data.token)
  }

  return data.usuario
}

// Troca a senha do usuário logado, exigindo a senha atual
export async function alterarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
  const response = await authFetch("/api/usuarios/me/senha", {
    method: "PUT",
    body: JSON.stringify({ senhaAtual, novaSenha }),
  })

  if (!response.ok) {
    const texto = await response.text()
    throw new Error(texto || "Não foi possível alterar a senha")
  }
}

// Exclui a conta do usuário logado, exigindo a senha como confirmação.
// Já faz o logout (limpa token/cookie) em caso de sucesso.
export async function excluirConta(senha: string): Promise<void> {
  const response = await authFetch("/api/usuarios/me", {
    method: "DELETE",
    body: JSON.stringify({ senha }),
  })

  if (!response.ok) {
    const texto = await response.text()
    throw new Error(texto || "Não foi possível excluir a conta")
  }

  logout()
}
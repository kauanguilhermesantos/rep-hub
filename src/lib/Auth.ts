const TOKEN_KEY = "rephub_token"

interface LoginResponse {
  token: string
  id: string
  nomeCompleto: string
  email: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function login(email: string, senha: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  })

  if (!response.ok) {
    throw new Error("E-mail ou senha inválidos")
  }

  const data: LoginResponse = await response.json()

  // Salva o token no localStorage, usado pelo authFetch em chamadas à API
  localStorage.setItem(TOKEN_KEY, data.token)

  // Salva também em um cookie legível pelo middleware.ts (proteção de rotas
  // no lado do servidor/edge). A validação "de verdade" do token continua
  // acontecendo no backend a cada requisição.
  document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`

  return data
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  document.cookie = "token=; path=/; max-age=0"
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

// Wrapper de fetch que já inclui o header Authorization
export async function authFetch(path: string, options: RequestInit = {}) {
  const token = getToken()
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}
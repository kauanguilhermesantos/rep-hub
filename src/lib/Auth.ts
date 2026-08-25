const TOKEN_KEY = "rephub_token"

interface LoginResponse {
  token: string
  id: string
  nomeCompleto: string
  email: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

interface RegisterPayload {
  nomeCompleto: string
  email: string
  senha: string
  telefone: string
}

export async function register(payload: RegisterPayload) {
  const response = await fetch(`${API_URL}/api/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("Já existe uma conta com esse e-mail")
    }
    throw new Error("Não foi possível criar a conta")
  }

  return response.json()
}

// Salva o token no localStorage (usado pelo authFetch) e num cookie
// (lido pelo middleware.ts para proteger rotas)
export function updateToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
}

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
  updateToken(data.token)

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
import { lancarErroApi } from "@/lib/ApiError"

const TOKEN_KEY = "rephub_token"
const REFRESH_TOKEN_KEY = "rephub_refresh_token"

interface LoginResponse {
  token: string
  refreshToken: string
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
    await lancarErroApi(response, "Não foi possível criar a conta")
  }

  return response.json()
}

// Salva o access token no localStorage (usado pelo authFetch) e num cookie
// (lido pelo middleware.ts para proteção de rotas). O refresh token, quando
// informado, também é salvo — só é omitido em atualizações pontuais do
// access token que não emitem um refresh token novo.
export function updateToken(token: string, refreshToken?: string) {
  localStorage.setItem(TOKEN_KEY, token)
  // 30 dias de validade no cookie, acompanhando o tempo de vida do refresh token —
  // quem decide se a sessão continua válida de verdade é sempre o backend.
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export async function login(email: string, senha: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  })

  if (!response.ok) {
    await lancarErroApi(response, "E-mail ou senha inválidos")
  }

  const data: LoginResponse = await response.json()
  updateToken(data.token, data.refreshToken)

  return data
}

// Revoga o refresh token no backend (best-effort) e limpa tudo localmente
export function logout() {
  const refreshToken = getRefreshToken()

  if (refreshToken) {
    fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {
      // Sem problema se essa chamada falhar (ex: sem internet) — limpamos
      // localmente de qualquer forma, e o refresh token vai expirar sozinho.
    })
  }

  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  document.cookie = "token=; path=/; max-age=0"
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

// Evita disparar várias renovações em paralelo se várias chamadas
// tomarem 401 ao mesmo tempo — todas esperam a mesma renovação em andamento.
let renovacaoEmAndamento: Promise<string | null> | null = null

async function tentarRenovarToken(): Promise<string | null> {
  if (renovacaoEmAndamento) {
    return renovacaoEmAndamento
  }

  renovacaoEmAndamento = (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return null

    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        // Refresh token também inválido/expirado — não tem mais como renovar
        logout()
        return null
      }

      const data: { token: string; refreshToken: string } = await response.json()
      updateToken(data.token, data.refreshToken)
      return data.token
    } catch {
      return null
    }
  })()

  const resultado = await renovacaoEmAndamento
  renovacaoEmAndamento = null
  return resultado
}

// Wrapper de fetch que já inclui o header Authorization. Se a chamada voltar
// 401 (access token expirado), tenta renovar com o refresh token e repete a
// requisição uma única vez — de forma transparente pra quem chamou.
export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (response.status !== 401) {
    return response
  }

  const novoToken = await tentarRenovarToken()
  if (!novoToken) {
    return response // não conseguiu renovar — devolve o 401 original
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${novoToken}`,
    },
  })
}
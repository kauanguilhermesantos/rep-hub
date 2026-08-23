// Validação de e-mail com regex simples (cobre a maioria dos casos reais)
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email.trim())
}

// Aceita formatos: (XX) XXXXX-XXXX, (XX) XXXX-XXXX, ou só dígitos (10 ou 11 números)
export function isValidTelefone(telefone: string): boolean {
  const apenasDigitos = telefone.replace(/\D/g, "")
  return apenasDigitos.length === 10 || apenasDigitos.length === 11
}

// Aplica a máscara (XX) XXXXX-XXXX enquanto o usuário digita
export function formatarTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11)

  if (digitos.length <= 2) return digitos.replace(/^(\d*)/, "($1")
  if (digitos.length <= 6) return digitos.replace(/^(\d{2})(\d*)/, "($1) $2")
  if (digitos.length <= 10) {
    return digitos.replace(/^(\d{2})(\d{4})(\d*)/, "($1) $2-$3")
  }
  return digitos.replace(/^(\d{2})(\d{5})(\d*)/, "($1) $2-$3")
}

export interface PasswordRequirement {
  label: string
  test: (senha: string) => boolean
}

export const passwordRequirements: PasswordRequirement[] = [
  { label: "Pelo menos 8 caracteres", test: (s) => s.length >= 8 },
  { label: "Uma letra maiúscula", test: (s) => /[A-Z]/.test(s) },
  { label: "Uma letra minúscula", test: (s) => /[a-z]/.test(s) },
  { label: "Um número", test: (s) => /[0-9]/.test(s) },
  { label: "Um caractere especial (!@#$%...)", test: (s) => /[^A-Za-z0-9]/.test(s) },
]

export function isPasswordValid(senha: string): boolean {
  return passwordRequirements.every((req) => req.test(senha))
}
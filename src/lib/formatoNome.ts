export function primeiroEUltimoNome(nomeCompleto?: string): string {
  if (!nomeCompleto) return ""
  const partes = nomeCompleto.trim().split(/\s+/)
  if (partes.length === 1) return partes[0]
  return `${partes[0]} ${partes[partes.length - 1]}`
}
 
// "João da Silva Santos" -> "JS"
export function iniciais(nomeCompleto?: string): string {
  if (!nomeCompleto) return ""
  const partes = nomeCompleto.trim().split(/\s+/)
  const primeira = partes[0]?.[0] ?? ""
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ""
  return (primeira + ultima).toUpperCase()
}
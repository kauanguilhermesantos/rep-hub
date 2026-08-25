export function formatarData(iso?: string): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("pt-BR")
}

export function formatarDataHora(iso?: string): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("pt-BR")
}
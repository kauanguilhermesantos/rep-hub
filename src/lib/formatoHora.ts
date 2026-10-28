
export function formatarData(iso?: string): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("pt-BR")
}
 
// Data de hoje no fuso do navegador, no formato yyyy-MM-dd (para <input type="date">).
// Não usar toISOString(): ele devolve a data em UTC e vira "amanhã" à noite no Brasil.
export function hojeIso(): string {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, "0")
  const dia = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${mes}-${dia}`
}
 
export function formatarDataHora(iso?: string): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("pt-BR")
}

// Data pura "yyyy-MM-dd" (como o backend envia dataInicio) -> "dd/mm/aaaa".
// Não usar new Date("yyyy-MM-dd"): ele interpreta como UTC e mostra o dia anterior no Brasil.
export function formatarDataIso(iso?: string | null): string {
  if (!iso) return "—"
  const [ano, mes, dia] = iso.slice(0, 10).split("-")
  if (!ano || !mes || !dia) return "—"
  return `${dia}/${mes}/${ano}`
}
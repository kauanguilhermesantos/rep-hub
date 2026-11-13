export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

// Recebe o percentual já multiplicado por 100 (ex.: 75.5 -> "75,5%")
export function formatarPercentual(valor: number): string {
  return (valor / 100).toLocaleString("pt-BR", { style: "percent", maximumFractionDigits: 2 })
}
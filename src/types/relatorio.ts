// Dashboard de relatórios (GET /api/relatorios/dashboard)
export type StatusViagemFiltro = 'EM_ANDAMENTO' | 'FINALIZADA'

export interface FiltrosDashboard {
  inicio?: string // yyyy-MM-dd
  fim?: string
  marcaId?: string
  status?: StatusViagemFiltro
}

export interface ResumoComercial {
  totalPedidos: number
  totalPares: number
  totalVendas: number
  totalComissao: number
  ticketMedio: number
  quantidadeMarcas: number
  quantidadeMarcasCadastradas: number
}

export interface PontoMensal {
  mes: string // yyyy-MM
  pedidos: number
  pares: number
  vendas: number
  comissao: number
}

export interface MarcaDesempenho {
  marcaId: string
  marcaNome: string
  pedidos: number
  pares: number
  vendas: number
  comissao: number
  ticketMedio: number
  participacaoVendas: number
}

export interface MarcaMensal {
  mes: string
  marcaId: string
  marcaNome: string
  pedidos: number
  vendas: number
}

export interface ResumoViagens {
  quantidade: number
  emAndamento: number
  finalizadas: number
  totalVendas: number
  totalDespesas: number
  resultado: number
}

export interface PontoViagemMensal {
  mes: string
  viagens: number
  vendas: number
  despesas: number
  resultado: number
}

export interface TotalCategoriaDashboard {
  categoria: string
  categoriaNome: string
  padrao: boolean
  total: number
}

export interface DashboardRelatorio {
  comercial: ResumoComercial
  vendasPorMes: PontoMensal[]
  marcas: MarcaDesempenho[]
  marcasPorMes: MarcaMensal[]
  viagens: ResumoViagens
  viagensPorMes: PontoViagemMensal[]
  despesasPorCategoria: TotalCategoriaDashboard[]
  viagensIgnoramMarca: boolean
}
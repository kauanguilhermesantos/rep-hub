export interface MarcaRelatorio {
  id: string
  nome: string
  totalPedidos: number
  totalPares: number
  valorTotalVendas: number
  valorTotalComissao: number
}

export interface RelatorioGeral {
  totalPedidos: number
  totalPares: number
  valorTotalVendas: number
  valorTotalComissao: number
  vendasPorMarca: MarcaRelatorio[]
}

export interface DadosGrafico {
  name: string
  value: number
  color: string
}
// GET /api/relatorios/despesas?viagemId=&agruparPor=
export type AgrupamentoDespesas = 'FORMA_PAGAMENTO' | 'CATEGORIA'

export interface GrupoDespesas {
  chave: string        // forma de pagamento, id da categoria ou "NAO_INFORMADO"
  nome: string | null  // nome da categoria; null quando agrupado por forma
  quantidade: number
  total: number
  percentual: number   // 0..100, 2 casas
}

export interface RelatorioDespesas {
  totalDespesas: number
  quantidadeDespesas: number
  grupos: GrupoDespesas[] // maior valor primeiro
}

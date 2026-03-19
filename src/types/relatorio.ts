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
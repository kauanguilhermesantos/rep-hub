import { authFetch } from "@/lib/Auth"
import { lancarErroApi } from "@/lib/ApiError"
import { formatarData } from "@/lib/formatoHora"
import { Pedido } from "@/app/(app)/pedidos/page"

interface UsuarioResumidoApi {
  id: string
  nomeCompleto: string
  email: string
}

interface MarcaResumidaApi {
  id: string
  nome: string
}

// Formato como o pedido vem do backend
interface PedidoApi {
  id: string
  usuario?: UsuarioResumidoApi | null
  marca?: MarcaResumidaApi | null
  cliente: string
  quantPares: number
  valorTotal: number
  comissaoPercentual: number
  valorComissao: number
  condicaoPagamento: string
  estado?: string | null
  cidade?: string | null
  dataCadastro: string
  anexoUrl?: string | null
}

// Dados que os modais de criar/editar coletam do usuário
export interface PedidoFormPayload {
  marcaId: string
  cliente: string
  quantPares: number
  valorTotal: number
  comissaoPercentual: number
  valorComissao: number
  condicaoPagamento: string
  estado?: string
  cidade?: string
  data?: string // yyyy-MM-dd, só usada ao criar
}

function mapPedido(p: PedidoApi): Pedido {
  return {
    id: p.id,
    marcaId: p.marca?.id ?? '',
    marcaNome: p.marca?.nome ?? 'Marca removida',
    cliente: p.cliente,
    pares: p.quantPares ?? 0,
    valorTotal: p.valorTotal ?? 0,
    condicaoPagamento: p.condicaoPagamento ?? '',
    estado: p.estado ?? '',
    cidade: p.cidade ?? '',
    comissaoPercentual: p.comissaoPercentual ?? 0,
    valorComissao: p.valorComissao ?? 0,
    anexo: p.anexoUrl ? { nome: p.anexoUrl.split('/').pop() || 'Anexo', url: p.anexoUrl } : undefined,
    dataCadastro: formatarData(p.dataCadastro),
    dataCadastroIso: p.dataCadastro.slice(0, 10),
  }
}

function buildBody(payload: PedidoFormPayload) {
  return {
    marca: { id: payload.marcaId },
    cliente: payload.cliente,
    quantPares: payload.quantPares,
    valorTotal: payload.valorTotal,
    comissaoPercentual: payload.comissaoPercentual,
    valorComissao: payload.valorComissao,
    condicaoPagamento: payload.condicaoPagamento,
    estado: payload.estado,
    cidade: payload.cidade,
    data: payload.data,
  }
}

export interface ResumoPedidos {
  totalPedidos: number
  totalPares: number
  valorTotalVendas: number
  valorTotalComissao: number
}

export interface ConsultaPedidos {
  pagina: number // base 1 (a API usa base 0)
  tamanho?: number
  inicio?: string
  fim?: string
  busca?: string
}

export interface PaginaPedidos {
  pedidos: Pedido[]
  pagina: number // base 1
  tamanho: number
  totalItens: number
  totalPaginas: number
  resumo: ResumoPedidos
}

interface PaginaPedidosApi {
  content: PedidoApi[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  resumo: ResumoPedidos
}

// Uma página de pedidos. Período e busca são aplicados no backend antes da paginação;
// o resumo traz os totais de TODOS os pedidos do período (não só os da página).
export async function listarPedidos({ pagina, tamanho = 10, inicio, fim, busca }: ConsultaPedidos): Promise<PaginaPedidos> {
  const params = new URLSearchParams()
  params.set('page', String(Math.max(pagina - 1, 0)))
  params.set('size', String(tamanho))
  if (inicio) params.set('inicio', inicio)
  if (fim) params.set('fim', fim)
  if (busca) params.set('busca', busca)

  const response = await authFetch(`/api/pedidos?${params.toString()}`)
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível carregar os pedidos")
  }
  const data: PaginaPedidosApi = await response.json()
  return {
    pedidos: data.content.map(mapPedido),
    pagina: data.page + 1,
    tamanho: data.size,
    totalItens: data.totalElements,
    totalPaginas: data.totalPages,
    resumo: data.resumo,
  }
}

// Últimos pedidos do usuário logado, já ordenados pelo backend (mais recente primeiro)
export async function listarPedidosRecentes(limite = 5): Promise<Pedido[]> {
  const response = await authFetch(`/api/pedidos/recentes?limit=${limite}`)
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível carregar os pedidos recentes")
  }
  const data: PedidoApi[] = await response.json()
  return data.map(mapPedido)
}

export async function criarPedido(payload: PedidoFormPayload): Promise<Pedido> {
  const response = await authFetch("/api/pedidos", {
    method: "POST",
    body: JSON.stringify(buildBody(payload)),
  })
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível criar o pedido")
  }
  const data: PedidoApi = await response.json()
  return mapPedido(data)
}

export async function editarPedido(id: string, payload: PedidoFormPayload): Promise<Pedido> {
  const response = await authFetch(`/api/pedidos/${id}`, {
    method: "PUT",
    body: JSON.stringify(buildBody(payload)),
  })
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível salvar as alterações")
  }
  const data: PedidoApi = await response.json()
  return mapPedido(data)
}

export async function excluirPedido(id: string): Promise<void> {
  const response = await authFetch(`/api/pedidos/${id}`, { method: "DELETE" })
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível excluir o pedido")
  }
}
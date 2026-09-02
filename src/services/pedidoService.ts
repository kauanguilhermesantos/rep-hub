import { authFetch } from "@/lib/Auth"
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
    comissaoPercentual: p.comissaoPercentual ?? 0,
    valorComissao: p.valorComissao ?? 0,
    anexo: p.anexoUrl ? { nome: p.anexoUrl.split('/').pop() || 'Anexo', url: p.anexoUrl } : undefined,
    dataCadastro: formatarData(p.dataCadastro),
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
  }
}

export async function listarPedidos(): Promise<Pedido[]> {
  const response = await authFetch("/api/pedidos")
  if (!response.ok) {
    throw new Error("Não foi possível carregar os pedidos")
  }
  const data: PedidoApi[] = await response.json()
  return data.map(mapPedido)
}

// Últimos pedidos do usuário logado, já ordenados pelo backend (mais recente primeiro)
export async function listarPedidosRecentes(limite = 5): Promise<Pedido[]> {
  const response = await authFetch(`/api/pedidos/recentes?limit=${limite}`)
  if (!response.ok) {
    throw new Error("Não foi possível carregar os pedidos recentes")
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
    throw new Error("Não foi possível criar o pedido")
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
    throw new Error("Não foi possível salvar as alterações")
  }
  const data: PedidoApi = await response.json()
  return mapPedido(data)
}

export async function excluirPedido(id: string): Promise<void> {
  const response = await authFetch(`/api/pedidos/${id}`, { method: "DELETE" })
  if (!response.ok) {
    throw new Error("Não foi possível excluir o pedido")
  }
}
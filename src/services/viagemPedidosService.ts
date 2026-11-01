import { authFetch } from "@/lib/Auth"
import { lancarErroApi } from "@/lib/ApiError"

// Visão resumida de um pedido EXISTENTE (PedidoViagemResponse do backend).
// A viagem só guarda a referência; o pedido original nunca é copiado nem alterado.
export interface PedidoDaViagem {
  id: string
  cliente: string
  marcaNome: string | null
  estado: string | null
  cidade: string | null
  quantPares: number | null
  valorTotal: number
  valorComissao: number
  dataCadastro: string // yyyy-MM-ddTHH:mm:ss
}

// GET/POST/DELETE em /api/viagens/{id}/pedidos — totais calculados pelo backend
export interface PedidosDaViagem {
  pedidos: PedidoDaViagem[]
  quantidadePedidos: number
  valorTotalPedidos: number
  valorTotalComissao: number
}

const base = (viagemId: string) => `/api/viagens/${encodeURIComponent(viagemId)}`

export async function listarPedidosDaViagem(viagemId: string): Promise<PedidosDaViagem> {
  const response = await authFetch(`${base(viagemId)}/pedidos`)
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível carregar os pedidos da viagem")
  }
  return (await response.json()) as PedidosDaViagem
}

// Pedidos do usuário que ainda não estão em nenhuma viagem dele
export async function listarPedidosDisponiveis(viagemId: string): Promise<PedidoDaViagem[]> {
  const response = await authFetch(`${base(viagemId)}/pedidos-disponiveis`)
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível carregar os pedidos disponíveis")
  }
  return (await response.json()) as PedidoDaViagem[]
}

export async function associarPedidos(viagemId: string, pedidoIds: string[]): Promise<PedidosDaViagem> {
  const response = await authFetch(`${base(viagemId)}/pedidos`, {
    method: "POST",
    body: JSON.stringify({ pedidoIds }),
  })
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível associar os pedidos")
  }
  return (await response.json()) as PedidosDaViagem
}

export async function removerPedidoDaViagem(viagemId: string, pedidoId: string): Promise<PedidosDaViagem> {
  const response = await authFetch(`${base(viagemId)}/pedidos/${encodeURIComponent(pedidoId)}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    await lancarErroApi(response, "Não foi possível remover o pedido da viagem")
  }
  return (await response.json()) as PedidosDaViagem
}

import { authFetch } from "@/lib/Auth"
import { formatarData } from "@/lib/formatoHora"
import { Marca } from "@/components/MarcaCard"

// Formato como a marca vem do backend (dataCadastro em ISO, usuario aninhado)
interface MarcaApi {
  id: string
  nome: string
  dataCadastro: string
  totalPedidos: number
  usuario?: { id: string; nomeCompleto: string; email: string } | null
}

// Converte pro formato que os componentes existentes (MarcaCard, page.tsx) já esperam
function mapMarca(m: MarcaApi): Marca {
  return {
    id: m.id,
    nome: m.nome,
    dataCadastro: formatarData(m.dataCadastro),
    totalPedidos: m.totalPedidos ?? 0,
  }
}

export async function listarMarcas(): Promise<Marca[]> {
  const response = await authFetch("/api/marcas")
  if (!response.ok) {
    throw new Error("Não foi possível carregar as marcas")
  }
  const data: MarcaApi[] = await response.json()
  return data.map(mapMarca)
}

export async function criarMarca(nome: string): Promise<Marca> {
  const response = await authFetch("/api/marcas", {
    method: "POST",
    body: JSON.stringify({ nome }),
  })
  if (!response.ok) {
    throw new Error("Não foi possível criar a marca")
  }
  const data: MarcaApi = await response.json()
  return mapMarca(data)
}

export async function editarMarca(id: string, nome: string): Promise<Marca> {
  const response = await authFetch(`/api/marcas/${id}`, {
    method: "PUT",
    body: JSON.stringify({ nome }),
  })
  if (!response.ok) {
    throw new Error("Não foi possível editar a marca")
  }
  const data: MarcaApi = await response.json()
  return mapMarca(data)
}

export async function excluirMarca(id: string): Promise<void> {
  const response = await authFetch(`/api/marcas/${id}`, { method: "DELETE" })
  if (!response.ok) {
    throw new Error("Não foi possível excluir a marca")
  }
}
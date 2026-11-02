// Central de notificações (toasts) do RepHub.
//
// Uso em qualquer tela ou função (não precisa de hook nem de provider):
//   import { notificar } from '@/lib/notificacoes'
//   notificar.sucesso('Despesa adicionada com sucesso.')
//   notificar.erro('Não foi possível carregar as viagens.')
//   notificar.alerta('...'); notificar.info('...')
//
// O estado vive neste módulo, então uma notificação disparada logo antes de navegar
// (ex.: salvar e voltar para a listagem) continua visível na tela seguinte.
// A exibição fica em <NotificacoesViewport /> (montado uma vez, no UsuarioLayout).

export type TipoNotificacao = 'sucesso' | 'erro' | 'alerta' | 'info'

export interface Notificacao {
  id: number
  tipo: TipoNotificacao
  mensagem: string
  duracaoMs: number
  // Muda quando a mesma mensagem é disparada de novo: reinicia a contagem em vez de duplicar
  versao: number
}

export const DURACAO_PADRAO_MS = 5000
export const MAXIMO_VISIVEIS = 4

type Ouvinte = () => void

let notificacoes: Notificacao[] = []
let proximoId = 1
const ouvintes = new Set<Ouvinte>()

function emitir() {
  ouvintes.forEach((o) => o())
}

export function assinar(ouvinte: Ouvinte): () => void {
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}

// Mesma referência enquanto nada muda (exigência do useSyncExternalStore)
export function obterNotificacoes(): Notificacao[] {
  return notificacoes
}

export const SNAPSHOT_SERVIDOR: Notificacao[] = []

export function adicionar(tipo: TipoNotificacao, mensagem: string, duracaoMs = DURACAO_PADRAO_MS): number {
  const texto = mensagem.trim()
  if (!texto) return -1

  // Sem notificações repetidas: a mesma mensagem já na tela só reinicia o tempo
  const existente = notificacoes.find((n) => n.tipo === tipo && n.mensagem === texto)
  if (existente) {
    notificacoes = notificacoes.map((n) =>
      n.id === existente.id ? { ...n, versao: n.versao + 1, duracaoMs } : n
    )
    emitir()
    return existente.id
  }

  const nova: Notificacao = { id: proximoId++, tipo, mensagem: texto, duracaoMs, versao: 0 }
  notificacoes = [...notificacoes, nova].slice(-MAXIMO_VISIVEIS)
  emitir()
  return nova.id
}

export function remover(id: number): void {
  if (!notificacoes.some((n) => n.id === id)) return
  notificacoes = notificacoes.filter((n) => n.id !== id)
  emitir()
}

export function limparTodas(): void {
  if (notificacoes.length === 0) return
  notificacoes = []
  emitir()
}

export const notificar = {
  sucesso: (mensagem: string, duracaoMs?: number) => adicionar('sucesso', mensagem, duracaoMs),
  erro: (mensagem: string, duracaoMs?: number) => adicionar('erro', mensagem, duracaoMs),
  alerta: (mensagem: string, duracaoMs?: number) => adicionar('alerta', mensagem, duracaoMs),
  info: (mensagem: string, duracaoMs?: number) => adicionar('info', mensagem, duracaoMs),
}

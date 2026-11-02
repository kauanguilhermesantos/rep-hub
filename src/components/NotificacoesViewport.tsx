'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { Notificacao, remover, TipoNotificacao } from '@/services/notificacoesService'
import { useNotificacoes } from '@/lib/useNotificacoes'

const DURACAO_ANIMACAO_MS = 200

const ESTILOS: Record<TipoNotificacao, { caixa: string; icone: string; Icone: typeof Info; rotulo: string }> = {
  sucesso: { caixa: 'bg-white border-green-200', icone: 'text-green-600', Icone: CheckCircle2, rotulo: 'Sucesso' },
  erro: { caixa: 'bg-white border-red-200', icone: 'text-red-600', Icone: AlertCircle, rotulo: 'Erro' },
  alerta: { caixa: 'bg-white border-amber-200', icone: 'text-amber-600', Icone: AlertTriangle, rotulo: 'Alerta' },
  info: { caixa: 'bg-white border-blue-200', icone: 'text-blue-600', Icone: Info, rotulo: 'Informação' },
}

const FAIXA: Record<TipoNotificacao, string> = {
  sucesso: 'bg-green-500',
  erro: 'bg-red-500',
  alerta: 'bg-amber-500',
  info: 'bg-blue-500',
}

function ItemNotificacao({ notificacao }: { notificacao: Notificacao }) {
  const { id, tipo, mensagem, duracaoMs } = notificacao
  const { caixa, icone, Icone, rotulo } = ESTILOS[tipo]

  const [visivel, setVisivel] = useState(false) // controla a animação de entrada/saída
  const [pausado, setPausado] = useState(false)
  const timerFechar = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerRemover = useRef<ReturnType<typeof setTimeout> | null>(null)

  const limpar = useCallback(() => {
    if (timerFechar.current) clearTimeout(timerFechar.current)
    if (timerRemover.current) clearTimeout(timerRemover.current)
    timerFechar.current = null
    timerRemover.current = null
  }, [])

  const fechar = useCallback(() => {
    limpar()
    setVisivel(false) // anima a saída e só então remove
    timerRemover.current = setTimeout(() => remover(id), DURACAO_ANIMACAO_MS)
  }, [id, limpar])

  // Entrada: no próximo quadro, para a transição CSS ter um estado inicial
  useEffect(() => {
    const quadro = requestAnimationFrame(() => setVisivel(true))
    return () => cancelAnimationFrame(quadro)
  }, [])

  // Contagem regressiva (pausa com o mouse/foco em cima; reinicia ao sair)
  useEffect(() => {
    if (pausado) return
    timerFechar.current = setTimeout(fechar, duracaoMs)
    return limpar // limpeza ao desmontar ou ao pausar
  }, [pausado, duracaoMs, fechar, limpar])

  return (
    <div
      role={tipo === 'erro' || tipo === 'alerta' ? 'alert' : 'status'}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 w-full rounded-lg border shadow-lg p-3 pl-4
        transition-all ease-out motion-reduce:transition-none
        ${caixa} ${visivel ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`}
      style={{ transitionDuration: `${DURACAO_ANIMACAO_MS}ms` }}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${FAIXA[tipo]}`} aria-hidden="true" />
      <Icone size={20} className={`shrink-0 mt-0.5 ${icone}`} aria-hidden="true" />
      <p className="flex-1 min-w-0 text-sm text-gray-800 wrap-break-word">
        <span className="sr-only">{rotulo}: </span>
        {mensagem}
      </p>
      <button
        type="button"
        onClick={fechar}
        aria-label="Fechar notificação"
        className="shrink-0 p-0.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}

// Renderiza as notificações no canto superior direito. O contêiner não captura cliques
// (pointer-events-none); só os próprios avisos são interativos, então nada na tela fica bloqueado.
export default function NotificacoesViewport() {
  const notificacoes = useNotificacoes()

  return (
    <div
      aria-label="Notificações"
      className="pointer-events-none fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-60 flex flex-col gap-2"
    >
      {notificacoes.map((n) => (
        <ItemNotificacao key={`${n.id}-${n.versao}`} notificacao={n} />
      ))}
    </div>
  )
}

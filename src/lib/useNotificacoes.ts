'use client'

import { useSyncExternalStore } from 'react'
import { assinar, obterNotificacoes, Notificacao, SNAPSHOT_SERVIDOR } from '@/services/notificacoesService'

export function useNotificacoes(): Notificacao[] {
  return useSyncExternalStore(assinar, obterNotificacoes, () => SNAPSHOT_SERVIDOR)
}

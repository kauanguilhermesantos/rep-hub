"use client"

import { useCallback, useEffect, useState } from "react"

export type VisualizacaoViagens = "cards" | "lista"

const CHAVE = "rephub:viagens-visualizacao"

function ler(): VisualizacaoViagens {
  try {
    return localStorage.getItem(CHAVE) === "lista" ? "lista" : "cards"
  } catch {
    return "cards"
  }
}

// Preferência cards/lista da tela de Viagens: lembrada no navegador (mesmo padrão do
// "ocultar valores"). Começa em "cards" e só depois lê o navegador, para não divergir do HTML do servidor.
export function useVisualizacaoViagens() {
  const [visualizacao, setVisualizacaoEstado] = useState<VisualizacaoViagens>("cards")

  useEffect(() => {
    setVisualizacaoEstado(ler())
  }, [])

  const definir = useCallback((nova: VisualizacaoViagens) => {
    setVisualizacaoEstado(nova)
    try {
      localStorage.setItem(CHAVE, nova)
    } catch {
      // sem acesso ao armazenamento: vale só enquanto a página estiver aberta
    }
  }, [])

  return { visualizacao, definir }
}

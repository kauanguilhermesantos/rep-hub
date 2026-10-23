"use client"

import { useCallback, useEffect, useState } from "react"

const CHAVE = "rephub:ocultar-valores"
const EVENTO = "rephub:ocultar-valores-change"

function ler(): boolean {
  try {
    return localStorage.getItem(CHAVE) === "1"
  } catch {
    return false
  }
}

// Preferência "ocultar valores sensíveis": lembrada no navegador e compartilhada
// entre as telas (Dashboard, Pedidos, Relatórios) e entre abas abertas.
export function useOcultarValores() {
  // Começa visível e só depois lê o navegador, para não divergir do HTML do servidor
  const [oculto, setOculto] = useState(false)

  useEffect(() => {
    setOculto(ler())
    const atualizar = () => setOculto(ler())
    window.addEventListener(EVENTO, atualizar)
    window.addEventListener("storage", atualizar)
    return () => {
      window.removeEventListener(EVENTO, atualizar)
      window.removeEventListener("storage", atualizar)
    }
  }, [])

  const alternar = useCallback(() => {
    const novo = !ler()
    try {
      localStorage.setItem(CHAVE, novo ? "1" : "0")
    } catch {
      // sem acesso ao armazenamento: vale só para esta sessão
    }
    setOculto(novo)
    window.dispatchEvent(new Event(EVENTO))
  }, [])

  return { oculto, alternar }
}

export const VALOR_OCULTO = "••••••"
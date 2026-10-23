"use client"

import { Eye, EyeOff } from "lucide-react"

interface BotaoOcultarValoresProps {
  oculto: boolean
  onClick: () => void
}

// "Olhinho" que oculta/mostra os valores sensíveis (pares, pedidos, vendas e comissão)
export default function BotaoOcultarValores({ oculto, onClick }: BotaoOcultarValoresProps) {
  const texto = oculto ? "Mostrar valores" : "Ocultar valores"

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={oculto}
      aria-label={texto}
      title={texto}
      className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      {oculto ? <EyeOff size={18} /> : <Eye size={18} />}
      <span className="hidden sm:inline">{texto}</span>
    </button>
  )
}
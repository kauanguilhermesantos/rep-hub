'use client'

import { LayoutGrid, List } from 'lucide-react'

interface AlternadorVisualizacaoProps {
  valor: 'cards' | 'lista'
  onChange: (valor: 'cards' | 'lista') => void
}

// Mesmo visual do alternador de cards/lista da página de pedidos, com rótulos de acessibilidade
export default function AlternadorVisualizacao({ valor, onChange }: AlternadorVisualizacaoProps) {
  const classe = (ativo: boolean) =>
    `p-2 rounded-md transition-colors ${ativo ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`

  return (
    <div role="group" aria-label="Modo de visualização" className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg self-end sm:self-auto">
      <button
        type="button"
        onClick={() => onChange('cards')}
        aria-pressed={valor === 'cards'}
        aria-label="Visualizar em cards"
        title="Visualizar em cards"
        className={classe(valor === 'cards')}
      >
        <LayoutGrid size={18} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => onChange('lista')}
        aria-pressed={valor === 'lista'}
        aria-label="Visualizar em lista"
        title="Visualizar em lista"
        className={classe(valor === 'lista')}
      >
        <List size={18} aria-hidden="true" />
      </button>
    </div>
  )
}

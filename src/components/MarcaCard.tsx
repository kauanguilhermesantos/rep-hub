import { Calendar, Edit2, Package, Trash2, X } from "lucide-react";
import { useState } from "react";

// Interface para tipagem das marcas
export interface Marca {
  id: string
  nome: string
  dataCadastro: string
  totalPedidos: number
}

// Modal de Edição
export const EditModal = ({ 
  isOpen, 
  onClose, 
  marca, 
  onSave 
}: { 
  isOpen: boolean
  onClose: () => void
  marca: Marca | null
  onSave: (id: string, novoNome: string) => void
}) => {
  const [nome, setNome] = useState(marca?.nome || '')

  if (!isOpen || !marca) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (nome.trim()) {
      onSave(marca.id, nome)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Editar Marca</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Marca
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Digite o nome da marca"
              autoFocus
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// modal de excluir marca
export const DeleteModal = ({
  isOpen,
  onClose,
    marca,
    onDelete
}: {
  isOpen: boolean
  onClose: () => void
    marca: Marca | null
    onDelete: (id: string) => void
}) => {
    if (!isOpen || !marca) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full animate-fade-in">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">Excluir Marca</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-gray-700 mb-6">Tem certeza que deseja excluir a marca <span className="font-semibold">{marca.nome}</span>? Esta ação não pode ser desfeita.</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                onDelete(marca.id)
                                onClose()
                            }}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function MarcaCard({ marca, onEdit, onDelete }: { marca: any, onEdit: (marca: any) => void, onDelete: (id: string) => void }) {
    return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="p-6">
        {/* Cabeçalho do Card */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar com gradiente */}
            <div className={`w-14 h-14 rounded-xl  bg-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-sm`}>
              {marca.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">{marca.nome}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <Calendar size={14} />
                <span>{marca.dataCadastro}</span>
              </div>
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(marca)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar marca"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => onDelete(marca.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Excluir marca"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Informações da marca */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <Package size={18} className="text-gray-400" />
            <span className="text-sm font-medium">Total de pedidos</span>
          </div>
          <span className="font-semibold text-gray-800 text-lg">
            {marca.totalPedidos}
          </span>
        </div>
      </div>
    </div>
  )
}
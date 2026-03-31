'use client'

import { useState } from 'react'
import { 
  Tag, 
  Plus, 
  Search,
  X
} from 'lucide-react'
import MarcaCard, { DeleteModal, EditModal, Marca } from '@/components/MarcaCard'

export default function MarcasPage() {
  // Dados mockados
  const [marcas, setMarcas] = useState<Marca[]>([
    {
      id: '1',
      nome: 'Nike',
      dataCadastro: '10/03/2026',
      totalPedidos: 45
    },
    {
      id: '2',
      nome: 'Adidas',
      dataCadastro: '12/03/2026',
      totalPedidos: 38
    },
    {
      id: '3',
      nome: 'Puma',
      dataCadastro: '15/03/2026',
      totalPedidos: 28
    },
    {
      id: '4',
      nome: 'Vans',
      dataCadastro: '18/03/2026',
      totalPedidos: 22
    },
    {
      id: '5',
      nome: 'Oakley',
      dataCadastro: '20/03/2026',
      totalPedidos: 15
    },
    {
      id: '6',
      nome: 'New Balance',
      dataCadastro: '22/03/2026',
      totalPedidos: 19
    }
  ])

  const [novaMarca, setNovaMarca] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [marcaParaEditar, setMarcaParaEditar] = useState<Marca | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [marcaParaExcluir, setMarcaParaExcluir] = useState<Marca | null>(null)

  // Função para adicionar nova marca
  const handleAddMarca = (e: React.FormEvent) => {
    e.preventDefault()
    if (novaMarca.trim()) {
      const nova: Marca = {
        id: Date.now().toString(),
        nome: novaMarca,
        dataCadastro: new Date().toLocaleDateString('pt-BR'),
        totalPedidos: 0
      }
      setMarcas([nova, ...marcas])
      setNovaMarca('')
    }
  }

  // Função para editar marca
  const handleEditMarca = (marca: Marca) => {
    setMarcaParaEditar(marca)
    setEditModalOpen(true)
  }

  // Função para salvar edição
  const handleSaveEdit = (id: string, novoNome: string) => {
    setMarcas(marcas.map(marca => 
      marca.id === id ? { ...marca, nome: novoNome } : marca
    ))
  }

  // Função para deletar marca
  const handleDeleteMarca = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta marca?')) {
      setMarcas(marcas.filter(marca => marca.id !== id))
    }
  }

  // Filtragem de marcas
  const marcasFiltradas = marcas.filter(marca =>
    marca.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Marcas</h1>
        <p className="text-gray-600 mt-1">
          Gerencie as marcas que você trabalha
        </p>
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Formulário de cadastro */}
        <form onSubmit={handleAddMarca} className="flex-1 flex gap-2 w-full sm:max-w-md">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={novaMarca}
              onChange={(e) => setNovaMarca(e.target.value)}
              placeholder="Nome da marca"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
            <button
              type="submit"
              disabled={!novaMarca.trim()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
              Adicionar
            </button>
        </form>

        {/* Busca */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar marcas..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total de Marcas</p>
          <p className="text-2xl font-bold text-gray-800">{marcas.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total de Pedidos</p>
          <p className="text-2xl font-bold text-gray-800">
            {marcas.reduce((acc, marca) => acc + marca.totalPedidos, 0)}
          </p>
        </div>
      </div>

      {/* Grid de Marcas */}
      {marcasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marcasFiltradas.map((marca) => (
            <MarcaCard
              key={marca.id}
              marca={marca}
              onEdit={handleEditMarca}
              onDelete={handleDeleteMarca}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Tag className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {searchTerm ? 'Nenhuma marca encontrada' : 'Nenhuma marca cadastrada'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Tente buscar por outro termo' 
              : 'Comece adicionando sua primeira marca'}
          </p>
        </div>
      )}

      {/* Modal de Edição */}
      <EditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setMarcaParaEditar(null)
        }}
        marca={marcaParaEditar}
        onSave={handleSaveEdit}
      />
      {/* Modal de Exclusão */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setMarcaParaExcluir(null)
        }}
        marca={marcaParaExcluir}
        onDelete={handleDeleteMarca}
      />
    </div>
  )
}
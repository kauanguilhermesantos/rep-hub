'use client'

import { useState, useEffect } from 'react'
import {
  Tag,
  Plus,
  Search,
  AlertCircle
} from 'lucide-react'
import MarcaCard, { DeleteModal, EditModal, Marca } from '@/components/MarcaCard'
import { listarMarcas, criarMarca, editarMarca, excluirMarca } from '@/services/marcaService'

export default function MarcasPage() {
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarregamento, setErroCarregamento] = useState('')
  const [mensagem, setMensagem] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null)

  const [novaMarca, setNovaMarca] = useState('')
  const [adicionando, setAdicionando] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [marcaParaEditar, setMarcaParaEditar] = useState<Marca | null>(null)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [marcaParaExcluir, setMarcaParaExcluir] = useState<Marca | null>(null)

  // Carrega as marcas reais do backend ao abrir a página
  useEffect(() => {
    listarMarcas()
      .then(setMarcas)
      .catch(() => setErroCarregamento('Não foi possível carregar as marcas. Tente recarregar a página.'))
      .finally(() => setCarregando(false))
  }, [])

  function mostrarErro(texto: string) {
    setMensagem({ tipo: 'error', texto })
    setTimeout(() => setMensagem(null), 4000)
  }

  // Adicionar nova marca
  const handleAddMarca = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novaMarca.trim() || adicionando) return

    setAdicionando(true)
    try {
      const criada = await criarMarca(novaMarca.trim())
      setMarcas(prev => [criada, ...prev])
      setNovaMarca('')
    } catch (err) {
      mostrarErro(err instanceof Error ? err.message : 'Não foi possível criar a marca')
    } finally {
      setAdicionando(false)
    }
  }

  // Abre o modal de edição
  const handleEditMarca = (marca: Marca) => {
    setMarcaParaEditar(marca)
    setEditModalOpen(true)
  }

  // Salva a edição (chamado pelo EditModal)
  const handleSaveEdit = async (id: string, novoNome: string) => {
    try {
      const atualizada = await editarMarca(id, novoNome)
      setMarcas(prev => prev.map(marca => (marca.id === id ? atualizada : marca)))
    } catch (err) {
      mostrarErro(err instanceof Error ? err.message : 'Não foi possível editar a marca')
    }
  }

  // Abre o modal de confirmação de exclusão (em vez de excluir direto)
  const handleRequestDelete = (id: string) => {
    const marca = marcas.find(m => m.id === id) || null
    setMarcaParaExcluir(marca)
    setDeleteModalOpen(true)
  }

  // Exclui de fato (chamado pelo DeleteModal, após confirmação)
  const handleConfirmDelete = async (id: string) => {
    try {
      await excluirMarca(id)
      setMarcas(prev => prev.filter(marca => marca.id !== id))
    } catch (err) {
      mostrarErro(err instanceof Error ? err.message : 'Não foi possível excluir a marca')
    }
  }

  // Filtragem de marcas
  const marcasFiltradas = marcas.filter(marca =>
    marca.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (erroCarregamento) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
        <AlertCircle size={20} />
        <span>{erroCarregamento}</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Marcas</h1>
        <p className="text-gray-600 mt-1">
          Gerencie as marcas que você trabalha
        </p>
      </div>

      {/* Mensagem de feedback (erros de criar/editar/excluir) */}
      {mensagem && (
        <div className="p-4 rounded-lg flex items-center gap-2 bg-red-50 text-red-700">
          <AlertCircle size={20} />
          <span>{mensagem.texto}</span>
        </div>
      )}

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
            disabled={!novaMarca.trim() || adicionando}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            {adicionando ? 'Adicionando...' : 'Adicionar'}
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
              onDelete={handleRequestDelete}
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
        onDelete={handleConfirmDelete}
      />
    </div>
  )
}
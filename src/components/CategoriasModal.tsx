'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import Modal from '@/components/Modal'
import {
  atualizarCategoria, CategoriaDespesa, criarCategoria, excluirCategoria,
  listarCategorias, MAX_NOME_CATEGORIA, validarNomeCategoria,
} from '@/services/categoriasService'
import { notificar } from '@/services/notificacoesService'

interface CategoriasModalProps {
  isOpen: boolean
  // Informa se algo mudou (criar/renomear/excluir), para a tela recarregar os nomes exibidos
  onClose: (alterou: boolean) => void
}

const inputClass = (erro?: string) =>
  `w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 outline-none transition-colors bg-white ${
    erro
      ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
  }`

export default function CategoriasModal({ isOpen, onClose }: CategoriasModalProps) {
  const [categorias, setCategorias] = useState<CategoriaDespesa[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erroCarga, setErroCarga] = useState('')

  const [novoNome, setNovoNome] = useState('')
  const [erroNovo, setErroNovo] = useState('')
  const [criando, setCriando] = useState(false)

  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [nomeEdicao, setNomeEdicao] = useState('')
  const [erroEdicao, setErroEdicao] = useState('')
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)
  const [excluindoId, setExcluindoId] = useState<string | null>(null)

  const alterou = useRef(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErroCarga('')
    try {
      setCategorias(await listarCategorias())
    } catch (err) {
      setErroCarga(err instanceof Error ? err.message : 'Não foi possível carregar as categorias')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    alterou.current = false
    setNovoNome('')
    setErroNovo('')
    setEditandoId(null)
    setErroEdicao('')
    carregar()
  }, [isOpen, carregar])

  async function criar() {
    const erro = validarNomeCategoria(novoNome)
    if (erro) {
      setErroNovo(erro)
      return
    }
    setCriando(true)
    setErroNovo('')
    try {
      const nova = await criarCategoria(novoNome.trim())
      alterou.current = true
      setNovoNome('')
      notificar.sucesso(`Categoria "${nova.nome}" criada.`)
      await carregar()
    } catch (err) {
      setErroNovo(err instanceof Error ? err.message : 'Não foi possível criar a categoria')
    } finally {
      setCriando(false)
    }
  }

  function iniciarEdicao(c: CategoriaDespesa) {
    setEditandoId(c.id)
    setNomeEdicao(c.nome)
    setErroEdicao('')
  }

  async function salvarEdicao(c: CategoriaDespesa) {
    const erro = validarNomeCategoria(nomeEdicao)
    if (erro) {
      setErroEdicao(erro)
      return
    }
    setSalvandoEdicao(true)
    setErroEdicao('')
    try {
      await atualizarCategoria(c.id, nomeEdicao.trim())
      alterou.current = true
      setEditandoId(null)
      notificar.sucesso('Categoria atualizada.')
      await carregar()
    } catch (err) {
      setErroEdicao(err instanceof Error ? err.message : 'Não foi possível salvar a categoria')
    } finally {
      setSalvandoEdicao(false)
    }
  }

  async function excluir(c: CategoriaDespesa) {
    if (!window.confirm(`Excluir a categoria "${c.nome}"?`)) return
    setExcluindoId(c.id)
    try {
      await excluirCategoria(c.id)
      alterou.current = true
      notificar.sucesso(`Categoria "${c.nome}" excluída.`)
      await carregar()
    } catch (err) {
      // Ex.: categoria em uso por despesas — o backend informa o motivo
      notificar.erro(err instanceof Error ? err.message : 'Não foi possível excluir a categoria', 8000)
      await carregar()
    } finally {
      setExcluindoId(null)
    }
  }

  const fechar = () => onClose(alterou.current)
  const padrao = categorias.filter((c) => c.padrao)
  const personalizadas = categorias.filter((c) => !c.padrao)

  return (
    <Modal isOpen={isOpen} onClose={fechar} title="Categorias de despesa" larguraMaxima="max-w-xl">
      <div className="space-y-5">
        {/* Nova categoria */}
        <div>
          <label htmlFor="nova-categoria" className="block text-sm font-medium text-gray-700 mb-2">Nova categoria</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="nova-categoria"
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  criar()
                }
              }}
              maxLength={MAX_NOME_CATEGORIA + 10}
              aria-invalid={!!erroNovo}
              placeholder="Ex.: Pedágio"
              className={inputClass(erroNovo)}
            />
            <button
              type="button"
              onClick={criar}
              disabled={criando}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
            >
              {criando ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
              Adicionar
            </button>
          </div>
          {erroNovo && <p role="alert" className="text-xs text-red-600 mt-1">{erroNovo}</p>}
        </div>

        {carregando && categorias.length === 0 ? (
          <div className="flex justify-center py-8" role="status" aria-live="polite">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            <span className="sr-only">Carregando categorias…</span>
          </div>
        ) : erroCarga && categorias.length === 0 ? (
          <div role="alert" className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <div className="flex items-start gap-2 min-w-0">
              <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
              <span className="wrap-break-word">{erroCarga}</span>
            </div>
            <button type="button" onClick={carregar} className="sm:ml-auto px-3 py-1.5 font-medium bg-white border border-red-300 rounded-lg hover:bg-red-100">
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            <section aria-labelledby="cat-personalizadas">
              <h4 id="cat-personalizadas" className="text-sm font-medium text-gray-500 mb-2">Minhas categorias</h4>
              {personalizadas.length === 0 ? (
                <p className="text-sm text-gray-500 py-3">Você ainda não criou categorias. Use o campo acima para adicionar a primeira.</p>
              ) : (
                <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
                  {personalizadas.map((c) => (
                    <li key={c.id} className="p-3 min-w-0">
                      {editandoId === c.id ? (
                        <div className="space-y-2">
                          <label htmlFor={`edit-${c.id}`} className="sr-only">Nome da categoria</label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              id={`edit-${c.id}`}
                              type="text"
                              value={nomeEdicao}
                              onChange={(e) => setNomeEdicao(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  salvarEdicao(c)
                                } else if (e.key === 'Escape') setEditandoId(null)
                              }}
                              maxLength={MAX_NOME_CATEGORIA + 10}
                              autoFocus
                              aria-invalid={!!erroEdicao}
                              className={inputClass(erroEdicao)}
                            />
                            <div className="flex gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => salvarEdicao(c)}
                                disabled={salvandoEdicao}
                                aria-label="Salvar nome da categoria"
                                className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                              >
                                {salvandoEdicao ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
                                Salvar
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditandoId(null)}
                                disabled={salvandoEdicao}
                                aria-label="Cancelar edição"
                                className="px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                              >
                                <X size={16} aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                          {erroEdicao && <p role="alert" className="text-xs text-red-600">{erroEdicao}</p>}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="flex-1 min-w-0 text-sm font-medium text-gray-800 wrap-break-word">{c.nome}</span>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 shrink-0">Personalizada</span>
                          <button
                            type="button"
                            onClick={() => iniciarEdicao(c)}
                            aria-label={`Editar categoria ${c.nome}`}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            <Pencil size={16} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => excluir(c)}
                            disabled={excluindoId === c.id}
                            aria-label={`Excluir categoria ${c.nome}`}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="cat-padrao">
              <h4 id="cat-padrao" className="text-sm font-medium text-gray-500 mb-2">Categorias padrão</h4>
              <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
                {padrao.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 p-3">
                    <span className="flex-1 min-w-0 text-sm text-gray-800">{c.nome}</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 shrink-0">Padrão</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-400 mt-2">As categorias padrão ficam disponíveis para todos e não podem ser editadas nem excluídas.</p>
            </section>
          </>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={fechar}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  )
}

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, Loader2, Plus } from 'lucide-react'
import Modal from '@/components/Modal'
import { ApiError } from '@/lib/ApiError'
import { Despesa, DespesaPayload, interpretarValor } from '@/services/despesasService'
import { CategoriaDespesa, criarCategoria, listarCategorias, MAX_NOME_CATEGORIA, validarNomeCategoria } from '@/services/categoriasService'
import { notificar } from '@/services/notificacoesService'
import { hojeIso } from '@/lib/formatoHora'

interface DespesaModalProps {
  isOpen: boolean
  onClose: () => void
  // Se informada, o modal edita essa despesa; senão, cadastra uma nova
  despesa?: Despesa | null
  // Deve lançar erro em caso de falha (a mensagem do backend é exibida aqui)
  onSave: (payload: DespesaPayload) => Promise<void>
}

// Valor especial do <select> que abre o cadastro de categoria dentro do próprio formulário
const NOVA_CATEGORIA = '__nova__'

const MAX_DESCRICAO = 200
const MAX_OBSERVACOES = 500

const inputClass = (erro?: string) =>
  `w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors bg-white ${
    erro
      ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
  }`

function valorParaCampo(valor: number): string {
  return valor.toFixed(2).replace('.', ',')
}

export default function DespesaModal({ isOpen, onClose, despesa, onSave }: DespesaModalProps) {
  const editando = !!despesa

  const [categoria, setCategoria] = useState('') // id da categoria, ou '' / NOVA_CATEGORIA
  const [categorias, setCategorias] = useState<CategoriaDespesa[]>([])
  const [carregandoCategorias, setCarregandoCategorias] = useState(false)
  const [erroCategorias, setErroCategorias] = useState('')
  const [nomeNovaCategoria, setNomeNovaCategoria] = useState('')
  const [erroNovaCategoria, setErroNovaCategoria] = useState('')
  const [criandoCategoria, setCriandoCategoria] = useState(false)
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [data, setData] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [erros, setErros] = useState<Record<string, string>>({})
  const [erroGeral, setErroGeral] = useState('')
  const [salvando, setSalvando] = useState(false)
  const enviando = useRef(false)

  const carregarCategorias = useCallback(async () => {
    setCarregandoCategorias(true)
    setErroCategorias('')
    try {
      setCategorias(await listarCategorias())
    } catch (err) {
      setErroCategorias(err instanceof Error ? err.message : 'Não foi possível carregar as categorias')
    } finally {
      setCarregandoCategorias(false)
    }
  }, [])

  // Preenche (ou zera) o formulário toda vez que o modal abre
  useEffect(() => {
    if (!isOpen) return
    carregarCategorias()
    setNomeNovaCategoria('')
    setErroNovaCategoria('')
    setCategoria(despesa?.categoria ?? '')
    setDescricao(despesa?.descricao ?? '')
    setValor(despesa ? valorParaCampo(despesa.valor) : '')
    setData(despesa?.data?.slice(0, 10) ?? hojeIso())
    setObservacoes(despesa?.observacoes ?? '')
    setErros({})
    setErroGeral('')
    setSalvando(false)
    enviando.current = false
  }, [isOpen, despesa, carregarCategorias])

  function validar(): Record<string, string> {
    const novos: Record<string, string> = {}
    if (!categoria || categoria === NOVA_CATEGORIA) novos.categoria = 'Selecione uma categoria'

    if (!descricao.trim()) novos.descricao = 'A descrição é obrigatória'
    else if (descricao.trim().length > MAX_DESCRICAO) novos.descricao = `A descrição deve ter no máximo ${MAX_DESCRICAO} caracteres`

    const numero = interpretarValor(valor)
    if (!valor.trim()) novos.valor = 'O valor é obrigatório'
    else if (numero === null) novos.valor = 'Informe um valor válido, com no máximo 2 casas decimais'
    else if (numero <= 0) novos.valor = 'O valor deve ser maior que zero'
    else if (numero >= 100000000) novos.valor = 'Valor muito alto'

    if (!data) novos.data = 'A data da despesa é obrigatória'
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) novos.data = 'Informe uma data válida'
    else if (data > hojeIso()) novos.data = 'A data da despesa não pode ser futura'

    if (observacoes.length > MAX_OBSERVACOES) novos.observacoes = `As observações devem ter no máximo ${MAX_OBSERVACOES} caracteres`
    return novos
  }

  async function criarNovaCategoria() {
    const erroNome = validarNomeCategoria(nomeNovaCategoria)
    if (erroNome) {
      setErroNovaCategoria(erroNome)
      return
    }
    setCriandoCategoria(true)
    setErroNovaCategoria('')
    try {
      const nova = await criarCategoria(nomeNovaCategoria.trim())
      // Atualiza a lista a partir do backend e já deixa a nova categoria selecionada
      await carregarCategorias()
      setCategoria(nova.id)
      setNomeNovaCategoria('')
      setErros((e) => ({ ...e, categoria: '' }))
      notificar.sucesso(`Categoria "${nova.nome}" criada.`)
    } catch (err) {
      setErroNovaCategoria(err instanceof Error ? err.message : 'Não foi possível criar a categoria')
    } finally {
      setCriandoCategoria(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (enviando.current) return

    setErroGeral('')
    const novos = validar()
    setErros(novos)
    if (Object.keys(novos).length > 0) return

    enviando.current = true
    setSalvando(true)
    try {
      await onSave({
        categoria,
        descricao: descricao.trim(),
        valor: interpretarValor(valor) as number,
        data,
        observacoes: observacoes.trim() ? observacoes.trim() : null,
      })
      onClose()
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setErros(err.fieldErrors)
      setErroGeral(err instanceof Error ? err.message : 'Não foi possível salvar a despesa')
    } finally {
      enviando.current = false
      setSalvando(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={salvando ? () => {} : onClose} title={editando ? 'Editar despesa' : 'Nova despesa'}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {erroGeral && (
          <div role="alert" className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span className="wrap-break-word">{erroGeral}</span>
          </div>
        )}

        <div>
          <label htmlFor="desp-categoria" className="block text-sm font-medium text-gray-700 mb-2">
            Categoria <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <select
            id="desp-categoria"
            value={categoria}
            onChange={(e) => {
              setCategoria(e.target.value)
              setErroNovaCategoria('')
            }}
            required
            disabled={carregandoCategorias && categorias.length === 0}
            aria-invalid={!!erros.categoria}
            className={inputClass(erros.categoria)}
          >
            <option value="">{carregandoCategorias && categorias.length === 0 ? 'Carregando categorias…' : 'Selecione a categoria'}</option>
            {/* Despesa antiga cuja categoria não existe mais: mantém a seleção atual visível */}
            {despesa && categoria === despesa.categoria && !categorias.some((c) => c.id === despesa.categoria) && !carregandoCategorias && (
              <option value={despesa.categoria}>{despesa.categoriaNome}</option>
            )}
            {categorias.some((c) => c.padrao) && (
              <optgroup label="Padrão">
                {categorias.filter((c) => c.padrao).map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </optgroup>
            )}
            {categorias.some((c) => !c.padrao) && (
              <optgroup label="Minhas categorias">
                {categorias.filter((c) => !c.padrao).map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </optgroup>
            )}
            <option value={NOVA_CATEGORIA}>+ Nova categoria…</option>
          </select>
          {erros.categoria && <p className="text-xs text-red-600 mt-1">{erros.categoria}</p>}
          {erroCategorias && (
            <p className="text-xs text-red-600 mt-1">
              {erroCategorias}{' '}
              <button type="button" className="underline" onClick={carregarCategorias}>Tentar novamente</button>
            </p>
          )}

          {categoria === NOVA_CATEGORIA && (
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
              <label htmlFor="desp-nova-categoria" className="block text-sm font-medium text-gray-700">
                Nome da nova categoria
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="desp-nova-categoria"
                  type="text"
                  value={nomeNovaCategoria}
                  onChange={(e) => setNomeNovaCategoria(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter cria a categoria sem enviar o formulário de despesa
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      criarNovaCategoria()
                    }
                  }}
                  maxLength={MAX_NOME_CATEGORIA + 10}
                  aria-invalid={!!erroNovaCategoria}
                  placeholder="Ex.: Pedágio"
                  className={inputClass(erroNovaCategoria)}
                />
                <button
                  type="button"
                  onClick={criarNovaCategoria}
                  disabled={criandoCategoria}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                >
                  {criandoCategoria ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                  Criar
                </button>
              </div>
              {erroNovaCategoria && <p role="alert" className="text-xs text-red-600">{erroNovaCategoria}</p>}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="desp-descricao" className="block text-sm font-medium text-gray-700 mb-2">
            Descrição <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="desp-descricao"
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
            aria-invalid={!!erros.descricao}
            placeholder="Ex.: Almoço com cliente"
            className={inputClass(erros.descricao)}
          />
          {erros.descricao && <p className="text-xs text-red-600 mt-1">{erros.descricao}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="desp-valor" className="block text-sm font-medium text-gray-700 mb-2">
              Valor (R$) <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="desp-valor"
              type="text"
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
              aria-invalid={!!erros.valor}
              placeholder="0,00"
              className={inputClass(erros.valor)}
            />
            {erros.valor && <p className="text-xs text-red-600 mt-1">{erros.valor}</p>}
          </div>

          <div>
            <label htmlFor="desp-data" className="block text-sm font-medium text-gray-700 mb-2">
              Data <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="desp-data"
              type="date"
              value={data}
              max={hojeIso()}
              onChange={(e) => setData(e.target.value)}
              required
              aria-invalid={!!erros.data}
              className={inputClass(erros.data)}
            />
            {erros.data && <p className="text-xs text-red-600 mt-1">{erros.data}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="desp-obs" className="block text-sm font-medium text-gray-700 mb-2">
            Observações <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            id="desp-obs"
            rows={3}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            aria-invalid={!!erros.observacoes}
            className={inputClass(erros.observacoes)}
          />
          {erros.observacoes && <p className="text-xs text-red-600 mt-1">{erros.observacoes}</p>}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {salvando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {salvando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Adicionar despesa'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

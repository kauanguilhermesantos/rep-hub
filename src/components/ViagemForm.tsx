'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowDown, ArrowUp, Info, Loader2, Plus, X } from 'lucide-react'
import SeletorEstadoCidade from '@/components/SeletorEstadoCidade'
import { ApiError } from '@/lib/ApiError'
import { Viagem, ViagemPayload } from '@/services/viagensService'
import { formatarDataIso, formatarDataHora } from '@/lib/formatoHora'

const MAX_TITULO = 120
const MAX_OBSERVACOES = 1000
const MAX_MUNICIPIOS = 30

interface ViagemFormProps {
  modo: 'criar' | 'editar'
  inicial?: Viagem
  // Deve lançar erro em caso de falha (o formulário mostra a mensagem do backend)
  onSubmit: (payload: ViagemPayload) => Promise<void>
  cancelarHref: string
}

type Erros = Record<string, string>

function dataValida(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false
  const [ano, mes, dia] = valor.split('-').map(Number)
  if (ano < 2000 || ano > 2100) return false
  const d = new Date(ano, mes - 1, dia)
  return d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia
}

const inputClass = (erro?: string) =>
  `w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors bg-white ${
    erro
      ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
  }`

export default function ViagemForm({ modo, inicial, onSubmit, cancelarHref }: ViagemFormProps) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '')
  const [dataInicio, setDataInicio] = useState(inicial?.dataInicio?.slice(0, 10) ?? '')
  const [observacoes, setObservacoes] = useState(inicial?.observacoes ?? '')
  const [roteiro, setRoteiro] = useState<string[]>(inicial?.roteiro ?? [])
  const [estado, setEstado] = useState('')
  const [cidade, setCidade] = useState('')

  const [erros, setErros] = useState<Erros>({})
  const [erroGeral, setErroGeral] = useState('')
  const [salvando, setSalvando] = useState(false)
  const enviando = useRef(false) // trava síncrona contra duplo clique/Enter

  const finalizada = inicial?.status === 'FINALIZADA'

  function adicionarMunicipio() {
    if (!estado || !cidade) return
    if (roteiro.length >= MAX_MUNICIPIOS) {
      setErros((e) => ({ ...e, roteiro: `O roteiro pode ter no máximo ${MAX_MUNICIPIOS} municípios` }))
      return
    }
    setRoteiro((r) => [...r, `${cidade} - ${estado}`])
    setCidade('') // mantém o estado para facilitar vários municípios do mesmo estado
    setErros((e) => {
      const resto = { ...e }
      delete resto.roteiro
      return resto
    })
  }

  function mover(indice: number, delta: -1 | 1) {
    setRoteiro((r) => {
      const destino = indice + delta
      if (destino < 0 || destino >= r.length) return r
      const copia = [...r]
      ;[copia[indice], copia[destino]] = [copia[destino], copia[indice]]
      return copia
    })
  }

  function validar(): Erros {
    const novos: Erros = {}
    if (!titulo.trim()) novos.titulo = 'O título é obrigatório'
    else if (titulo.trim().length > MAX_TITULO) novos.titulo = `O título deve ter no máximo ${MAX_TITULO} caracteres`

    if (!dataInicio) novos.dataInicio = 'A data de início é obrigatória'
    else if (!dataValida(dataInicio)) novos.dataInicio = 'Informe uma data válida'
    else if (finalizada && inicial?.dataFinalizacao && dataInicio > inicial.dataFinalizacao.slice(0, 10)) {
      novos.dataInicio = 'A data de início não pode ser posterior à data de finalização'
    }

    if (observacoes.length > MAX_OBSERVACOES) {
      novos.observacoes = `As observações devem ter no máximo ${MAX_OBSERVACOES} caracteres`
    }
    return novos
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
      await onSubmit({
        titulo: titulo.trim(),
        roteiro,
        dataInicio,
        observacoes: observacoes.trim() ? observacoes.trim() : null,
      })
      // Em caso de sucesso a página navega; mantém o botão travado até lá
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setErros(err.fieldErrors)
      setErroGeral(err instanceof Error ? err.message : 'Não foi possível salvar a viagem')
      enviando.current = false
      setSalvando(false)
    }
  }

  const erroRoteiro =
    erros.roteiro ?? Object.entries(erros).find(([chave]) => chave.startsWith('roteiro'))?.[1]

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-6 max-w-3xl">
      {finalizada && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
          <Info size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Esta viagem foi finalizada em {formatarDataHora(inicial?.dataFinalizacao ?? undefined)}. Você ainda pode
            editar os dados gerais; o status e a data de finalização não mudam.
          </span>
        </div>
      )}

      {erroGeral && (
        <div role="alert" className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span className="wrap-break-word">{erroGeral}</span>
        </div>
      )}

      {/* Título */}
      <div>
        <label htmlFor="viagem-titulo" className="block text-sm font-medium text-gray-700 mb-2">
          Título ou descrição <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="viagem-titulo"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={MAX_TITULO + 20}
          required
          aria-required="true"
          aria-invalid={!!erros.titulo}
          aria-describedby={erros.titulo ? 'viagem-titulo-erro' : undefined}
          placeholder="Ex.: Rota Norte — outubro"
          className={inputClass(erros.titulo)}
        />
        {erros.titulo && <p id="viagem-titulo-erro" className="text-xs text-red-600 mt-1">{erros.titulo}</p>}
      </div>

      {/* Data de início */}
      <div>
        <label htmlFor="viagem-data" className="block text-sm font-medium text-gray-700 mb-2">
          Data de início <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="viagem-data"
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          required
          aria-required="true"
          aria-invalid={!!erros.dataInicio}
          aria-describedby={erros.dataInicio ? 'viagem-data-erro' : undefined}
          className={`${inputClass(erros.dataInicio)} sm:max-w-xs`}
        />
        {erros.dataInicio && <p id="viagem-data-erro" className="text-xs text-red-600 mt-1">{erros.dataInicio}</p>}
      </div>

      {/* Roteiro */}
      <fieldset className="space-y-3 min-w-0">
        <legend className="block text-sm font-medium text-gray-700">
          Municípios visitados <span className="text-gray-400 font-normal">(opcional, em ordem)</span>
        </legend>

        {roteiro.length > 0 && (
          <ol className="space-y-2">
            {roteiro.map((municipio, i) => (
              <li key={`${municipio}-${i}`} className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg min-w-0">
                <span className="w-6 text-sm text-gray-500 shrink-0">{i + 1}.</span>
                <span className="flex-1 text-sm text-gray-800 wrap-break-word min-w-0">{municipio}</span>
                <button
                  type="button"
                  onClick={() => mover(i, -1)}
                  disabled={i === 0}
                  aria-label={`Mover ${municipio} para cima`}
                  className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowUp size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => mover(i, 1)}
                  disabled={i === roteiro.length - 1}
                  aria-label={`Mover ${municipio} para baixo`}
                  className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowDown size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setRoteiro((r) => r.filter((_, idx) => idx !== i))}
                  aria-label={`Remover ${municipio} do roteiro`}
                  className="p-1.5 rounded text-red-600 hover:bg-red-50"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SeletorEstadoCidade
            estado={estado}
            cidade={cidade}
            onChange={(uf, nome) => {
              setEstado(uf)
              setCidade(nome)
            }}
          />
        </div>
        <button
          type="button"
          onClick={adicionarMunicipio}
          disabled={!estado || !cidade}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={16} aria-hidden="true" />
          Adicionar ao roteiro
        </button>
        {erroRoteiro && <p className="text-xs text-red-600">{erroRoteiro}</p>}
      </fieldset>

      {/* Observações */}
      <div>
        <label htmlFor="viagem-obs" className="block text-sm font-medium text-gray-700 mb-2">
          Observações <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          id="viagem-obs"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={4}
          aria-invalid={!!erros.observacoes}
          className={inputClass(erros.observacoes)}
        />
        <div className="flex justify-between text-xs mt-1">
          <span className="text-red-600">{erros.observacoes}</span>
          <span className={observacoes.length > MAX_OBSERVACOES ? 'text-red-600' : 'text-gray-400'}>
            {observacoes.length}/{MAX_OBSERVACOES}
          </span>
        </div>
      </div>

      {modo === 'editar' && inicial && (
        <p className="text-xs text-gray-500">
          Início atual: {formatarDataIso(inicial.dataInicio)}
        </p>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <Link
          href={cancelarHref}
          className="px-4 py-2 text-center text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={salvando}
          className="flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {salvando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          {salvando ? 'Salvando…' : modo === 'criar' ? 'Cadastrar viagem' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  )
}

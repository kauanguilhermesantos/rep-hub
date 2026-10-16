'use client'

import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { ESTADOS, listarCidades } from '@/lib/localidades'

interface SeletorEstadoCidadeProps {
  estado: string
  cidade: string
  onChange: (estado: string, cidade: string) => void
  obrigatorio?: boolean
  erroEstado?: string
  erroCidade?: string
}

const selectClass = (erro?: string) =>
  `w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-400 ${
    erro
      ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
  }`

// Select de estado + select de cidade; a lista de cidades depende do estado escolhido
export default function SeletorEstadoCidade({
  estado,
  cidade,
  onChange,
  obrigatorio = false,
  erroEstado,
  erroCidade,
}: SeletorEstadoCidadeProps) {
  const [cidades, setCidades] = useState<string[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erroCarregamento, setErroCarregamento] = useState(false)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    if (!estado) {
      setCidades([])
      setErroCarregamento(false)
      return
    }

    let cancelado = false
    setCarregando(true)
    setErroCarregamento(false)
    listarCidades(estado)
      .then((lista) => {
        if (!cancelado) setCidades(lista)
      })
      .catch(() => {
        if (!cancelado) {
          setCidades([])
          setErroCarregamento(true)
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => {
      cancelado = true
    }
  }, [estado, tentativa])

  // Pedidos antigos podem ter uma cidade sem estado/fora da lista: mantém como opção
  const opcoes = cidade && !cidades.includes(cidade) && !carregando ? [cidade, ...cidades] : cidades

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>Estado</span>
            {obrigatorio && <span className="text-red-500">*</span>}
          </div>
        </label>
        <select
          value={estado}
          onChange={(e) => onChange(e.target.value, '')}
          required={obrigatorio}
          className={selectClass(erroEstado)}
        >
          <option value="">Selecione o estado</option>
          {ESTADOS.map((e) => (
            <option key={e.uf} value={e.uf}>
              {e.nome} ({e.uf})
            </option>
          ))}
        </select>
        {erroEstado && <p className="text-xs text-red-600 mt-1">{erroEstado}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>Cidade</span>
            {obrigatorio && <span className="text-red-500">*</span>}
          </div>
        </label>
        <select
          value={cidade}
          onChange={(e) => onChange(estado, e.target.value)}
          required={obrigatorio}
          disabled={!estado || carregando}
          className={selectClass(erroCidade)}
        >
          <option value="">
            {!estado ? 'Selecione o estado primeiro' : carregando ? 'Carregando cidades...' : 'Selecione a cidade'}
          </option>
          {opcoes.map((nome) => (
            <option key={nome} value={nome}>
              {nome}
            </option>
          ))}
        </select>
        {erroCidade && <p className="text-xs text-red-600 mt-1">{erroCidade}</p>}
        {erroCarregamento && (
          <p className="text-xs text-red-600 mt-1">
            Não foi possível carregar as cidades.{' '}
            <button type="button" className="underline" onClick={() => setTentativa((t) => t + 1)}>
              Tentar novamente
            </button>
          </p>
        )}
      </div>
    </>
  )
}
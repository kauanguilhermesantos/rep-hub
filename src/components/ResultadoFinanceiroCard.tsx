import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { situacaoResultado } from '@/services/viagensService'
import { formatarMoeda } from '@/lib/formatoMoeda'
import { VALOR_OCULTO } from '@/lib/useOcultarValores'

interface ResultadoFinanceiroCardProps {
  resultado: number
  oculto?: boolean
  titulo?: string
}

// Classes literais (o Tailwind só gera o que encontra escrito por inteiro no código)
const ESTILOS = {
  positivo: { fundo: 'bg-green-50', icone: 'text-green-600', valor: 'text-green-700', rotulo: 'Positivo', Icone: TrendingUp },
  negativo: { fundo: 'bg-red-50', icone: 'text-red-600', valor: 'text-red-700', rotulo: 'Negativo', Icone: TrendingDown },
  zerado: { fundo: 'bg-gray-100', icone: 'text-gray-500', valor: 'text-gray-700', rotulo: 'Zerado', Icone: Minus },
} as const

// Mesmo formato do ResumoCard, com cor e ícone conforme o resultado ser positivo, negativo ou zerado
export default function ResultadoFinanceiroCard({ resultado, oculto = false, titulo = 'Resultado financeiro' }: ResultadoFinanceiroCardProps) {
  const estilo = ESTILOS[situacaoResultado(resultado)]
  const Icone = estilo.Icone

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow min-w-0">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className={`p-2 sm:p-3 rounded-lg shrink-0 ${estilo.fundo}`}>
          <Icone className={`${estilo.icone} size-5 sm:size-6.5`} aria-hidden="true" />
        </div>
        <div className="min-w-0 w-full sm:flex-1">
          <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-0.5 sm:mb-1 leading-tight">{titulo}</h4>
          <p
            className={`text-base min-[400px]:text-lg sm:text-2xl font-bold wrap-break-word leading-tight ${oculto ? 'text-gray-800' : estilo.valor}`}
            aria-label={oculto ? 'Valor oculto' : undefined}
          >
            {oculto ? VALOR_OCULTO : formatarMoeda(resultado ?? 0)}
          </p>
          {!oculto && <p className="text-xs text-gray-500 mt-1">{estilo.rotulo}</p>}
        </div>
      </div>
    </div>
  )
}
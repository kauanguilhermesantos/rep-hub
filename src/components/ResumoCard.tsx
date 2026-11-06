import { VALOR_OCULTO } from '@/lib/useOcultarValores'

// Classes literais: o Tailwind só gera o que encontra escrito por inteiro no código
// (`bg-${color}-50` dinâmico não é detectado e pode ficar sem estilo no build).
const CORES = {
  blue: { fundo: 'bg-blue-50', icone: 'text-blue-600' },
  green: { fundo: 'bg-green-50', icone: 'text-green-600' },
  yellow: { fundo: 'bg-yellow-50', icone: 'text-yellow-600' },
  purple: { fundo: 'bg-purple-50', icone: 'text-purple-600' },
  red: { fundo: 'bg-red-50', icone: 'text-red-600' },
  gray: { fundo: 'bg-gray-100', icone: 'text-gray-600' },
} as const

export default function ResumoCard({ title, value, icon: Icon, color, oculto = false }: any) {
  const cor = CORES[color as keyof typeof CORES] ?? CORES.gray

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow min-w-0">
      {/* Celular: ícone em cima e texto embaixo (cabe em 2 colunas). A partir de sm: lado a lado */}
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className={`p-2 sm:p-3 rounded-lg shrink-0 ${cor.fundo}`}>
          <Icon className={`${cor.icone} size-5 sm:size-6.5`} aria-hidden="true" />
        </div>
        <div className="min-w-0 w-full sm:flex-1">
          <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-0.5 sm:mb-1 leading-tight">{title}</h4>
          <p
            className="text-base min-[400px]:text-lg sm:text-2xl font-bold text-gray-800 wrap-break-word leading-tight"
            aria-label={oculto ? 'Valor oculto' : undefined}
          >
            {oculto ? VALOR_OCULTO : value}
          </p>
        </div>
      </div>
    </div>
  )
}
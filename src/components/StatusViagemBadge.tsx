import { CheckCircle2, Clock } from 'lucide-react'
import { StatusViagem } from '@/services/viagensService'

const ESTILOS: Record<StatusViagem, { texto: string; classes: string; Icone: typeof Clock }> = {
  EM_ANDAMENTO: { texto: 'Em andamento', classes: 'bg-blue-50 text-blue-700', Icone: Clock },
  FINALIZADA: { texto: 'Finalizada', classes: 'bg-green-50 text-green-700', Icone: CheckCircle2 },
}

// O texto (e não só a cor) indica o status, para ficar acessível
export default function StatusViagemBadge({ status }: { status: StatusViagem }) {
  const { texto, classes, Icone } = ESTILOS[status] ?? ESTILOS.EM_ANDAMENTO
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${classes}`}>
      <Icone size={14} aria-hidden="true" />
      {texto}
    </span>
  )
}

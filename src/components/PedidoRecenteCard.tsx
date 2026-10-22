import { Package } from 'lucide-react'

export default function PedidoRecenteCard({ order }: { order: any }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 sm:p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-100 flex items-center justify-center">
          <Package className="text-blue-600" size={20} />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-800 truncate">Pedido #{order.id}</p>
          <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-500">
            <span>{order.date}</span>
            <span>•</span>
            <span>{order.items} pares</span>
          </div>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-semibold text-gray-800 text-sm sm:text-base">{order.value}</p>
      </div>
    </div>
  )
}
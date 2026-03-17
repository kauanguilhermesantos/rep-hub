export default function MarcaVendasCard({ name, logo, sales, percentage, color }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-${color}-100 flex items-center justify-center text-${color}-600 font-bold`}>
          {logo}
        </div>
        <div>
            <p className="font-medium text-gray-800">{name}</p>
            <p className="text-sm text-gray-500">{sales} vendas</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-800">{percentage}%</p>
        <p className="text-xs text-gray-500">das vendas</p>
      </div>
    </div>
  )
}
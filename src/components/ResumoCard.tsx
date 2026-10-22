export default function ResumoCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow min-w-0">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`p-3 rounded-lg shrink-0 bg-${color}-50`}>
          <Icon className={`text-${color}-600`} size={26} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-gray-500 mb-1">{title}</h4>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 wrap-break-word">{value}</p>
        </div>
      </div>
    </div>
  )
}
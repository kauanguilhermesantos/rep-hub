export default function ResumoCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  )
}
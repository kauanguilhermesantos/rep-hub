export default function ResumoCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-around ">
            <div className={`p-3 rounded-lg bg-${color}-50`}>
                <Icon className={`text-${color}-600`} size={26} />
            </div>
            <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">{title}</h4>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    </div>
  )
}
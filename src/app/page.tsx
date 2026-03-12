import "./globals.css";

export default function TelaLogin() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-300 flex items-center justify-center p-4">
      {/* Card de Login */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">RepHub</h1>
          <p className="text-gray-600 mt-2">
            Gerenciamento de vendas para representantes comerciais
          </p>
        </div>

        {/* Formulário */}
        <form className="space-y-6">
          {/* Campo E-mail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <input
              type="email"
              placeholder="Digite seu e-mail"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              readOnly
            />
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              placeholder="Digite sua senha"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              readOnly
            />
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 transform hover:scale-[1.02]"
          >
            Entrar
          </button>
        </form>

        {/* Credenciais de teste */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Use admin@rephub.com / admin123
          </p>
        </div>
      </div>
    </div>
  )
}

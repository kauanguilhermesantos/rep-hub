"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/lib/Auth"
// import "@/app/styles/globals.css"

export default function TelaLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setErro("")
    setCarregando(true)

    try {
      await login(email, senha)
      router.push("/home")
    } catch (err) {
      setErro("E-mail ou senha inválidos")
    } finally {
      setCarregando(false)
    }
  }

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
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Campo E-mail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {erro && (
            <p className="text-sm text-red-600 text-center">{erro}</p>
          )}

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}
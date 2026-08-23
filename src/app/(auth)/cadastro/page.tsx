"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { register } from "@/lib/Auth"
import "@/app/globals.css"

export default function TelaCadastro() {
  const router = useRouter()
  const [nomeCompleto, setNomeCompleto] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [senha, setSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setErro("")

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem")
      return
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setCarregando(true)

    try {
      await register({ nomeCompleto, email, senha, telefone })
      router.push("/login")
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível criar a conta")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-300 flex items-center justify-center p-4">
      {/* Card de Cadastro */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">RepHub</h1>
          <p className="text-gray-600 mt-2">
            Crie sua conta para começar a gerenciar suas vendas
          </p>
        </div>

        {/* Formulário */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Campo Nome completo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome completo
            </label>
            <input
              type="text"
              placeholder="Digite seu nome completo"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

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

          {/* Campo Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <input
              type="tel"
              placeholder="Digite seu telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
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

          {/* Campo Confirmar Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar senha
            </label>
            <input
              type="password"
              placeholder="Digite sua senha novamente"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {erro && (
            <p className="text-sm text-red-600 text-center">{erro}</p>
          )}

          {/* Botão Cadastrar */}
          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
          >
            {carregando ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        {/* Link para login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-blue-500 hover:text-blue-600 font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
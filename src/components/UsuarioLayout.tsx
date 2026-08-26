'use client'

import { useState, useEffect } from 'react'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Menu, 
  X, 
  Home, 
  ShoppingBag, 
  Tag, 
  BarChart3, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { logout } from '@/lib/Auth'
import { getMe } from '@/services/usuarioService'
import { primeiroEUltimoNome, iniciais } from '@/lib/formatoNome'
import { Usuario } from '@/types/usuario'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function UsuarioLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const pathname = usePathname()

  // Busca os dados reais do usuário logado (usado no cabeçalho)
  useEffect(() => {
    getMe()
      .then(setUsuario)
      .catch(() => {
        // Falha silenciosa aqui: se o token tiver expirado, o middleware
        // já vai redirecionar pro /login na próxima navegação
      })
  }, [])

  const navigation = [
    { name: 'Início', href: '/home', icon: Home },
    { name: 'Pedidos', href: '/pedidos', icon: ShoppingBag },
    { name: 'Marcas', href: '/marcas', icon: Tag },
    { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  ]

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Função de logout
  const handleLogout = () => {
    logout();
    // Redireciona para a página de login após o logout
    window.location.href = '/login';
  }

  return (
    <div className={inter.className}>
      <div className="min-h-screen bg-gray-50">
        {/* Overlay para mobile quando sidebar está aberta */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed top-0 left-0 z-30 h-full bg-white border-r border-gray-200 
            transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'w-64' : 'w-20'}
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Logo e Toggle */}
          <div className={`
            flex items-center h-16 border-b border-gray-200 px-4
            ${sidebarOpen ? 'justify-between' : 'justify-center'}
          `}>
            {sidebarOpen ? (
              <>
                <h1 className="text-xl font-bold text-gray-800">RepHub</h1>
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
              </>
            ) : (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            )}
          </div>

          {/* Navegação */}
          <nav className="flex-1 py-6">
            <ul className="space-y-2 px-3">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center px-3 py-3 rounded-lg transition-colors
                        ${sidebarOpen ? 'gap-3' : 'justify-center'}
                        ${isActive 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon size={20} />
                      {sidebarOpen && <span>{item.name}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Botão Sair */}
          <div className="border-t border-gray-200 p-4">
            <button
              className={`
                flex items-center w-full px-3 py-3 rounded-lg text-red-600 
                hover:bg-red-50 transition-colors
                ${sidebarOpen ? 'gap-3' : 'justify-center'}
              `}
              onClick={handleLogout}
            >
              <LogOut size={20} />
              {sidebarOpen && <span>Sair</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className={`
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
        `}>
          {/* Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              {/* Botão Menu Hamburguer (mobile) e Toggle (desktop) */}
              <div className="flex items-center">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
                >
                  <Menu size={24} className="text-gray-600" />
                </button>
                
                {/* Título no header (mobile) */}
                <h1 className="text-xl font-bold text-gray-800 ml-2 lg:hidden">
                  RepHub
                </h1>
              </div>

              {/* Avatar do Usuário */}
              <Link href="/perfil">
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    {/* Primeiro e último nome do usuário logado */}
                    <p className="text-sm font-medium text-gray-700">
                      {usuario ? primeiroEUltimoNome(usuario.nomeCompleto) : ''}
                    </p>
                  </div>
                  {/* Avatar do Usuário (iniciais do nome) */}
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {usuario ? iniciais(usuario.nomeCompleto) : ''}
                  </div>
                </div>
              </Link>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
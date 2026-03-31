'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Save, 
  Edit2, 
  X,
  Check,
  Globe,
  Bell,
  Moon,
  Sun,
  Monitor,
  AlertCircle,
  Shield,
  Key
} from 'lucide-react'
import { Usuario } from '@/types/usuario'
import AvatarUsuario from '@/components/AvatarUsuario'

export default function PerfilPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null)

  // Dados do usuário (mockados)
  const [usuario, setUsuario] = useState<Usuario>({
    id: '1',
    nomeCompleto: 'João Silva Santos',
    email: 'joao.silva@rephub.com',
    telefone: '(11) 98765-4321',
    cargo: 'Representante Comercial',
    dataCadastro: '10/01/2026',
    ultimoAcesso: '21/03/2026 14:30',
    preferencias: {
      notificacoes: true,
      idioma: 'pt-BR',
      tema: 'light'
    }
  })

  const [formData, setFormData] = useState(usuario)

  // Atualiza formData quando o usuário muda
  useEffect(() => {
    setFormData(usuario)
  }, [usuario])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePreferenciaChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferencias: { ...prev.preferencias!, [key]: value }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMensagem(null)

    // Simular chamada API
    setTimeout(() => {
      setUsuario(formData)
      setIsEditing(false)
      setIsSaving(false)
      setMensagem({ tipo: 'success', texto: 'Perfil atualizado com sucesso!' })
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => setMensagem(null), 3000)
    }, 1000)
  }

  const handleCancel = () => {
    setFormData(usuario)
    setIsEditing(false)
  }

  // Formatar telefone enquanto digita
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length <= 11) {
      if (value.length <= 2) {
        value = value.replace(/(\d{0,2})/, '($1')
      } else if (value.length <= 7) {
        value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2')
      } else {
        value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
      }
    }
    setFormData(prev => ({ ...prev, telefone: value }))
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Meu Perfil</h1>
        <p className="text-gray-600 mt-1">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna da Esquerda - Avatar e Informações Rápidas */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card do Avatar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="flex justify-center mb-4">
              <AvatarUsuario nome={usuario.nomeCompleto} tamanho="xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{usuario.nomeCompleto}</h2>
            <p className="text-blue-600 font-medium mt-1">{usuario.cargo}</p>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Calendar size={16} />
                <span>Membro desde {usuario.dataCadastro}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-2">
                <Clock size={16} />
                <span>Último acesso: {usuario.ultimoAcesso}</span>
              </div>
            </div>
          </div>

          {/* Card de Segurança */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-800">Segurança</h3>
            </div>
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2">
                <Key size={18} className="text-gray-500" />
                <span className="text-sm text-gray-700">Alterar senha</span>
              </div>
              <Edit2 size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Coluna da Direita - Formulário de Perfil */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mensagem de feedback */}
          {mensagem && (
            <div className={`p-4 rounded-lg flex items-center gap-2 ${
              mensagem.tipo === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              <AlertCircle size={20} />
              <span>{mensagem.texto}</span>
            </div>
          )}

          {/* Formulário de Informações Pessoais */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Informações Pessoais</h3>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={18} />
                  Editar
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={18} />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Salvar
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-5">
              {/* Nome Completo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-1">
                    <User size={16} />
                    <span>Nome Completo</span>
                  </div>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="nomeCompleto"
                    value={formData.nomeCompleto}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                ) : (
                  <p className="text-gray-800 py-2">{usuario.nomeCompleto}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-1">
                    <Mail size={16} />
                    <span>E-mail</span>
                  </div>
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                ) : (
                  <p className="text-gray-800 py-2">{usuario.email}</p>
                )}
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-1">
                    <Phone size={16} />
                    <span>Telefone</span>
                  </div>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                ) : (
                  <p className="text-gray-800 py-2">{usuario.telefone}</p>
                )}
              </div>

              {/* Cargo (somente leitura) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo
                </label>
                <p className="text-gray-800 py-2 bg-gray-50 rounded-lg px-4">
                  {usuario.cargo}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Para alterar o cargo, entre em contato com o administrador
                </p>
              </div>
            </div>
          </form>

          {/* Preferências */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Preferências</h3>
            
            <div className="space-y-4">
              {/* Notificações */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-800">Notificações</p>
                    <p className="text-sm text-gray-500">Receber alertas por e-mail</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePreferenciaChange('notificacoes', !formData.preferencias?.notificacoes)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    formData.preferencias?.notificacoes ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    formData.preferencias?.notificacoes ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Idioma */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe size={20} className="text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-800">Idioma</p>
                    <p className="text-sm text-gray-500">Selecione o idioma preferido</p>
                  </div>
                </div>
                <select
                  value={formData.preferencias?.idioma}
                  onChange={(e) => handlePreferenciaChange('idioma', e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="pt-BR">Português (BR)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>

              {/* Tema */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <Sun size={20} className="text-gray-500" />
                    <Moon size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Tema</p>
                    <p className="text-sm text-gray-500">Escolha o tema da aplicação</p>
                  </div>
                </div>
                <select
                  value={formData.preferencias?.tema}
                  onChange={(e) => handlePreferenciaChange('tema', e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                  <option value="system">Sistema</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
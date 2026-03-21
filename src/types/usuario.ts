export interface Usuario {
  id: string
  nomeCompleto: string
  email: string
  telefone: string
  cargo: string
  dataCadastro: string
  avatar?: string
  ultimoAcesso?: string
  preferencias?: {
    notificacoes: boolean
    idioma: string
    tema: 'light' | 'dark' | 'system'
  }
}
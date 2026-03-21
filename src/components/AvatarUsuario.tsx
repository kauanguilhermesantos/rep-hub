'use client'

import { User } from 'lucide-react'

interface AvatarUsuarioProps {
  nome: string
  tamanho?: 'sm' | 'md' | 'lg' | 'xl'
  imagem?: string
}

export default function AvatarUsuario({ nome, tamanho = 'md', imagem }: AvatarUsuarioProps) {
  const tamanhos = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-16 h-16 text-xl',
    lg: 'w-24 h-24 text-3xl',
    xl: 'w-32 h-32 text-4xl'
  }

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(word => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  // Cores baseadas no nome
  const getColorClass = (nome: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500',
      'bg-red-500', 'bg-teal-500'
    ]
    const index = nome.length % colors.length
    return colors[index]
  }

  if (imagem) {
    return (
      <img
        src={imagem}
        alt={nome}
        className={`${tamanhos[tamanho]} rounded-full object-cover border-4 border-white shadow-lg`}
      />
    )
  }

  return (
    <div className={`${tamanhos[tamanho]} ${getColorClass(nome)} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
      {getInitials(nome)}
    </div>
  )
}
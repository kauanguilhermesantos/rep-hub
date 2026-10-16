"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

interface SenhaInputProps {
  value: string
  onChange: (valor: string) => void
  placeholder?: string
  required?: boolean
  temErro?: boolean
  autoComplete?: string
  className?: string // classes do <input> (padding, borda etc.); o padding à direita é acrescentado aqui
}

// Campo de senha com botão de "olhinho" para mostrar/ocultar o texto
export default function SenhaInput({
  value,
  onChange,
  placeholder,
  required,
  temErro = false,
  autoComplete,
  className = "px-4 py-3",
}: SenhaInputProps) {
  const [visivel, setVisivel] = useState(false)

  return (
    <div className="relative">
      <input
        type={visivel ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        className={`w-full pr-11 border rounded-lg focus:ring-2 outline-none transition-colors ${className} ${
          temErro
            ? "border-red-400 focus:ring-red-400 focus:border-red-400"
            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        }`}
      />
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visivel}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {visivel ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  )
}
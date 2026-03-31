import UsuarioLayout from '@/components/UsuarioLayout'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <UsuarioLayout>{children}</UsuarioLayout>
}
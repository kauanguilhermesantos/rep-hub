import { Inter } from 'next/font/google'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={Inter({ subsets: ['latin'] }).className}>
        {children}
      </body>
    </html>
  )
}
import { Inter } from "next/font/google";
import "@/app/globals.css";

const interFont = Inter({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={interFont.className}>
        {children}
      </body>
    </html>
  );
}
import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = ["/login", "/cadastro"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path))

  // Sem token tentando acessar rota protegida -> manda pro login
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Já autenticado tentando acessar /login -> manda pra home
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
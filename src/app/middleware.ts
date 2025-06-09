import jwt, { JwtPayload } from 'jsonwebtoken';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

interface TokenPayload extends JwtPayload {
  id: string;
  role?: string;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicAuthEntryPages = ['/entrar', '/cadastro', '/login-empresa', '/admin/login'];
  const isCurrentRouteAnAuthPage = publicAuthEntryPages.includes(pathname);

  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/assets') || 
      pathname.startsWith('/api/') ||
      pathname === '/favicon.ico' ||
      pathname === '/erro-configuracao' ||
      pathname === '/acesso-negado') {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (token) {
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret) {
      try {
        const decodedToken = jwt.verify(token, jwtSecret) as TokenPayload;
        if (isCurrentRouteAnAuthPage) {
          console.log(`Middleware: Usuário autenticado (Role: ${decodedToken.role}) em página de autenticação (${pathname}). Redirecionando...`);
          switch (decodedToken.role) {
            case 'ADMIN':
              return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            case 'RECRUTADOR':
              return NextResponse.redirect(new URL('/empresa/dashboard', request.url));
            case 'CANDIDATO':
            default:
              return NextResponse.redirect(new URL('/candidato/dashboard', request.url));
          }
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.warn("Middleware: Token inválido encontrado.");
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  if (
    pathname === '/admin/login' || 
    pathname.startsWith('/api/') || 
    pathname.includes('.') 
  ) {
    return NextResponse.next();
  }

  // 👈 CORRECCIÓN: Detectamos si estamos en producción para buscar la cookie con el prefijo __Secure-
  const esProduccion = process.env.NODE_ENV === 'production';
  const nombreCookie = esProduccion ? '__Secure-next-auth.session-token' : 'next-auth.session-token';

  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: esProduccion, // Le avisa a NextAuth que use HTTPS en Vercel
    cookieName: nombreCookie,   // Forzamos el nombre correcto de la cookie
  });

  if (pathname.startsWith('/admin') && !token) {
    console.log("🔒 Middleware: Acceso denegado, redirigiendo a login.");
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  console.log("🔓 Middleware: Acceso concedido para la ruta:", pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
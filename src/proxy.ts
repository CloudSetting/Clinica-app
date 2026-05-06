import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Cambiamos el nombre de la función de 'middleware' a 'proxy'
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // 1. EXCEPCIÓN TOTAL: Permitir acceso al login, APIs y archivos estáticos
  if (
    pathname === '/admin/login' || 
    pathname.startsWith('/api/') || 
    pathname.includes('.') 
  ) {
    return NextResponse.next();
  }

  // 2. Obtener sesión (JWT)
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // 3. PROTECCIÓN: Si intenta entrar a /admin/... y no está logueado, al login.
  if (pathname.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  // 4. Si está logueado o no es una ruta protegida, continuar
  return NextResponse.next();
}

// El matcher le dice a Next.js en qué rutas debe ejecutarse este proxy
export const config = {
  matcher: ['/admin/:path*'],
};
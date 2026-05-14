import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// VOLVEMOS A 'middleware' (Nombre obligatorio para Next.js)
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  if (
    pathname === '/admin/login' || 
    pathname.startsWith('/api/') || 
    pathname.includes('.') 
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  if (pathname.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return NextResponse.next();
}

// Esto es correcto, solo actuará en /admin
export const config = {
  matcher: ['/admin/:path*'],
};
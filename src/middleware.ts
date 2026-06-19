import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1. Permitir siempre el acceso al login y los endpoints de la API de autenticación
  if (path === "/admin/login" || path.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 2. Extraer el token de sesión
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET || "un-secreto-fallback-super-seguro-y-largo-para-la-clinica-123456789" 
  });

  // 3. Si el usuario no tiene una sesión activa y quiere entrar a una ruta privada, mandarlo al login
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Dejar pasar si la sesión existe. Los roles los manejaremos directamente en el Layout o las páginas.
  return NextResponse.next();
}

// Proteger todas las rutas de administración y del profesional médico
export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard-profesional/:path*"
  ],
};
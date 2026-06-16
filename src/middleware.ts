import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 🧠 Obtenemos el token desencriptado directamente desde la cookie usando NextAuth nativo
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Si no hay token y está intentando entrar a una ruta protegida, al login de cabeza
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const role = token.role as string | undefined;

  // 1. Si intenta entrar a la administración global pero es un médico, lo enviamos a su portal
  if (path.startsWith("/admin") && role !== "admin" && role !== "superadmin") {
    return NextResponse.redirect(new URL("/dashboard-profesional", req.url));
  }

  // 2. Si intenta entrar al dashboard profesional pero no está logueado como tal, lo mandamos al login
  if (path.startsWith("/dashboard-profesional") && role !== "profesional") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

// Filtramos qué rutas vigila el Middleware de forma precisa
export const config = {
  matcher: [
    "/admin/profesionales/:path*",
    "/admin/pagos/:path*",
    "/dashboard-profesional/:path*"
  ],
};
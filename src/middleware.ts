import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Obtenemos el token de sesión seguro
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const role = token?.role as string | undefined;

  // 1. Protección para el área de profesionales médicos
  if (path.startsWith("/dashboard-profesional")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (role !== "profesional") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  // 2. Protección para el área de administración (el matcher ya excluye /admin/login)
  if (path.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (role !== "admin" && role !== "superadmin") {
      return NextResponse.redirect(new URL("/dashboard-profesional", req.url));
    }
  }

  return NextResponse.next();
}

// 🚀 LA CLAVE: Usamos un matcher inteligente que ignora el login, archivos estáticos y la API
export const config = {
  matcher: [
    /*
     * Protege todas las rutas dentro de /admin y /dashboard-profesional,
     * pero ignora explícitamente la página de login (/admin/login).
     */
    "/admin/((?!login).*?)", 
    "/dashboard-profesional/:path*"
  ],
};
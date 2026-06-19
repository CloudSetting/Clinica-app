import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Obtenemos el token de sesión (busca tanto la cookie segura de prod como la normal de dev)
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const role = token?.role as string | undefined;

  // 1. Si intenta entrar al panel de profesionales médicos pero NO es profesional (ej: es admin o superadmin)
  if (path.startsWith("/dashboard-profesional")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (role !== "profesional") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  // 2. Si intenta entrar a cualquier ruta de /admin
  if (path.startsWith("/admin")) {
    // Excluimos la página de login para evitar bucles infinitos
    if (path === "/admin/login") {
      return NextResponse.next();
    }

    // Si no está logueado, al login
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // Si está logueado pero NO es administrador, lo mandamos a su sección médica
    if (role !== "admin" && role !== "superadmin") {
      return NextResponse.redirect(new URL("/dashboard-profesional", req.url));
    }
  }

  return NextResponse.next();
}

// Rutas vigiladas por el middleware
export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard-profesional/:path*"
  ],
};
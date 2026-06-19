import NextAuth, { type DefaultSession, type User, type Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { type JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      role?: string;
    } & DefaultSession["user"];
  }
  interface User {
    role?: string;
  }
}

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔍 Intentando login para:", credentials?.email);

        if (!credentials?.email || !credentials?.password) return null;

        const emailInput = (credentials.email as string || "").trim().toLowerCase();
        const passwordInput = credentials.password as string || "";

        // =========================================================
        // 1. INTENTO DE LOGIN COMO ADMINISTRADOR
        // =========================================================
        const { data: admin } = await supabaseAdmin
          .from("admins")
          .select("id, email, password_hash, nombre, rol, activo")
          .eq("email", emailInput)
          .maybeSingle();

        if (admin) {
          if (!admin.activo) {
            console.log("❌ Usuario administrador inactivo");
            return null;
          }

          const hashFormateado = (admin.password_hash as string).replace(/^\$2y\$/, "$2a$");
          const passwordValida = await bcrypt.compare(passwordInput, hashFormateado);

          if (!passwordValida) {
            console.log("❌ Contraseña de administrador incorrecta");
            return null;
          }

          console.log("🎉 Login exitoso como Admin:", admin.nombre);
          
          return {
            id: admin.id,
            email: admin.email,
            name: admin.nombre,
            role: (admin.rol as string) || "admin",
          };
        }

        // =========================================================
        // 2. INTENTO DE LOGIN COMO PROFESIONAL MÉDICO
        // =========================================================
        console.log("🩺 No es admin, buscando en profesionales...");
        
        // Intento 1: Buscar en la columna 'email'
        let { data: profesional } = await supabaseAdmin
          .from("profesionales")
          .select("id, email, correo, password_hash, nombre, apellido, activo")
          .eq("email", emailInput)
          .maybeSingle();

        // Intento 2: Si no apareció por 'email', buscamos en la columna 'correo'
        if (!profesional) {
          console.log("🔍 No se encontró en la columna 'email', buscando en la columna 'correo'...");
          const { data: profesionalPorCorreo } = await supabaseAdmin
            .from("profesionales")
            .select("id, email, correo, password_hash, nombre, apellido, activo")
            .eq("correo", emailInput)
            .maybeSingle();
          
          profesional = profesionalPorCorreo;
        }

        if (profesional) {
          console.log("👤 Profesional encontrado en Supabase:", profesional.nombre);

          if (profesional.activo === false) {
            console.log("❌ Acceso denegado: El profesional está inactivo");
            return null;
          }

          if (!profesional.password_hash) {
            console.log("❌ Error fatal: La columna 'password_hash' de este médico está vacía (NULL) en Supabase.");
            return null;
          }

          // Verificamos si escribiste la clave en texto plano por accidente
          if (!profesional.password_hash.startsWith("$2")) {
            console.log("⚠️ Alerta: El valor en 'password_hash' no es un hash válido de Bcrypt. ¡Parece texto plano!");
          }

          const hashFormateado = (profesional.password_hash as string).replace(/^\$2y\$/, "$2a$");
          const passwordValida = await bcrypt.compare(passwordInput, hashFormateado);

          if (!passwordValida) {
            console.log("❌ Contraseña incorrecta: Bcrypt no coincide.");
            return null;
          }

          console.log("🎉 ¡Login exitoso! Validaciones correctas para:", profesional.nombre);

          return {
            id: profesional.id,
            email: profesional.email || profesional.correo,
            name: `${profesional.nombre} ${profesional.apellido || ""}`.trim(),
            role: "profesional",
          };
        }

        console.log("❌ El correo ingresado no existe ni en 'email' ni en 'correo' dentro de profesionales.");
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) session.user.role = token.role as string;
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.includes("/dashboard-profesional")) {
        return url;
      }
      return `${baseUrl}/admin/profesionales`;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  // 🚀 SOLUCIÓN: Usamos cookies seguras nativas en producción real, pero flexibles en dominios espejo de Vercel
  useSecureCookies: process.env.NODE_ENV === "production" && !process.env.VERCEL_URL,
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" && !process.env.VERCEL_URL
        ? `__Secure-next-auth.session-token` 
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === "production" && !process.env.VERCEL_URL,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const authResult = NextAuth(authOptions);
export const { GET, POST } = authResult.handlers;
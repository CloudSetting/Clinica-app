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

        // Buscar el administrador en la base de datos de Supabase
        const { data: admin, error } = await supabaseAdmin
          .from("admins")
          .select("id, email, password_hash, nombre, rol, activo")
          .eq("email", credentials.email)
          .single();

        if (error || !admin) {
          console.log("❌ Usuario no encontrado o error en query");
          return null;
        }

        if (!admin.activo) {
          console.log("❌ Usuario inactivo");
          return null;
        }

        const hashEnDB = admin.password_hash as string;
        const passwordInput = credentials.password as string;

        // --- NORMALIZACIÓN DE HASH ---
        // Previene errores si el hash viene con formatos diferentes como $2y$ en la base de datos
        const hashFormateado = hashEnDB.replace(/^\$2y\$/, "$2a$");
        
        const passwordValida = await bcrypt.compare(passwordInput, hashFormateado);

        if (!passwordValida) {
          console.log("❌ Contraseña incorrecta");
          return null;
        }

        console.log("🎉 Login exitoso para:", admin.nombre);
        
        return {
          id: admin.id,
          email: admin.email,
          name: admin.nombre,
          role: admin.rol as string,
        };
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
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  // Configuración crucial para que las cookies viajen seguras bajo HTTPS en Vercel
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// 1. Inicializamos NextAuth pasándole la configuración
const authResult = NextAuth(authOptions);

// 2. Exportamos las funciones directamente usando las constantes nativas de la librería.
// Esto conserva de forma automática el tipo 'NextRequest' interno que exige Next.js 16.
export const { GET, POST } = authResult.handlers;
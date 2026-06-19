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
          .select("*")
          .eq("email", emailInput)
          .maybeSingle();

        if (admin) {
          if (!admin.activo) {
            console.log("❌ Usuario administrador inactivo");
            return null;
          }

          const hashDbAdmin = admin.password_hash || admin.password;
          if (!hashDbAdmin) return null;

          const hashFormateado = (hashDbAdmin as string).replace(/^\$2y\$/, "$2a$");
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
        
        // Seleccionamos todo (*) para evitar errores por omitir columnas personalizadas
        let { data: profesional } = await supabaseAdmin
          .from("profesionales")
          .select("*")
          .eq("email", emailInput)
          .maybeSingle();

        if (!profesional) {
          console.log("🔍 No se encontró por 'email', buscando en la columna 'correo'...");
          const { data: profesionalPorCorreo } = await supabaseAdmin
            .from("profesionales")
            .select("*")
            .eq("correo", emailInput)
            .maybeSingle();
          
          profesional = profesionalPorCorreo;
        }

        if (profesional) {
          if (profesional.activo === false) {
            console.log("❌ Profesional médico inactivo");
            return null;
          }

          // Leemos la columna de contraseña dinámicamente según exista en tu Supabase
          const hashDb = profesional.password_hash || profesional.password;

          if (!hashDb) {
            console.log("❌ No se encontró ninguna contraseña encriptada para este profesional en Supabase.");
            return null;
          }

          // Asegurar compatibilidad de hashes ($2y$ de PHP a $2a$ de Node)
          const hashFormateado = (hashDb as string).replace(/^\$2y\$/, "$2a$");
          const passwordValida = await bcrypt.compare(passwordInput, hashFormateado);

          if (!passwordValida) {
            console.log("❌ Contraseña incorrecta para profesional.");
            return null;
          }

          console.log("🎉 ¡Login exitoso como Profesional!", profesional.nombre);

          return {
            id: profesional.id,
            email: profesional.email || profesional.correo,
            name: profesional.nombre,
            role: "profesional", // Asignación de rol clave para el middleware
          };
        }

        console.log("❌ El correo no existe en ninguna tabla.");
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
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  useSecureCookies: false, // Requerido para compatibilidad en URLs espejo de Vercel
  secret: process.env.NEXTAUTH_SECRET || "un-secreto-fallback-super-seguro-y-largo-para-la-clinica-123456789",
};

const { handlers } = NextAuth(authOptions);
export const { GET, POST } = handlers;
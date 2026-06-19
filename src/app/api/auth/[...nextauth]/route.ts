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
        
        let { data: profesional } = await supabaseAdmin
          .from("profesionales")
          .select("id, email, correo, password_hash, nombre, apellido, activo")
          .eq("email", emailInput)
          .maybeSingle();

        if (!profesional) {
          console.log("🔍 Buscando en la columna 'correo'...");
          const { data: profesionalPorCorreo } = await supabaseAdmin
            .from("profesionales")
            .select("id, email, correo, password_hash, nombre, apellido, activo")
            .eq("correo", emailInput)
            .maybeSingle();
          
          profesional = profesionalPorCorreo;
        }

        if (profesional) {
          if (profesional.activo === false) {
            console.log("❌ Profesional médico inactivo");
            return null;
          }

          if (!profesional.password_hash) {
            console.log("❌ Columna 'password_hash' vacía en Supabase.");
            return null;
          }

          const hashFormateado = (profesional.password_hash as string).replace(/^\$2y\$/, "$2a$");
          const passwordValida = await bcrypt.compare(passwordInput, hashFormateado);

          if (!passwordValida) {
            console.log("❌ Contraseña incorrecta para profesional.");
            return null;
          }

          console.log("🎉 ¡Login exitoso como Profesional!", profesional.nombre);

          return {
            id: profesional.id,
            email: profesional.email || profesional.correo,
            name: `${profesional.nombre} ${profesional.apellido || ""}`.trim(),
            role: "profesional",
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
  // 🚀 FORZAR COOKIES INSEGURAS/FLEXIBLES EN VERCEL ESPEJO PARA EVITAR QUE LA PETICIÓN SE CANCELE (POST ---)
  useSecureCookies: false,
  secret: process.env.NEXTAUTH_SECRET || "un-secreto-fallback-super-seguro-y-largo-para-la-clinica-123456789",
};

const { handlers } = NextAuth(authOptions);
export const { GET, POST } = handlers;
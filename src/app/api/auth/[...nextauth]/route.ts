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
        // --- LOG DE INICIO ---
        console.log("🔍 Intentando login para:", credentials?.email);

        

        if (!credentials?.email || !credentials?.password) return null;

        const { data: admin, error } = await supabaseAdmin
          .from("admins")
          .select("id, email, password_hash, nombre, rol, activo")
          .eq("email", credentials.email)
          .single();

        if (error || !admin) {
          console.log("❌ Usuario no encontrado");
          return null;
        }

        if (!admin.activo) {
          console.log("❌ Usuario inactivo");
          return null;
        }

        const hashEnDB = admin.password_hash as string;
       // BUSCA ESTA PARTE Y AÑADE EL LOG:
const passwordInput = credentials.password as string;

// --- AÑADE ESTO SOLO PARA UNA PRUEBA ---
const nuevoHash = await bcrypt.hash("Admin123!", 10);
console.log("------------------------------------------");
console.log("COPIA ESTE HASH Y PEGALO EN SUPABASE:");
console.log(nuevoHash);
console.log("------------------------------------------");

        // --- NORMALIZACIÓN DE HASH ---
        // Algunos generadores usan $2y$, bcryptjs prefiere $2a$. 
        // Esto previene errores de "Contraseña incorrecta" por formato.
        const hashFormateado = hashEnDB.replace(/^\$2y\$/, "$2a$");

        console.log("DEBUG: Comparando password con hash formateado...");
        
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
  secret: process.env.NEXTAUTH_SECRET,
};

const { handlers } = NextAuth(authOptions);
export const { GET, POST } = handlers;
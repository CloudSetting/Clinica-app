"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    // Determinar destino en base al correo ingresado para guiar a NextAuth
    let destinoOriginal = "/admin/profesionales";
    if (email.trim().toLowerCase() === "soyiham563@ocuser.com") {
      destinoOriginal = "/dashboard-profesional";
    }

    try {
      // 🚀 Al usar redirect: true, NextAuth se encarga de todo de forma nativa.
      await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: true, 
        callbackUrl: destinoOriginal,
      });
    } catch (err) {
      console.error("Error en el inicio de sesión:", err);
      setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Panel de Control</h2>
          <p className="mt-2 text-sm text-gray-600">Ingresa tus credenciales de administrador</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <input
              type="email"
              required
              disabled={cargando}
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              disabled={cargando}
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70"
          >
            {cargando ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";

const MAX_INTENTOS = 5;

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (bloqueado) return;

    setCargando(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        const nuevosIntentos = intentos + 1;
        setIntentos(nuevosIntentos);

        if (nuevosIntentos >= MAX_INTENTOS) {
          setBloqueado(true);
          setError("Demasiados intentos fallidos. Cuenta bloqueada temporalmente.");
        } else {
          setError(
            `Email o contraseña incorrectos. Intentos restantes: ${MAX_INTENTOS - nuevosIntentos}`
          );
        }
        setCargando(false);
      } else {
        // Redirección nativa por ventana para evitar congelamientos asincrónicos en producción
        window.location.href = "/admin/dashboard";
      }
    } catch (err) {
      console.error("Error crítico en la autenticación:", err);
      setError("Ocurrió un problema de comunicación con el servidor.");
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="bg-blue-600 text-white font-bold text-sm w-10 h-10 rounded-xl flex items-center justify-center">
            CM
          </div>
          <span className="font-bold text-xl text-gray-900">Centro Médico</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
          Panel de administración
        </h1>
        <p className="text-gray-500 text-center text-sm mb-8">
          Acceso restringido solo para administradores
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@clinica.cl"
                required
                autoComplete="email"
                disabled={bloqueado}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={bloqueado}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-100"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Barra de intentos */}
          {intentos > 0 && !bloqueado && (
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(intentos / MAX_INTENTOS) * 100}%` }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={cargando || bloqueado}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
          >
            {bloqueado ? "Cuenta bloqueada" : cargando ? "Ingresando..." : "Ingresar"}
          </button>

          {bloqueado && (
            <button
              type="button"
              onClick={() => {
                setBloqueado(false);
                setIntentos(0);
                setError("");
              }}
              className="w-full text-blue-600 hover:text-blue-500 text-sm font-medium transition"
            >
              Reintentar
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
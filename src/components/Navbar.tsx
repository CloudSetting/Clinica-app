"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, LayoutDashboard, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react"; // <--- Importante
import Link from "next/link";

const enlaces = [
  { nombre: "Inicio", href: "#hero" },
  { nombre: "Servicios", href: "#servicios" },
  { nombre: "Equipo", href: "#equipo" },
  { nombre: "Contacto", href: "#contacto" },
];

export default function Navbar() {
  const { data: session } = useSession(); // Detecta si hay alguien logueado
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuAbierto(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <button onClick={() => scrollTo("#hero")} className="flex items-center gap-2">
          <div className="bg-blue-600 text-white font-bold text-sm w-9 h-9 rounded-xl flex items-center justify-center">
            CM
          </div>
          <span className={`font-bold text-lg transition-colors duration-300 ${scrolled ? "text-gray-900" : "text-white"}`}>
            Centro Médico
          </span>
        </button>

        {/* Enlaces desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {enlaces.map((enlace) => (
            <button
              key={enlace.nombre}
              onClick={() => scrollTo(enlace.href)}
              className={`text-sm font-medium transition-colors duration-300 hover:text-blue-500 ${
                scrolled ? "text-gray-700" : "text-white/90"
              }`}
            >
              {enlace.nombre}
            </button>
          ))}
          
          {/* Link al Admin solo si está logueado */}
          {session && (
            <Link 
              href="/admin/dashboard" 
              className={`flex items-center gap-1 text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors`}
            >
              <LayoutDashboard size={16} />
              Panel
            </Link>
          )}
        </nav>

        {/* Botones Derecha */}
        <div className="hidden md:flex items-center gap-4">
          {!session ? (
            <>
              <a href="tel:+56223456789" className={`flex items-center gap-1 text-sm font-medium transition-colors duration-300 ${scrolled ? "text-gray-700" : "text-white/90"}`}>
                <Phone size={14} />
                +56 2 2345 6789
              </a>
              <button onClick={() => scrollTo("#contacto")} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all duration-300">
                Agendar hora
              </button>
            </>
          ) : (
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 bg-red-50 text-red-600 text-sm font-bold px-4 py-2 rounded-xl hover:bg-red-100 transition-all"
            >
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          )}
        </div>

        {/* Hamburguesa móvil */}
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className={`md:hidden transition-colors duration-300 ${scrolled ? "text-gray-900" : "text-white"}`}
        >
          {menuAbierto ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu movil */}
      <AnimatePresence>
        {menuAbierto && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {enlaces.map((enlace) => (
                <button key={enlace.nombre} onClick={() => scrollTo(enlace.href)} className="text-gray-700 hover:text-blue-600 text-sm font-medium text-left">
                  {enlace.nombre}
                </button>
              ))}
              
              {session ? (
                <>
                  <Link href="/admin/dashboard" className="text-blue-600 font-bold text-sm">Ir al Panel</Link>
                  <button onClick={() => signOut()} className="text-red-600 font-bold text-sm text-left">Cerrar Sesión</button>
                </>
              ) : (
                <button onClick={() => scrollTo("#contacto")} className="bg-blue-600 text-white text-sm font-semibold px-5 py-3 rounded-xl">
                  Agendar hora
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
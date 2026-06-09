"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // 👈 Opcional pero recomendado para marcar el botón activo
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Clock
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

// Definimos la estructura exacta de cada botón del menú para complacer a TypeScript
interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Captura en qué página está el administrador

  const menuItems: MenuItem[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Profesionales", href: "/admin/profesionales", icon: <Users size={20} /> },
    { name: "Reservas", href: "/admin/reservas", icon: <Calendar size={20} /> },
    { name: "Horarios", href: "/admin/horarios", icon: <Clock size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      
      {/* Sidebar Fija (Escritorio) */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shrink-0">
        <div className="p-6">
          <div className="bg-blue-600 text-white font-black text-sm py-2 px-4 rounded-xl inline-block tracking-tight">
            Centro Médico
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            // Evaluamos si el administrador se encuentra actualmente en este módulo
            const esActivo = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider ${
                  esActivo 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Botón de Salir al final */}
        <div className="p-4 border-t border-slate-100">
          <LogoutButton />
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header Superior (Solo visible en dispositivos móviles) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:hidden shrink-0">
          <span className="font-black text-blue-600 text-sm tracking-tight">CM Admin</span>
          {/* Aquí puedes incorporar un menú móvil desplegable en el futuro */}
        </header>

        {/* Área de Renderizado de Páginas */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Clock, 
  DollarSign 
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  // 🚀 DETECTOR DE LOGIN: Si la ruta es exactamente el login, quitamos el Sidebar
  const esLogin = pathname === "/admin/login";

  if (esLogin) {
    return <div className="w-full min-h-screen bg-slate-900">{children}</div>;
  }

  // Menú de navegación lateral original
  const enlaces = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Profesionales", href: "/admin/profesionales", icon: Users },
    { name: "Reservas", href: "/admin/reservas", icon: CalendarDays },
    { name: "Horarios", href: "/admin/horarios", icon: Clock },
    { name: "Pagos", href: "/admin/pagos", icon: DollarSign },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* 1. Barra Lateral Administrativa Izquierda */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <div className="bg-blue-600 text-white font-black px-2.5 py-1 rounded-xl text-xs uppercase tracking-wider">
            CM
          </div>
          <span className="font-black text-slate-900 tracking-tight text-sm">Centro Médico</span>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 text-xs font-semibold">
          {enlaces.map((enlace) => {
            const Icono = enlace.icon;
            const activo = pathname === enlace.href;

            return (
              <Link
                key={enlace.href}
                href={enlace.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all uppercase tracking-wider font-black ${
                  activo
                    ? "bg-blue-50 text-blue-600 shadow-xs"
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icono size={16} />
                {enlace.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 2. Contenedor de las páginas internas con margen izquierdo para no taparse */}
      <div className="flex-1 pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>

    </div>
  );
}
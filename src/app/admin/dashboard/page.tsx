"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; 
import { 
  Users, 
  CalendarCheck, 
  Clock, 
  LogOut, 
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProfesionales: 0,
    reservasHoy: 0,
    proximasReservas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      const { count: profCount } = await supabase
        .from("profesionales")
        .select("*", { count: 'exact', head: true });

      const hoy = new Date().toISOString().split('T')[0];
      const { count: resHoyCount } = await supabase
        .from("reservas")
        .select("*", { count: 'exact', head: true })
        .eq('fecha', hoy);

      const { count: proxCount } = await supabase
        .from("reservas")
        .select("*", { count: 'exact', head: true })
        .eq('estado', 'pendiente');

      setStats({
        totalProfesionales: profCount || 0,
        reservasHoy: resHoyCount || 0,
        proximasReservas: proxCount || 0
      });
    } catch (error) {
      console.error("Error cargando stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lógica de logout híbrida (Cierra tanto NextAuth como Supabase si es necesario)
  const manejarCerrarSesion = async () => {
    try {
      // 1. Intentamos cerrar sesión en Supabase por si acaso
      await supabase.auth.signOut();
      
      // 2. 🚀 CORREGIDO: NextAuth borra sesión y redirige a la raíz pública "/"
      await signOut({ callbackUrl: "/" });
      
    } catch (error) {
      console.log("Error cerrando sesión:", error);
      // Respaldo directo si NextAuth no está activo en esta sesión
      router.push("/");
    }
  };

  const cards = [
    {
      titulo: "Profesionales",
      valor: stats.totalProfesionales,
      icono: <Users className="text-blue-600" size={24} />,
      color: "bg-blue-50",
      link: "/admin/profesionales"
    },
    {
      titulo: "Reservas Hoy",
      valor: stats.reservasHoy,
      icono: <CalendarCheck className="text-green-600" size={24} />,
      color: "bg-green-50",
      link: "/admin/reservas"
    },
    {
      titulo: "Pendientes",
      valor: stats.proximasReservas,
      icono: <Clock className="text-orange-600" size={24} />,
      color: "bg-orange-50",
      link: "/admin/reservas"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-gray-500">Bienvenido de vuelta al administrador.</p>
        </div>
        
        <button
          onClick={manejarCerrarSesion}
          className="flex items-center gap-2 bg-white border border-gray-200 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition-all font-semibold shadow-sm"
        >
          <LogOut size={18} />
          <span className="hidden md:inline">Cerrar Sesión</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {cards.map((card, index) => (
          <Link href={card.link} key={index}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${card.color}`}>
                  {card.icono}
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-gray-500 transition-colors" size={20} />
              </div>
              <h3 className="text-gray-500 font-medium text-sm">{card.titulo}</h3>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? "..." : card.valor}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Sección de Accesos Rápidos */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/horarios" className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:bg-blue-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <TrendingUp size={18} />
              </div>
              <span className="font-semibold text-gray-700">Gestionar Horarios y Excepciones</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>

          <Link href="/" className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-gray-800 p-2 rounded-lg text-white">
                <Users size={18} />
              </div>
              <span className="font-semibold text-gray-700">Ver sitio web público</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
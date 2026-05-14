import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Clock
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton"; // Crearemos este pequeño componente abajo

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Profesionales", href: "/admin/profesionales", icon: <Users size={20} /> },
    { name: "Reservas", href: "/admin/reservas", icon: <Calendar size={20} /> },
    { name: "Horarios", href: "/admin/horarios", icon: <Clock size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Fija */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6">
          <div className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg inline-block">
            Centro Medico
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium"
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Botón de Salir al final */}
        <div className="p-4 border-t border-gray-100">
           <LogoutButton />
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 md:hidden">
          <span className="font-bold text-blue-600">CM Admin</span>
          {/* Aquí podrías poner un menú hamburguesa para móvil después */}
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
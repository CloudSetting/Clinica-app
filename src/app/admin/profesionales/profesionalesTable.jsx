"use client";

import { useState, useMemo } from "react";
import { Search, Edit, Power, ChevronLeft, ChevronRight, User, Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import ProfesionalModal from "./ProfesionalModal";

export default function ProfesionalesTable({ initialData }) {
  const [profesionales, setProfesionales] = useState(initialData || []);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  
  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profesionalEditando, setProfesionalEditando] = useState(null);

  const itemsPorPagina = 10;

  // Filtrado de datos blindado contra valores null
  const datosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();
    return profesionales.filter((p) => {
      const nombreMatches = p.nombre ? p.nombre.toLowerCase().includes(texto) : false;
      const espMatches = p.especialidad ? p.especialidad.toLowerCase().includes(texto) : false;
      const emailMatches = p.email ? p.email.toLowerCase().includes(texto) : false;
      return nombreMatches || espMatches || emailMatches;
    });
  }, [busqueda, profesionales]);

  const totalPaginas = Math.ceil(datosFiltrados.length / itemsPorPagina) || 1;
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const profesionalesPaginados = datosFiltrados.slice(inicio, inicio + itemsPorPagina);

  // Función para refrescar datos tras guardar/editar (Llamado desde el modal)
  const refrescarDatos = async () => {
    const { data } = await supabase
      .from("profesionales")
      .select("*")
      .order("nombre", { ascending: true });
    if (data) setProfesionales(data);
  };

  const toggleEstado = async (id, estadoActual) => {
    const nuevoEstado = !estadoActual;
    const { error } = await supabase
      .from("profesionales")
      .update({ activo: nuevoEstado })
      .eq("id", id);

    if (!error) {
      setProfesionales(profesionales.map(p => 
        p.id === id ? { ...p, activo: nuevoEstado } : p
      ));
    }
  };

  const abrirModalNuevo = () => {
    setProfesionalEditando(null);
    setIsModalOpen(true);
  };

  const abrirModalEditar = (pro) => {
    setProfesionalEditando(pro);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Cabecera: Buscador y Botón Nuevo */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, especialidad o email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
          />
        </div>
        
        <button 
          onClick={abrirModalNuevo}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition font-medium"
        >
          <Plus size={20} />
          Nuevo Profesional
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-600">Foto</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Nombre</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Especialidad</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Email</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Estado</th>
              <th className="p-4 text-sm font-semibold text-gray-600 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {profesionalesPaginados.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-gray-400">
                  No se encontraron profesionales registrados o que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              profesionalesPaginados.map((pro) => (
                <tr key={pro.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    {pro.foto_url ? (
                      <div className="relative w-10 h-10">
                        <Image 
                          src={pro.foto_url} 
                          alt={pro.nombre || "Profesional"} 
                          fill
                          sizes="40px"
                          className="rounded-full object-cover"
                          unoptimized 
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <User size={20} />
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">{pro.nombre}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {pro.especialidad || "Sin Especialidad"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{pro.email || pro.correo}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${pro.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {pro.activo ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => abrirModalEditar(pro)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => toggleEstado(pro.id, pro.activo)}
                        className={`p-2 rounded-lg transition ${pro.activo ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                      >
                        <Power size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-gray-500">
          Mostrando {datosFiltrados.length === 0 ? 0 : inicio + 1} a {Math.min(inicio + itemsPorPagina, datosFiltrados.length)} de {datosFiltrados.length}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
            className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas}
            className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Modal Conectado con Flujo de Actualización */}
      <ProfesionalModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profesional={profesionalEditando}
        onSave={refrescarDatos}
      />
    </div>
  );
}
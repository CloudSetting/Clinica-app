import React from "react";
import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { redirect } from "next/navigation";
import { DollarSign, Calendar, Clock, User } from "lucide-react";
import BotonCerrarSesion from "./BotonCerrarSesion";

export default async function DashboardProfesionalPage() {
  // 1. Extraer las cabeceras de la petición para leer la cookie de NextAuth
  const reqHeaders = await headers();
  const cookieHeader = reqHeaders.get("cookie") || "";
  
  // Creamos el objeto emulado con la estructura exacta que la firma de v5 (Auth.js) espera
  const mockReq = {
    headers: {
      cookie: cookieHeader,
    },
  };

  // 2. Obtener el token descifrado sin usar alias conflictivos ni casteos pesados
  const token = await getToken({
    req: mockReq,
    secret: process.env.NEXTAUTH_SECRET || "un-secreto-fallback-super-seguro-y-largo-para-la-clinica-123456789"
  });

  // Si no hay token o no hay email, significa que no ha iniciado sesión
  if (!token || !token.email) {
    redirect("/admin/login");
  }

  const emailUsuario = token.email.trim().toLowerCase();

  // 3. Traer el perfil del profesional cruzándolo por su correo electrónico aprobado
  const { data: perfilData, error: perfilError } = await supabaseAdmin
    .from("profesionales")
    .select("*")
    .eq("email", emailUsuario)
    .maybeSingle();

  let perfil = perfilData;

  // Fallback por si en la base de datos se registró en la columna 'correo'
  if (!perfil) {
    const { data: perfilPorCorreo } = await supabaseAdmin
      .from("profesionales")
      .select("*")
      .eq("correo", emailUsuario)
      .maybeSingle();
    perfil = perfilPorCorreo;
  }

  if (perfilError || !perfil) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <p className="text-sm font-bold text-red-600 uppercase tracking-wider">Error de Perfil</p>
        <p className="text-slate-500 text-xs mt-1">No se encontró un perfil médico asociado al correo: {emailUsuario}</p>
      </div>
    );
  }

  // 4. Traer las reservas filtradas explícitamente por el ID de este profesional
  const { data: reservasData, error: reservasError } = await supabaseAdmin
    .from("reservas")
    .select("*")
    .eq("profesional_id", perfil.id)
    .order("fecha", { ascending: false });

  if (reservasError) {
    console.error("Error cargando reservas:", reservasError);
  }

  const citas = reservasData || [];

  // 5. Calcular métricas financieras según montos y estados
  const ingresos = citas
    .filter(cita => cita.pago_estado === "approved" || cita.pago_estado === "aprobado" || cita.estado === "confirmada")
    .reduce((sum, cita) => sum + (Number(cita.monto) || 0), 0);

  const metricas = {
    totalIngresos: ingresos,
    totalCitas: citas.length
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER DINÁMICO DEL PROFESIONAL */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-xs mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Portal de Recepción de Pagos
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Especialista: <span className="font-bold text-blue-600">Dr(a). {perfil.nombre} {perfil.apellido || ""}</span> | {perfil.especialidad || "Medicina"}
            </p>
          </div>
          <BotonCerrarSesion />
        </div>

        {/* TARJETAS DE CONTROL MONETARIO Y TIEMPO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Monto Recibido (Histórico)</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                ${metricas.totalIngresos.toLocaleString("es-CL")}
              </h3>
              <p className="text-[10px] text-emerald-600 font-medium mt-1">Sincronizado con pasarela de pagos</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-xs">
              <DollarSign size={22} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Atenciones Agendadas</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                {metricas.totalCitas}
              </h3>
              <p className="text-[10px] text-blue-600 font-medium mt-1">Citas asociadas a tu cuenta individual</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-xs">
              <Calendar size={22} />
            </div>
          </div>
        </div>

        {/* TABLA DETALLADA: HISTÓRICO */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Histórico General de Consultas</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4 pl-6">Datos del Paciente</th>
                  <th className="p-4">Fecha y Bloque</th>
                  <th className="p-4">Canal de Pago</th>
                  <th className="p-4 text-right pr-6">Monto Consulta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600 font-medium">
                {citas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-400 text-xs font-medium">
                      No se registran órdenes de atención o agendas para tu cuenta individual actualmente.
                    </td>
                  </tr>
                ) : (
                  citas.map((cita) => (
                    <tr key={cita.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center border border-slate-200">
                            <User size={15} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm tracking-tight">{cita.paciente_nombre}</p>
                            <p className="text-xs text-slate-400">{cita.paciente_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{cita.fecha}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                          <Clock size={12} /> {cita.hora_inicio?.substring(0, 5)} - {cita.hora_fin?.substring(0, 5)} hrs
                        </p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                          cita.pago_estado === "approved" || cita.pago_estado === "aprobado"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {cita.pago_estado === "approved" || cita.pago_estado === "aprobado" ? "Pagado Online" : "Por Pagar"}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6 font-black text-slate-900 text-sm">
                        ${(Number(cita.monto) || 0).toLocaleString("es-CL")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
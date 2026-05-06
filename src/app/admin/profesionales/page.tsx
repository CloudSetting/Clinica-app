import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ProfesionalesTable from "./profesionalesTable.jsx";
export const metadata = {
  title: "Gestión de Profesionales | Centro Médico",
};

export default async function ProfesionalesPage() {
  // Traemos todos los profesionales inicialmente
  const { data: profesionales, error } = await supabaseAdmin
    .from("profesionales")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    return <div className="p-6 text-red-500">Error al cargar profesionales: {error.message}</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Profesionales</h1>
        <p className="text-gray-500 text-sm">Administra la información, especialidades y estado de los médicos.</p>
      </div>

      <ProfesionalesTable initialData={profesionales || []} />
    </div>
  );
}
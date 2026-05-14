import FormularioReserva from "@/components/reservas/FormularioReserva";

export default function PaginaPublicaReservas() {
  return (
    <main className="min-h-screen bg-white">
      {/* Puedes agregar un Navbar público aquí si tienes uno */}
      
      <div className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-blue-900 mb-2">
              Reserva tu Atención
            </h1>
            <p className="text-gray-600">
              Completa los pasos a continuación para agendar tu cita médica.
            </p>
          </div>

          {/* Reutilizamos tu componente estrella */}
          <FormularioReserva />
        </div>
      </div>

      <footer className="py-8 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} Centro de Salud Integral — Conectado con Supabase
      </footer>
    </main>
  );
}
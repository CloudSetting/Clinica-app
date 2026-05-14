import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50 text-gray-900">
      <div className="max-w-3xl text-center space-y-6">
        {/* Título Principal */}
        <h1 className="text-5xl font-extrabold tracking-tight text-blue-700">
          Centro Médico Salud Integral
        </h1>
        
        {/* Descripción corta */}
        <p className="text-xl text-gray-600 leading-relaxed">
          Especialistas en psicología, medicina general y consultas especializadas. 
          Tu bienestar es nuestra prioridad, ahora con agendamiento online.
        </p>

        {/* Sección de Botones / Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link 
            href="/test" 
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all"
          >
            Agendar Cita Online
          </Link>
          
          <Link 
            href="/login" 
            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border border-blue-600 shadow-sm hover:bg-blue-50 transition-all"
          >
            Panel Administrativo
          </Link>
        </div>

        {/* Footer o Info extra */}
        <div className="pt-12 border-t border-gray-200 mt-12">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Centro Médico - La web está en línea y protegida con ReCaptcha.
          </p>
        </div>
      </div>
    </main>
  );
}
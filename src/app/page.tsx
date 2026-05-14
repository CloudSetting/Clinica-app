import Hero from "@/components/sections/Hero";
import Servicios from "@/components/sections/Servicios";
import Equipo from "@/components/sections/Equipo";
import Contacto from "@/components/sections/Contacto";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      
      {/* Contenedor con espaciado consistente */}
      <main className="flex-grow container mx-auto px-4 md:px-8">
        <Servicios />
        <hr className="border-gray-100" />
        <Equipo />
        <hr className="border-gray-100" />
        <Contacto />
      </main>

      <Footer />
    </div>
  );
}
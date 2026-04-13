import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import Servicios from "@/components/sections/Servicios";
import Equipo from "@/components/sections/Equipo";
import Galeria from "@/components/sections/Galeria";
import Testimonios from "@/components/sections/Testimonios";
import Contacto from "@/components/sections/Contacto";
import Footer from "@/components/Footer";
import Reservas from "@/components/sections/Reservas";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Servicios />
      <Equipo />
      <Reservas />
      <Galeria />
      <Testimonios />
      <Contacto />
      <Footer />
    </main>
  );
}
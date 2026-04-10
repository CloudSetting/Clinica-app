import Hero from "@/components/sections/Hero";
import Servicios from "@/components/sections/Servicios";
import Equipo from "@/components/sections/Equipo";
import Galeria from "@/components/sections/Galeria";
import Testimonios from "@/components/sections/Testimonios";
import Contacto from "@/components/sections/Contacto";

export default function Home() {
  return (
    <main>
      <Hero />
      <Servicios />
      <Equipo />
      <Galeria />
      <Testimonios />
      <Contacto />
    </main>
  );
}
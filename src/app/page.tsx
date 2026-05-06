export default function HomePage() {
  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Bienvenido al Centro de Salud Integral</h1>
      <p>La web está en línea.</p>
      <a href="/test" style={{ color: 'blue', textDecoration: 'underline' }}>
        Ir a probar agendamiento
      </a>
    </main>
  );
}
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // 👈 AGREGAMOS ESTO: Cabeceras de confianza para relajar el CSP con Mercado Pago
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            // Permite que corran los scripts dinámicos de mercadopago sin el bloqueo de 'nonce'
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.mercadopago.com https://*.mercadolibre.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
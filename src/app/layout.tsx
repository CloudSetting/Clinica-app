import type { Metadata } from "next";
import Script from "next/script";
import React from "react";
import "./globals.css"; // Mantén tu importación de estilos actual

export const metadata: Metadata = {
  title: "Clínica Médica",
  description: "Portal de reservas y gestión médica",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <head>
        {/* 👈 Carga el SDK oficial de Mercado Pago de forma segura antes de la interactividad */}
        <Script 
          src="https://sdk.mercadopago.com/js/v2" 
          strategy="beforeInteractive"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
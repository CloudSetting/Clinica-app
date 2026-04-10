import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ReCaptchaProvider } from "next-recaptcha-v3";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: "Centro Médico — Psicología y Medicina General",
  description: "Centro médico especializado en psicología, medicina general y consultas online. Agenda tu cita fácilmente desde nuestra plataforma.",
  keywords: ["psicología", "medicina", "consulta médica", "agendamiento online"],
  openGraph: {
    title: "Centro Médico — Psicología y Medicina General",
    description: "Centro médico especializado en psicología, medicina general y consultas online.",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630, alt: "Centro Médico" }],
    type: "website",
    locale: "es_CL",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <ReCaptchaProvider
  reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
  language="es"
>
  {children}
</ReCaptchaProvider>
      </body>
    </html>
  );
}
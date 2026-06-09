export const dynamic = 'force-dynamic';

import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

export async function POST(request) {
  try {
    const bodyData = await request.json();
    const rData = bodyData.reservaData || {};

    const baseUrl = "https://clinica-app-orpin.vercel.app";
    const preference = new Preference(client);

    // Creamos la preferencia empaquetando la información clave en metadata
    const result = await preference.create({
      body: {
        items: [
          {
            title: String(bodyData.servicio || "Atención Médica"),
            quantity: 1,
            unit_price: Math.round(Number(bodyData.precio || 15000)),
            currency_id: 'CLP',
          }
        ],
        metadata: { 
          // Guardamos todo en minúsculas para mapearlo sin problemas al volver
          profesional_id: String(rData.profesional_id || ""),
          fecha: String(rData.fecha || ""),
          hora_inicio: String(rData.hora_inicio || ""),
          hora_fin: String(rData.hora_fin || ""),
          paciente_nombre: String(rData.paciente_nombre || ""),
          paciente_email: String(rData.paciente_email || ""),
          paciente_telefono: String(rData.paciente_telefono || ""),
          servicio: String(bodyData.servicio || "")
        },
        back_urls: {
          success: `${baseUrl}/reservas/exito`,
          failure: `${baseUrl}/reservas`,
          pending: `${baseUrl}/reservas`,
        },
        auto_return: 'approved'
      }
    });

    return NextResponse.json({ 
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point 
    });

  } catch (error) {
    console.error("❌ Error en Mercado Pago:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
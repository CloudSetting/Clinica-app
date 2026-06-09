export const dynamic = 'force-dynamic';

import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

export async function POST(request) {
  try {
    const bodyData = await request.json();
    const queryRedirect = bodyData.queryRedirect || ""; // Capturamos los strings de datos del formulario

    const baseUrl = "https://clinica-app-orpin.vercel.app";
    const preference = new Preference(client);

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
        back_urls: {
          // Concatenamos los parámetros del formulario a la URL de éxito real de Mercado Pago
          success: `${baseUrl}/reservas/exito?${queryRedirect}`,
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
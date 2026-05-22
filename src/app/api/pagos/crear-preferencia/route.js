export const dynamic = 'force-dynamic'; // 👈 ESTO OBLIGA A VERCEL A GENERAR LA URL REAL EN TIEMPO REAL

import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

// 1. Configuración del cliente con tu Access Token de Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

export async function POST(request) {
  try {
    const { servicio, precio, reservaData } = await request.json();

    // 2. Definimos la URL base apuntando a tu dominio de Vercel
    const baseUrl = "https://clinica-app-orpin.vercel.app";
    const preference = new Preference(client);

    // 3. Creación de la preferencia
    const result = await preference.create({
      body: {
        items: [
          {
            title: servicio || "Reserva Médica",
            quantity: 1,
            unit_price: Number(precio) || 15000,
            currency_id: 'CLP',
          }
        ],
        metadata: { 
          profesional_id: reservaData.profesional_id,
          paciente_nombre: reservaData.paciente_nombre,
          paciente_email: reservaData.paciente_email,
          paciente_telefono: reservaData.paciente_telefono,
          servicio: reservaData.servicio,
          fecha: reservaData.fecha,
          hora: reservaData.hora,
        },
        back_urls: {
          success: `${baseUrl}/reservas/exito`,
          failure: `${baseUrl}/reservas`,
          pending: `${baseUrl}/reservas`,
        },
        auto_return: 'approved',
        notification_url: `${baseUrl}/api/pagos/webhook`,
      }
    });

    console.log("✅ Preferencia creada con éxito. ID:", result.id);
    return NextResponse.json({ init_point: result.init_point });

  } catch (error) {
    console.error("❌ Error detallado en Mercado Pago:", error);
    return NextResponse.json({ 
      error: 'Error al crear el pago',
      details: error.message 
    }, { status: 500 });
  }
}
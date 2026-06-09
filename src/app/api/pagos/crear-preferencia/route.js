export const dynamic = 'force-dynamic';

import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

export async function POST(request) {
  try {
    const bodyData = await request.json();
    console.log("📥 Datos recibidos en el backend:", bodyData);

    // Extraemos las variables con respaldos por si vienen anidadas o directas
    const servicio = bodyData.servicio || bodyData.reservaData?.servicio || "Reserva Médica";
    const precioRaw = bodyData.precio || bodyData.reservaData?.precio || 15000;
    
    // Forzamos un número entero redondo (CLP no acepta decimales en Mercado Pago)
    const precioFinal = Math.round(Number(precioRaw));

    // Extraemos reservaData de forma segura para evitar caídas por 'undefined'
    const rData = bodyData.reservaData || {};

    const baseUrl = "https://clinica-app-orpin.vercel.app";
    const preference = new Preference(client);

    // Construcción de la preferencia optimizada para Sandbox Chile
    const result = await preference.create({
      body: {
        items: [
          {
            title: String(servicio),
            quantity: 1,
            unit_price: precioFinal,
            currency_id: 'CLP',
          }
        ],
        // Datos de auditoría para tu webhook/base de datos
        metadata: { 
          profesional_id: String(rData.profesional_id || "sin_id"),
          paciente_nombre: String(rData.paciente_nombre || "Paciente General"),
          paciente_email: String(rData.paciente_email || "test@test.com"),
          paciente_telefono: String(rData.paciente_telefono || "912345678"),
          servicio: String(servicio),
          fecha: String(rData.fecha || ""),
          hora: String(rData.hora || ""),
        },
        // Obligatorio en algunos flujos de pruebas para validar la tarjeta sandbox
        payer: {
          email: String(rData.paciente_email || "test_user_123@testuser.com"),
          name: String(rData.paciente_nombre || "Carlos"),
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
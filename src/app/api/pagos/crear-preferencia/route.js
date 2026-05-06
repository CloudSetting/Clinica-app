import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

// 1. Configuración del cliente con tu Access Token de Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

export async function POST(request) {
  try {
    const { servicio, precio, reservaData } = await request.json();

    // 2. Definimos la URL base de tu túnel activo
    // Usamos la de Cloudflare que generaste para que Mercado Pago pueda acceder
// Cambia esta línea con la URL que te dio el último comando de untun
const baseUrl = "https://sea-explicit-combat-joined.trycloudflare.com";
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
        // Metadatos que recibirá el Webhook para guardar en Supabase
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
          success: `${baseUrl}/test`, // Cambia /test por tu página de éxito final luego
          failure: `${baseUrl}/test`,
          pending: `${baseUrl}/test`,
        },
        auto_return: 'approved',
        // El Webhook: Mercado Pago enviará un POST a esta dirección al confirmar el pago
        notification_url: `${baseUrl}/api/pagos/webhook`,
      }
    });

    console.log("✅ Preferencia creada con éxito. ID:", result.id);

    // Devolvemos el init_point para que el frontend redirija al usuario
    return NextResponse.json({ init_point: result.init_point });

  } catch (error) {
    console.error("❌ Error detallado en Mercado Pago:", error);
    
    return NextResponse.json({ 
      error: 'Error al crear el pago',
      details: error.message 
    }, { status: 500 });
  }
}
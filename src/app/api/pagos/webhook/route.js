import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
// Usamos SERVICE_ROLE para saltarnos cualquier política RLS en el webhook interno
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 1. Intentamos obtener el tipo e ID desde los Parámetros de la URL
    let id = searchParams.get('data.id') || searchParams.get('id');
    let type = searchParams.get('type') || searchParams.get('topic');

    // 2. Si no venían en la URL, Mercado Pago los envía en el Body (JSON)
    if (!id || !type) {
      try {
        const body = await request.json();
        if (body.data && body.data.id) id = body.data.id;
        if (body.type) type = body.type;
      } catch (e) {
        // No venía JSON en el body, ignoramos el error
      }
    }

    // 3. Procesamos solo si es un pago
    if ((type === 'payment' || type === 'chargeback') && id) {
      const payment = await new Payment(client).get({ id });
      
      if (payment.status === 'approved') {
        console.log("💰 Pago confirmado para:", payment.metadata.paciente_nombre);
        
        // Insertar en Supabase
        const { error } = await supabase.from('reservas').insert({
          profesional_id: payment.metadata.profesional_id,
          paciente_nombre: payment.metadata.paciente_nombre,
          paciente_email: payment.metadata.paciente_email,
          paciente_telefono: payment.metadata.paciente_telefono,
          servicio: payment.metadata.servicio,
          fecha: payment.metadata.fecha,
          hora: payment.metadata.hora,
          estado: 'confirmada'
        });

        if (error) {
          console.error("❌ Error Supabase:", error);
          // Le devolvemos un 500 a Mercado Pago para que vuelva a intentar si falló la DB
          return new Response('Error guardando en base de datos', { status: 500 });
        }
        
        console.log("✅ Reserva guardada con éxito!");
      }
    }

    // Siempre responder 200 a Mercado Pago para que sepa que recibimos el webhook
    return new Response('OK', { status: 200 });

  } catch (err) {
    console.error("❌ Error General en Webhook:", err);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Para pruebas en el navegador
export async function GET() {
  return new Response('Webhook activo y escuchando...', { status: 200 });
}
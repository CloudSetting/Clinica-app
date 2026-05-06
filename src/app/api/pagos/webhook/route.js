import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('data.id');
  const type = searchParams.get('type');

  if (type === 'payment' && id) {
    try {
      const payment = await new Payment(client).get({ id });
      if (payment.status === 'approved') {
        console.log("💰 Pago confirmado para:", payment.metadata.paciente_nombre);
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
        if (error) console.error("❌ Error Supabase:", error);
        else console.log("✅ Reserva guardada!");
      }
    } catch (err) { console.error("❌ Error Webhook:", err); }
  }
  return new Response('OK', { status: 200 });
}

// Esto es solo para que no te dé 404 al probar en el navegador
export async function GET() {
  return new Response('Webhook activo', { status: 200 });
}
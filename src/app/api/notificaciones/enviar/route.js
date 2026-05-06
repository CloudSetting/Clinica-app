import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

// Configuración de Supabase (usando Service Role para saltar RLS si es necesario)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { reservaId } = await request.json();

    // 1. Obtener los detalles de la reserva desde Supabase
    const { data: reserva, error } = await supabase
      .from('reservas')
      .select('*, profesionales(nombre, apellido)')
      .eq('id', reservaId)
      .single();

    if (error || !reserva) throw new Error("Reserva no encontrada");

    // 2. Enviar el correo con Resend
    const { data, error: mailError } = await resend.emails.send({
      from: 'Clinica <onboarding@resend.dev>', // Luego podrás usar tu propio dominio
      to: [reserva.paciente_email],
      subject: `Confirmación de Cita #${reservaId.toString().split('-')[0].toUpperCase()}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h1 style="color: #2563eb;">¡Tu cita está confirmada!</h1>
          <p>Hola <strong>${reserva.paciente_nombre}</strong>,</p>
          <p>Tu reserva para <strong>${reserva.servicio}</strong> ha sido agendada con éxito.</p>
          <hr />
          <p><strong>Especialista:</strong> ${reserva.profesionales.nombre} ${reserva.profesionales.apellido}</p>
          <p><strong>Fecha:</strong> ${reserva.fecha}</p>
          <p><strong>Hora:</strong> ${reserva.hora ? reserva.hora.substring(0, 5) : 'Por definir'} hrs</p>
          <hr />
          <p style="font-size: 12px; color: #666;">Si necesitas cancelar, por favor contáctanos con 24 hrs de antelación.</p>
        </div>
      `,
    });

    if (mailError) throw mailError;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error enviando correo:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
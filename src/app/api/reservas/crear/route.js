import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { profesional_id, paciente_nombre, paciente_email, servicio, fecha, hora } = body;

    // 1. Llamada a la función RPC
    const { data, error } = await supabase.rpc('crear_reserva_segura', {
      p_profesional_id: profesional_id,
      p_paciente_nombre: paciente_nombre,
      p_paciente_email: paciente_email,
      p_servicio: servicio,
      p_fecha: fecha,
      p_hora: hora
    });

    if (error) throw error;

    // 2. Manejo de error 409 (Ocupado)
    if (data.status === 409) {
      return NextResponse.json({ mensaje: data.error }, { status: 409 });
    }

    // --- AQUÍ PONES EL CÓDIGO ---
    // 3. Respuesta de éxito con la DATA completa (incluyendo el ID generado)
    return NextResponse.json({ 
      data: data.data, // Aquí viene la fila insertada con su ID
      mensaje: "Reserva creada con éxito" 
    }, { status: 201 });

  } catch (err) {
    console.error("Error en API Route:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
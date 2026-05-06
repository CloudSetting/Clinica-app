import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { nombre,  email, telefono,  fecha, hora, motivo, recaptchaToken } =
      await req.json();

    // Verificar reCAPTCHA
    if (recaptchaToken) {
      const verificacion = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
        }
      );
      const resultado = await verificacion.json();
      if (!resultado.success || resultado.score < 0.5) {
        return NextResponse.json(
          { mensaje: "Verificación de seguridad fallida. Intenta de nuevo." },
          { status: 400 }
        );
      }
    }

    // Guardar en Supabase
    const { error } = await supabaseAdmin.from("reservas").insert([
      {
        paciente_nombre: nombre,
        paciente_email: email,
        paciente_telefono: telefono,
        fecha,
        hora_inicio: hora,
        hora_fin: hora,
        estado: "pendiente",
        notas: motivo,
      },
    ]);

    if (error) throw new Error(error.message);

    return NextResponse.json({ mensaje: "Reserva creada exitosamente" });
  } catch (err: unknown) {
    const mensaje = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ mensaje }, { status: 500 });
  }
}
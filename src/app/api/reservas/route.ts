import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { nombre, apellido, email, telefono, especialidad, fecha, hora, motivo, recaptchaToken } =
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
    const { error } = await supabase.from("reservas").insert([
      {
        nombre,
        apellido,
        email,
        telefono,
        especialidad,
        fecha,
        hora,
        motivo,
        estado: "pendiente",
      },
    ]);

    if (error) throw new Error(error.message);

    return NextResponse.json({ mensaje: "Reserva creada exitosamente" });
  } catch (err: unknown) {
    const mensaje = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ mensaje }, { status: 500 });
  }
}
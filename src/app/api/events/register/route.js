import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabase-server';

export async function POST(request) {
  try {
    const data = await request.json();

    // Validaciones básicas de backend (Defensa en profundidad)
    if (!data.event_id || !data.full_name || !data.email || !data.id_document) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    if (!data.email.includes('@')) {
      return NextResponse.json(
        { error: 'Formato de correo inválido' },
        { status: 400 }
      );
    }

    // Inserción en Supabase utilizando el cliente con Service Role
    // Esto puentea RLS y garantiza que el registro se guarde desde un backend seguro
    const { error: insertError } = await supabaseServer
      .from('event_registrations')
      .insert([data]);

    if (insertError) {
      console.error('Supabase insert error (Backend):', insertError);
      return NextResponse.json(
        { error: 'Error interno al registrar el evento' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Registro exitoso' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected Backend error:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error inesperado en el servidor' },
      { status: 500 }
    );
  }
}

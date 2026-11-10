import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabase-server';

const requiredText = ['event_id', 'full_name', 'email', 'id_document', 'organization', 'position', 'phone_number'];

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || requiredText.some(key => typeof body[key] !== 'string' || !body[key].trim())) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const data = Object.fromEntries(requiredText.map(key => [key, body[key].trim()]));
    data.is_member = body.is_member;
    data.image_use_content = body.image_use_content;
    data.following_social_media = body.following_social_media;
    data.member_id = typeof body.member_id === 'string' ? body.member_id.trim() || null : null;
    data.major = typeof body.major === 'string' ? body.major.trim() || null : null;

    if (!/^[^\s@]+@[^\s@]+$/.test(data.email) || data.id_document.length > 20 ||
        !/^\d{9}$/.test(data.phone_number) || typeof data.is_member !== 'boolean' ||
        typeof data.image_use_content !== 'boolean' || data.following_social_media !== true ||
        (data.is_member && !/^\d{8}$/.test(data.member_id)) ||
        (/estudiante|student/i.test(data.position) && !data.major)) {
      return NextResponse.json({ error: 'Revisa los datos del formulario de inscripción.' }, { status: 400 });
    }

    const { data: event, error } = await supabaseServer.from('eventos')
      .select('inscription,fecha_programada').eq('id', data.event_id).maybeSingle();
    if (error) throw error;
    if (!event?.inscription || !(Date.parse(event.fecha_programada) >= Date.now())) {
      return NextResponse.json({ error: 'Las inscripciones para este evento están cerradas.' }, { status: 409 });
    }
    data.registered_at = new Date().toISOString();
    const { error: insertError } = await supabaseServer.from('event_registrations').insert(data);
    if (insertError) throw insertError;
    return NextResponse.json({ message: 'Registro exitoso' }, { status: 201 });
  } catch (error) {
    console.error('Error al registrar la inscripción:', error);
    return NextResponse.json({ error: 'Error interno al registrar el evento' }, { status: 500 });
  }
}

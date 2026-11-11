import { publicDatabase } from '@/src/lib/publicDatabase';
import { sanitizePublication } from '@/src/lib/sanitizePublication';

export async function GET(request, { params }) {
  const { id } = await params;
  const { data, error } = await publicDatabase.from('eventos')
    .select('id,titulo,descripcion,fecha_programada,inscription,hora,modalidad').eq('id', id).maybeSingle();
  if (error || !data) return new Response(null, { status: 404 });
  return Response.json({ ...data, descripcion: sanitizePublication(data.descripcion) });
}

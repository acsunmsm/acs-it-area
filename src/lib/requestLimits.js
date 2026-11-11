import { createHash } from 'node:crypto';

const counters = new Map();

function localLimit(key, limit, minute) {
  if (counters.size > 4096) {
    for (const [id, value] of counters) if (value.minute !== minute) counters.delete(id);
    if (counters.size > 4096 && !counters.has(key)) return false;
  }
  const current = counters.get(key);
  const count = current?.minute === minute ? current.count + 1 : 1;
  counters.set(key, { minute, count });
  return count <= limit;
}

export async function limitedBody(request, { scope, bytes, perMinute, form = false }) {
  // Only trust a header overwritten by the deployment's ingress proxy.
  const ipHeader = process.env.VERCEL === '1' ? 'x-vercel-forwarded-for' : process.env.TRUSTED_CLIENT_IP_HEADER;
  const client = (ipHeader && request.headers.get(ipHeader)?.split(',')[0].trim()) || 'shared';
  const key = createHash('sha256').update(scope + ':' + client).digest('hex');
  const limit = client === 'shared' ? perMinute * 4 : perMinute;
  if (!localLimit(key, limit, Math.floor(Date.now() / 60000))) {
    return Response.json({ error: 'Demasiadas solicitudes' }, { status: 429, headers: { 'Retry-After': '60' } });
  }
  if (process.env.NODE_ENV === 'production') {
    const { supabaseServer } = await import('./supabase-server.js');
    const { data, error } = await supabaseServer.rpc('consume_request_quota', { key_hash: key, quota: limit });
    if (error) return Response.json({ error: 'Servicio temporalmente no disponible' }, { status: 503 });
    if (!data) return Response.json({ error: 'Demasiadas solicitudes' }, { status: 429, headers: { 'Retry-After': '60' } });
  }
  const tooLarge = () => Response.json({ error: 'Solicitud demasiado grande' }, { status: 413 });
  if (Number(request.headers.get('content-length')) > bytes) return tooLarge();
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400 });
  let size = 0;
  const chunks = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > bytes) {
        await reader.cancel();
        return tooLarge();
      }
      chunks.push(value);
    }
    const bounded = new Response(Buffer.concat(chunks), { headers: { 'Content-Type': request.headers.get('content-type') || '' } });
    return form ? await bounded.formData() : await bounded.json();
  } catch {
    return Response.json({ error: 'Solicitud inválida' }, { status: 400 });
  } finally {
    reader.releaseLock();
  }
}

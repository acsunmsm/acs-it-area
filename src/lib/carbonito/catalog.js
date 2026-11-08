// The public catalog uses exactly the permissions of an unauthenticated visitor.
const tables = {
  events: ['eventos', 'id,titulo,fecha,hora,fecha_programada,modalidad,inscription'],
  news: ['noticias', 'id,titulo,fecha,extracto']
};

async function read(table, params) {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const url = new URL('/rest/v1/' + table, process.env.NEXT_PUBLIC_SUPABASE_URL);
  url.search = new URLSearchParams(params).toString();
  const response = await fetch(url, {
    headers: { apikey:key, Authorization:'Bearer ' + key },
    next: { revalidate:60 }, signal:AbortSignal.timeout(4500)
  });
  if (!response.ok) throw new Error('Catalog unavailable');
  return response.json();
}

export async function listPublications(kind) {
  const [table, select] = tables[kind];
  const rows = [];
  const pageSize = 200;
  for (let offset = 0; ; offset += pageSize) {
    const page = await read(table, {select, order:'fecha.desc.nullslast,id.asc', offset, limit:pageSize});
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

export async function eventDescription(id) {
  const records = await read('eventos', {select:'descripcion', id:'eq.' + id, limit:1});
  return plainText(records[0]?.descripcion);
}

export function plainText(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}


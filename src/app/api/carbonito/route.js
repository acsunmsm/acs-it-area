import { limitedBody } from '@/src/lib/requestLimits';
import es from '@/messages/es.json';
import en from '@/messages/en.json';
import { answer } from '@/src/lib/carbonito/respond';
import { eventDescription, listPublications } from '@/src/lib/carbonito/catalog';
import { selectWithModel } from '@/src/lib/carbonito/model';

export async function POST(request) {
  const body = await limitedBody(request, { scope: 'carbonito', bytes: 8192, perMinute: 35 });
  if (body instanceof Response) return body;
  if (!body || !['en','es'].includes(body.lang) || typeof body.question !== 'string' ||
      !body.question.trim() || body.question.length > 500) return new Response(null,{status:400});
  const prev = body.previous;
  const previous = typeof prev?.topic === 'string' && prev.topic.length <= 64 ? {
    topic:prev.topic, ids:Array.isArray(prev.ids) ? prev.ids.filter(id => typeof id === 'string' && id.length <= 64).slice(0,3) : []
  } : null;
  const result = await answer({
    question:body.question.trim(), lang:body.lang, previous,
    dictionary:body.lang === 'es' ? es : en, list:listPublications, describe:eventDescription,
    selectSource:process.env.CARBONITO_OLLAMA_MODEL ? selectWithModel : undefined
  });
  return Response.json(result,{headers:{'Cache-Control':'no-store'}});
}


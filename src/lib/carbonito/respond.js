import { knowledge } from './knowledge.js';
import { elementAnswer } from './chemistry.js';
import { findTopic, normalize, terms, searchSources } from './search.js';
import { liveKind, isReference, publicationAnswer } from './publications.js';

const signup = /\b(inscri\w*|registr\w*|sign up|apuntarme|apuntarse|me apunto)\b/;
const membershipDetail = /\b(cuesta|costo|pagar|cuota|precio|requisitos|documentos|deadline|fee|fees|cost|requirements|plazo)\b/;

export async function answer({question, lang, previous, dictionary:d, list, describe, selectSource, now = new Date()}) {
  const es = lang === 'es';
  const docs = knowledge(lang,d);
  const q = normalize(question);
  const response = (text, links = [], topic = 'unknown', pose = 'explica') => ({text,links,pose,context:{topic}});
  const contact = {label:d.navbar.contact,href:'/' + lang + '/contact'};
  const fromDoc = doc => response(doc.text,doc.links,doc.id,doc.pose);
  const fallback = () => response(d.mascota.noEntiendo, [contact], 'unknown', 'piensa');
  let doc = findTopic(question,docs);
  const parts = q.split(/\s+(?:y|and)\s+/);
  if (parts.length === 2) {
    const pair = parts.map(part => findTopic(part,docs));
    if (pair.every(item => item && !['events','news','about','board','resources'].includes(item.id) && item.links.length) && pair[0].id !== pair[1].id) {
      const links = [...new Map(pair.flatMap(item => item.links).map(link => [link.href,link])).values()];
      return response(pair.map(item => item.text).join('\n\n'),links,pair[1].id);
    }
  }
  const explicitKind = liveKind(q);
  const priorLive = ['events','news'].includes(previous?.topic);
  const refersBack = priorLive && isReference(q) && (!doc || ['events','news','horario'].includes(doc.id));
  const kind = explicitKind || (refersBack ? previous.topic : null);
  if (kind && (!doc || !doc.id.startsWith('board-'))) {
    try {
      return await publicationAnswer({kind,question,lang,previous,rows:await list(kind),now,describe});
    } catch {
      const source = docs.find(item => item.id === kind);
      return response(es ? 'No pude consultar el listado en este momento. Puedes volver a preguntarme o abrir la página.' : 'I couldn’t load the listing right now. Try again or open the page.', source.links,kind,'piensa');
    }
  }
  if ((doc?.id === 'join' || (!doc && previous?.topic === 'join')) && membershipDetail.test(q)) {
    return response(es ? 'El capítulo admite estudiantes de cualquier año. Para confirmar cuotas, documentos o plazos, envía tu consulta de membresía mediante el formulario de Contacto.' : 'Students from any year can join. For confirmation of fees, documents or deadlines, send a membership enquiry through the Contact form.', [contact], 'join');
  }
  if (!doc && signup.test(q)) return response(es ? '¿Quieres unirte al capítulo o inscribirte en un evento? Dime cuál y te guío.' : 'Do you want to join the chapter or register for an event?', [contact, {label:d.navbar.events,href:'/'+lang+'/events'}], 'clarify');
  if (!doc && previous?.topic === 'clarify' && /\b(capitulo|chapter)\b/.test(q)) doc = docs.find(x => x.id === 'join');
  if (!doc && previous?.topic && /^(y |and )?(el |the )?(enlace|link|url|donde|donde lo encuentro|where can i find it|como accedo)( por favor| please)?$/.test(q)) doc = docs.find(x => x.id === previous.topic);
  if (!doc || doc.id === 'resources') {
    const element = elementAnswer(question,lang,previous);
    if (element) return element;
  }
  if (doc) return fromDoc(doc);

  // An activity or article may be referred to by its title alone.
  if (terms(q).length) {
    const hits = await Promise.all(['events','news'].map(async category => {
      try { return await publicationAnswer({kind:category,question,lang,previous:null,rows:await list(category),now,describe,namedOnly:true}); }
      catch { return null; }
    }));
    const match = hits.find(Boolean);
    if (match) return match;
  }
  let source = searchSources(question,docs);
  if (!source && selectSource) {
    const id = await selectSource({question, previous:previous?.topic, docs}).catch(() => null);
    source = docs.find(item => item.id === id);
  }
  if (source) {
    if (['events','news'].includes(source.id)) {
      return answer({question:source.cues[0],lang,previous:null,dictionary:d,list,describe,now});
    }
    return fromDoc(source);
  }
  return fallback();
}


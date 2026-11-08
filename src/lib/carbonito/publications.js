import { plainText } from './catalog.js';
import { normalize, titleMatches } from './search.js';

const followup = /\b(donde|cuando|hora|lugar|modalidad|inscri\w*|registro|registr\w*|enlace|link|precio|costo|cuesta|gratis|virtual|presencial|detalles|resumen|where|when|time|venue|cost|price|free|register|sign up|how much|details|summary|more about it)\b/;
const ordinalWords = [/\b(primero|primera|primer|first|1)\b/, /\b(segundo|segunda|second|2)\b/, /\b(tercero|tercera|tercer|third|3)\b/];
const past = /\b(pasados?|pasadas?|anterior(?:es)?|realizaron|hubo|hicieron|ultimos?|ultimas?|past|previous|held|last event)\b/;
const listing = /\b(proxim\w*|upcoming|next|hoy|today|manana|tomorrow|esta semana|this week|este mes|this month|pasad\w*|previous|past|novedades|latest|recientes)\b/;
export const liveKind = q => /\b(noticias?|news|articles?|novedades)\b/.test(q) ? 'news'
  : /\b(eventos?|events?|talleres|taller|workshops?|charlas?|talks?|actividades|activities|conferencias?|seminarios?)\b/.test(q) ? 'events' : null;

export function isReference(q) {
  return ordinalWords.some(re => re.test(q)) || followup.test(q) || listing.test(q) || /\b(cuentame mas|tell me more|amplia|mas informacion)\b/.test(q);
}

const dayInLima = date => new Intl.DateTimeFormat('en-CA', {timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
function dateRange(q, now) {
  const today = dayInLima(now);
  const day = new Date(today + 'T12:00:00Z');
  if (/\b(manana|tomorrow)\b/.test(q)) {
    day.setUTCDate(day.getUTCDate() + 1);
    return [day.toISOString().slice(0,10), day.toISOString().slice(0,10)];
  }
  if (/\b(hoy|today)\b/.test(q)) return [today, today];
  if (/\b(esta semana|this week)\b/.test(q)) {
    day.setUTCDate(day.getUTCDate() + (7 - day.getUTCDay()) % 7);
    return [today, day.toISOString().slice(0,10)];
  }
  if (/\b(este mes|this month)\b/.test(q)) return [today, today.slice(0,7) + '-31'];
  const monthNames = ['enero january','febrero february','marzo march','abril april','mayo may','junio june','julio july','agosto august','septiembre setiembre september','octubre october','noviembre november','diciembre december'];
  const month = monthNames.findIndex(names => names.split(' ').some(name => q.split(' ').includes(name)));
  const year = q.match(/\b(20\d{2})\b/)?.[1];
  if (month !== -1) {
    const prefix = (year || today.slice(0,4)) + '-' + String(month + 1).padStart(2,'0');
    return [prefix + '-01', prefix + '-31'];
  }
  if (year) return [year+'-01-01',year+'-12-31'];
  return null;
}

function eventTime(row, lang) {
  if (!row.fecha) return '';
  const date = new Date(row.fecha + 'T12:00:00Z');
  if (!Number.isFinite(date.getTime())) return '';
  const modes = {'en persona':'In person', presencial:'In person', virtual:'Online', hibrida:'Hybrid', hibrido:'Hybrid'};
  const mode = lang === 'en' ? (modes[normalize(row.modalidad || '')] || row.modalidad) : row.modalidad;
  return [date.toLocaleDateString(lang === 'es' ? 'es-PE' : 'en-US', {timeZone:'UTC',dateStyle:'long'}), row.hora?.slice(0,5), mode].filter(Boolean).join(' · ');
}

export async function publicationAnswer({kind, question, lang, previous, rows, now, describe, namedOnly = false}) {
  const q = normalize(question);
  const es = lang === 'es';
  const events = kind === 'events';
  const section = {label:events ? (es ? 'Eventos' : 'Events') : (es ? 'Noticias' : 'News'), href:'/' + lang + '/' + kind};
  const reply = (text, links = [section], items = []) => ({text, links, pose:'explica', context:{topic:kind, ids:items.map(r => String(r.id))}});
  const future = row => row.fecha_programada ? new Date(row.fecha_programada) >= now : row.fecha >= dayInLima(now);
  const range = dateRange(q, now);
  const subject = q.match(/\b(?:eventos?|events?|taller(?:es)?|workshops?|charlas?|noticias?|news|articles?)\s+(?:sobre|acerca de|about|on)\s+(.+)/)?.[1];
  let matches = titleMatches(subject || question, rows);
  if (subject && !matches.length && !events) matches = rows.filter(r => normalize(r.extracto || '').includes(subject));
  if (subject && !matches.length) return reply(es ? 'No encontré una publicación sobre ese tema en el listado. Puedes revisar los demás títulos aquí.' : 'I found no listing on that topic. You can browse the other titles here.');
  let items = matches;
  let selected = false;
  const prior = (previous?.ids || []).map(id => rows.find(row => String(row.id) === id)).filter(Boolean);
  if (previous?.topic === kind && prior.length && !listing.test(q) && !matches.length && isReference(q)) {
    const index = ordinalWords.findIndex(re => re.test(q));
    if (index < 0 && prior.length > 1) {
      return reply(es ? '¿A cuál te refieres? Puedes decir «el primero» o escribir su título.\n' + prior.map((x,i) => (i+1) + '. ' + x.titulo).join('\n') :
        'Which one do you mean? Give me its number or title.\n' + prior.map((x,i) => (i+1) + '. ' + x.titulo).join('\n'), [section], prior);
    }
    const row = prior[Math.max(0,index)];
    if (!row) return reply(es ? 'Ese número está fuera de la lista. Elige un título de la respuesta anterior.' : 'That number is outside the list. Choose a title from my previous answer.', [section], prior);
    items = [row]; selected = true;
  } else if (!matches.length && namedOnly) return null;
  else {
    if (!items.length) items = rows;
    if (range) items = items.filter(r => r.fecha >= range[0] && r.fecha <= range[1]);
    if (events && (!matches.length || listing.test(q) || past.test(q))) {
      const historical = past.test(q) || (range && range[1] < dayInLima(now));
      if (past.test(q) || !range || range[0] >= dayInLima(now)) items = items.filter(r => historical ? !future(r) : future(r));
      items = items.sort((a,b) =>
        (historical ? -1 : 1) * ((a.fecha || '').localeCompare(b.fecha || '') || (a.hora || '').localeCompare(b.hora || '')));
    }
    if (events && !matches.length) {
      const format = [/\b(taller(?:es)?|workshops?)\b/, /\b(charlas?|talks?)\b/, /\b(seminarios?|seminars?)\b/].find(pattern => pattern.test(q));
      if (format) items = items.filter(r => format.test(normalize(r.titulo)));
    }
    if (!items.length) return reply(es ? 'No encontré publicaciones que coincidan en el listado público. Puedes consultar el listado completo aquí.' : 'I found no matching entries in the public listing. You can check the full listing here.');
    items = items.slice(0, /\b(proximo evento|siguiente evento|ultimo evento|next event|last event|ultima noticia|latest article)\b/.test(q) ? 1 : 3);
    selected = items.length === 1;
  }
  const details = row => section.href + '/' + encodeURIComponent(row.id) + (events ? '/details' : '');
  const links = items.map(row => ({label:row.titulo, href:details(row)}));
  const lines = items.map((row,i) => {
    const facts = events ? eventTime(row,lang) : [row.fecha, selected ? plainText(row.extracto) : ''].filter(Boolean).join(' · ');
    return (items.length > 1 ? (i + 1) + '. ' : '') + row.titulo + (facts ? '\n' + facts : '');
  });
  if (selected && events) {
    const row = items[0];
    if (future(row) && row.fecha_programada && row.inscription === true) links.push({label:es ? 'Inscribirme' : 'Register', href:section.href + '/' + encodeURIComponent(row.id) + '/register'});
    else if (/\b(inscri\w*|registr\w*|sign up)\b/.test(q)) lines.push(es ? 'La web no ofrece una inscripción activa para este evento.' : 'The website has no active registration for this event.');
    if (followup.test(q) || /\b(mas|more)\b/.test(q)) {
      const description = await describe(row.id).catch(() => '');
      if (description) lines.push(description.length > 650 ? description.slice(0,647) + '…' : description);
      if (/\b(donde|lugar|direccion|precio|costo|cuesta|gratis|where|venue|cost|price|free)\b/.test(q)) lines.push(es ? 'Para confirmar la sede o el costo, consulta la ficha del evento o escribe al capítulo.' : 'For venue or price confirmation, check the event page or contact the chapter.');
    }
  }
  return reply(lines.join('\n\n'), links, items);
}


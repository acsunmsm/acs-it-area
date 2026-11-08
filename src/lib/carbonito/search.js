export function normalize(text) {
  return text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

const social = new Set(['identity', 'hello', 'thanks', 'bye', 'mood']);
const generic = new Set(['about', 'board', 'resources']);
const fillers = /^(?:hola |hello |hi |oye |hey |carbonito |por favor |please )+| (?:por favor|please|gracias|thanks)$/g;

export function findTopic(question, docs) {
  const clean = normalize(question);
  const query = clean.replace(fillers, '').trim() || clean;
  const padded = ' ' + query + ' ';
  let best = null;
  let high = 0;
  for (const doc of docs) {
    for (const cue of doc.cues) {
      const phrase = normalize(cue);
      if (!phrase || !padded.includes(' ' + phrase + ' ')) continue;
      if (phrase === 'acs unmsm' && query !== phrase && !/\b(que es|what is|who is|significa|sobre|about)\b/.test(query)) continue;
      if (phrase === 'uno' && !/\b(me uno|como uno)\b/.test(query)) continue;
      if (social.has(doc.id) && query !== phrase && ['carbonito','hi','hola','hey','hello','gracias','thanks'].includes(phrase)) continue;
      const specificity = Math.min(phrase.split(' ').length, 5);
      const broad = generic.has(doc.id) && query !== phrase;
      const score = (query === phrase ? 12 : 0) + specificity + (broad ? -0.5 : 1);
      if (score > high) { best = doc; high = score; }
    }
  }
  return best;
}

const stop = new Set(('a al ante con contra de del desde el en entre es esta este estos fue la las lo los me mi para por que se su sus un una y o the a an at in of or to for from by with and is are my our do does how what where when who can i you tell me about donde como cuando cuanto cual cuales quien quienes quiero saber quisiera tienen hay ver buscar sobre tengo puedo necesito quiero capitulo chapter acs unmsm evento event eventos events taller workshop noticia noticias news article').split(' '));

export function terms(text) {
  return [...new Set(normalize(text).split(' ').filter(word => word.length >= 3 && !stop.has(word)))];
}

function closeWord(a,b) {
  if (a.length < 5 || b.length < 5 || Math.abs(a.length-b.length) > 1) return false;
  let i = 0;
  while (i < Math.min(a.length,b.length) && a[i] === b[i]) i++;
  if (a.length === b.length) {
    return a.slice(i+1) === b.slice(i+1) ||
      (a[i] === b[i+1] && a[i+1] === b[i] && a.slice(i+2) === b.slice(i+2));
  }
  return a.length > b.length ? a.slice(i+1) === b.slice(i) : b.slice(i+1) === a.slice(i);
}

// Search the published answer as well as its aliases. A single common word
// is insufficient evidence. A unique long alias may contain one typing error.
export function searchSources(question, docs) {
  const words = terms(question);
  const index = docs.map(doc => ({doc, cues:terms(doc.cues.join(' ')), body:terms(doc.text)}));
  const scored = index.map(item => ({doc:item.doc,score:0,hits:0,typo:false}));
  for (const word of words) {
    const hits = index.map(({cues,body}) => cues.includes(word) ? 3 : body.includes(word) ? 1 : cues.some(c => closeWord(word,c)) ? 2 : 0);
    const frequency = hits.filter(Boolean).length;
    if (!frequency) continue;
    for (const [i, weight] of hits.entries()) {
      if (!weight) continue;
      scored[i].hits++;
      scored[i].score += weight * Math.log(1 + index.length/frequency);
      scored[i].typo ||= frequency === 1 && weight === 2 && word.length >= 6;
    }
  }
  const [best,next] = scored.sort((a,b) => b.score-a.score);
  if ((best.hits >= 2 || best.typo) && best.score >= 6 && best.score >= next.score * 1.4) return best.doc;
  return null;
}

// A rare word in a title (e.g. Goodyear) is stronger evidence than a shared generic word.
export function titleMatches(question, rows) {
  const words = terms(question);
  const indexed = rows.map(row => ({ row, words:terms(row.titulo || '') }));
  const counts = new Map();
  for (const item of indexed) for (const word of item.words) counts.set(word, (counts.get(word) || 0) + 1);
  return indexed.map(item => {
    const hits = item.words.filter(word => words.includes(word));
    const score = hits.reduce((sum, word) => sum + 1 / counts.get(word), 0);
    return {row:item.row, score, hits:hits.length, unique:hits.some(word => word.length >= 5 && counts.get(word) === 1)};
  }).filter(item => item.hits >= 2 || item.unique)
    .sort((a,b) => b.score - a.score).map(item => item.row);
}


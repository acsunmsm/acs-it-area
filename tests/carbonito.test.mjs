import { test } from 'node:test';
import assert from 'node:assert/strict';
import es from '../messages/es.json' with {type:'json'};
import en from '../messages/en.json' with {type:'json'};
import { answer } from '../src/lib/carbonito/respond.js';
import { selectWithModel } from '../src/lib/carbonito/model.js';
import { createServer } from 'node:http';

const now = new Date('2026-11-09T03:00:00Z'); // Sunday evening in Lima
const events = [
  {id:'1', titulo:'Taller de cromatografía', fecha:'2026-11-09', hora:'10:00:00', fecha_programada:'2026-11-09T15:00:00Z', modalidad:'Virtual', inscription:true},
  {id:'2', titulo:'Charla sobre polímeros', fecha:'2026-11-12', fecha_programada:'2026-11-12T17:00:00Z', inscription:false},
  {id:'3', titulo:'Visita a Goodyear', fecha:'2026-09-24', fecha_programada:'2026-09-24T15:00:00Z', inscription:true}
];
const news = [{id:'n1',titulo:'Simuladores para el laboratorio',fecha:'2026-10-14',extracto:'Nuevas herramientas de educación química.'}];
function ask(question, {lang='es',previous,...options} = {}) {
  return answer({question,lang,previous,dictionary:lang === 'es' ? es : en, now, list:async kind => kind === 'events' ? events : news,describe:async () => 'Información publicada por el capítulo.', ...options});
}

for (const [lang,question,topic] of [
  ['es','¿Quién eres?','identity'], ['es','¿Cómo me uno?','join'], ['es','Quiero estudiar química','resources'],
  ['es','Hola Carbonito, ¿cuál es la misión del capítulo?','mission'], ['es','¿Cuál es su visión?','vision'],
  ['es','¿Me pasas su Instagram?','social'], ['en','Where are you located?','location'], ['en','Where can I get a certificate?','verificar'],
  ['en','How do I join?','join'], ['en','Tell me a fun fact','fact'], ['en','Tell me a joke','joke'],
  ['es','¿Quién es la vicepresidenta?','board-presidency'], ['es','¿Tienen becas?','becas'],
  ['es','¿Qué es el pH?','ph'], ['en','What is molarity?','molarity'], ['en','What is a mole?','mole'],
  ['es','¿Cuál es el número atómico del oro?','element-Au'], ['en','What is element 118?','element-Og'],
  ['es','¿Cuál es su correeo?','contact'], ['es','Previsión de lluvia en Tokio','unknown'],
  ['en','How many moons does Saturn have?','unknown'], ['es','¿Cómo me inscribo?','clarify'],
  ['es','¿Cómo verifico mi certificado?','verificar'], ['en','I need to draw molecules','chemdraw']
]) test(question,async () => assert.equal((await ask(question,{lang})).context.topic,topic));

test('upcoming events, ordinal selection, location and registration use the same event',async () => {
  const list = await ask('¿Qué eventos hay?');
  assert.deepEqual(list.context.ids,['1','2']);
  const clarify = await ask('¿Dónde será?',{previous:list.context});
  assert.match(clarify.text,/cuál te refieres/);
  const first = await ask('El primero',{previous:clarify.context});
  assert.deepEqual(first.context.ids,['1']);
  const place = await ask('¿Dónde será?',{previous:first.context});
  assert.match(place.text,/Virtual/);
  assert(place.links.some(link => link.href.endsWith('/1/register')));
});
test('date boundaries follow Lima and archive records do not offer registration',async () => {
  assert.deepEqual((await ask('Events tomorrow',{lang:'en'})).context.ids,['1']);
  assert.deepEqual((await ask('Eventos esta semana')).context.ids,[]);
  const archive = await ask('¿Qué eventos pasados hubo?');
  assert.deepEqual(archive.context.ids,['3']);
  assert(!archive.links.some(link => link.href.endsWith('register')));
  assert.match((await ask('¿Cuándo fue Goodyear?')).text,/24 de se[p]?tiembre de 2026/);
});
test('news comes from the listing and links to the chosen article',async () => {
  const reply = await ask('Latest article',{lang:'en'});
  assert.match(reply.text,/Simuladores/);
  assert.equal(reply.links[0].href,'/en/news/n1');
});
test('compound questions and membership costs use the right chapter sources',async () => {
  const both = await ask('¿Cuál es su misión y visión?');
  assert(both.text.includes(es.about.missionText) && both.text.includes(es.about.visionText));
  assert.equal((await ask('¿Cuánto cuesta unirme al ACS UNMSM?')).context.topic,'join');
});
test('follow-up properties refer to the same element',async () => {
  const iron = await ask('Número atómico del hierro');
  const mass = await ask('¿Y su masa?',{previous:iron.context});
  assert.equal(mass.context.topic,'element-Fe');
});
test('no unrelated event is offered for a named subject missing from the calendar',async () => {
  const result = await ask('¿Hay eventos sobre astronomía?');
  assert.deepEqual(result.context.ids,[]);
  assert(!result.text.includes('cromatografía'));
});
test('empty results and connection failures have different messages',async () => {
  const empty = await ask('Próximo evento',{list:async () => []});
  assert.match(empty.text,/No encontré/);
  const failed = await ask('Próximo evento',{list:async () => {throw Error('timeout')}});
  assert.match(failed.text,/No pude consultar/);
});
test('unknown model output and unavailable model fall back safely',async () => {
  for (const selectSource of [async () => 'made-up',async () => {throw Error('offline')}]) {
    const reply = await ask('xyzpq',{selectSource});
    assert.equal(reply.context.topic,'unknown');
  }
});
test('optional model can select only a published answer',async () => {
  const server = createServer(async (req,res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    const payload = JSON.parse(body);
    const selection = payload.format.properties.id.enum.includes('vision') ? 'vision' : 'unknown';
    res.setHeader('Content-Type','application/json');
    res.end(JSON.stringify({message:{content:JSON.stringify({id:selection})}}));
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const saved = [process.env.CARBONITO_OLLAMA_URL,process.env.CARBONITO_OLLAMA_MODEL];
  try {
    process.env.CARBONITO_OLLAMA_URL = 'http://127.0.0.1:' + server.address().port;
    process.env.CARBONITO_OLLAMA_MODEL = 'test';
    const result = await ask('¿A dónde apuntan de aquí a unos años?',{selectSource:selectWithModel});
    assert.equal(result.text,es.about.visionText);
    assert.equal(result.links[0].href,'/es/about');
  } finally {
    for (const [index,key] of ['CARBONITO_OLLAMA_URL','CARBONITO_OLLAMA_MODEL'].entries()) {
      if (saved[index] === undefined) delete process.env[key]; else process.env[key] = saved[index];
    }
    await new Promise(resolve => server.close(resolve));
  }
});


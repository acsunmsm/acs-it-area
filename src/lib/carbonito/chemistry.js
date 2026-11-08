import elements from './elements.json' with {type:'json'};
import { normalize } from './search.js';

// Public reference values: https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON
const properties = /\b(atomico|atomica|atomic|simbolo|symbol|masa|mass|configuracion|configuration|protones|protons|elemento|element|electrones|electrons)\b/;
const aliases = { tungsteno:'W', krypton:'Kr', zirconio:'Zr', aluminium:'Al', sulphur:'S', yodo:'I' };
export function elementAnswer(question, lang, previous) {
  const q = normalize(question);
  const words = q.split(' ');
  const lookup = q.match(/\b(?:elemento|element|numero atomico|atomic number)\s+(?:numero |number |es |is |z )?(\d{1,3})\b/);
  const symbols = /^[A-Z][a-z]?$/.test(question.trim())
    ? [question.trim()] : [...question.matchAll(/(?:\b(?:de|del|of|for|elemento|element|symbol)\s+|\()([A-Z][a-z]?)\b/g)].map(match => match[1]);
  const byName = elements.find(e => [normalize(e.es),normalize(e.en)].some(name => words.includes(name)));
  const bySymbol = elements.find(e => (symbols.includes(e.symbol) && (properties.test(q) || question.trim() === e.symbol)) || words.some(w => aliases[w] === e.symbol));
  const prior = previous?.topic?.startsWith('element-') && properties.test(q) && /^(y |and |su |its |what is its |cual es su )/.test(q)
    ? elements.find(e => 'element-' + e.symbol === previous.topic) : null;
  const row = lookup ? elements.find(e => e.number === +lookup[1]) : byName || bySymbol || prior;
  if (!row || !(properties.test(q) || words.length === 1 || /^(que es (el |la )?|what is (the )?)[\p{L}]+$/u.test(q))) return null;
  const es = lang === 'es';
  const facts = es ? ['Número atómico: ' + row.number, 'Masa atómica: ' + row.mass + ' u'] :
    ['Atomic number: ' + row.number, 'Atomic mass: ' + row.mass + ' u'];
  if (row.electrons) facts.push((es ? 'Configuración electrónica: ' : 'Electron configuration: ') + row.electrons);
  return {text:(es ? row.es : row.en) + ' (' + row.symbol + ')\n' + facts.join('\n'), pose:'explica',
    links:[{label:'PubChem · ' + row.en,href:'https://pubchem.ncbi.nlm.nih.gov/element/' + row.number}], context:{topic:'element-' + row.symbol}};
}


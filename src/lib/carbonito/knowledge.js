import { getOfficerAreas } from '../officerAreas.js';
import { RECURSOS } from '../resources.js';

const resourceCues = {
  pubchem: 'pubchem|propiedades de moleculas|molecular properties|buscar compuestos|chemical compounds',
  nist: 'nist|termodinamica|thermodynamics|espectros|spectra',
  sds: 'sds|fds|ficha de seguridad|fichas de seguridad|hoja de seguridad|safety data sheet',
  chemtools: 'chemtools|calculos|calculadora|calculator|calculations|convertir unidades|convert units|van der waals|colebrook|antoine',
  chemdraw: 'chemdraw|molview|dibujar moleculas|dibujar estructuras|draw molecules|molecular drawing',
  horario: 'horario de clases|mis horarios|armar mi horario|generador de horarios|horarios|horario|sum|class schedule|timetable',
  verificar: 'certificado|certificados|constancia|constancias|certificate|certificates|diploma|diplomas|credencial|verify certificate',
  acsPubs: 'acs publications|acs pubs|publicaciones acs|revistas|journals|publicaciones cientificas',
  rsc: 'royal society of chemistry|rsc',
  becas: 'beca|becas|scholarships|scholarship|movilidad estudiantil'
};

const areaCues = {
  advisor: 'asesor|asesoria|advisor|adviser', presidency: 'presidencia|presidente|presidenta|president|vicepresidencia|vicepresidenta|vice president',
  executive: 'tesorera|tesoreria|treasurer|secretario|secretaria|secretary', marketing: 'marketing',
  events: 'coordinacion de eventos|events coordinator', humanResources: 'talento humano|human resources',
  liaison: 'vinculacion|liaison', technology: 'coordinacion de ti|coordinador de ti|tecnologias de la informacion|information technology',
  k12: 'k 12|k12'
};

export function knowledge(lang, d) {
  const es = lang === 'es';
  const local = (path, label) => ({ href: '/' + lang + path, label });
  const nav = (path, key) => local(path, d.navbar[key]);
  const about = nav('/about', 'about');
  const contact = nav('/contact', 'contact');
  const board = nav('/chapters', 'officers');
  const resources = nav('/resources', 'resources');
  const r = d.mascota.respuestas;
  const entry = (id, cues, text, links = [], pose = 'explica') => ({ id, cues: cues.split('|'), text, links, pose });
  const docs = [
    entry('ph','ph|escala de acidez', es ? 'El pH mide la acidez de una disolución. Se calcula como −log₁₀ de la actividad de H⁺. Una actividad de 0,001 corresponde a pH 3.' : 'pH measures the acidity of a solution. It is the negative base-ten logarithm of hydrogen ion activity. An activity of 0.001 gives pH 3.', [{label:'IUPAC · pH', href:'https://goldbook.iupac.org/terms/view/P04524'}]),
    entry('mole','mol|moles|mole|avogadro', es ? 'Un mol contiene exactamente 6,02214076 × 10²³ entidades. Hay que especificar qué estás contando, por ejemplo átomos de carbono o moléculas de agua.' : 'A mole contains exactly 6.02214076 × 10²³ entities. Specify what you are counting, such as carbon atoms or water molecules.', [{label:'IUPAC · mole',href:'https://goldbook.iupac.org/terms/view/M03980'}]),
    entry('molarity','molaridad|molarity|concentracion molar|molar concentration', es ? 'Divide los moles de soluto entre el volumen total de la disolución en litros. Por ejemplo, 0,5 mol en 2 L de disolución da 0,25 mol/L.' : 'Divide the moles of solute by the total solution volume in litres. For example, 0.5 mol in 2 L of solution gives 0.25 mol/L.', [{label:'IUPAC · amount concentration',href:'https://goldbook.iupac.org/terms/view/A00295'}]),
    entry('periodic','tabla periodica|periodic table|chemical elements|elementos quimicos', es ? 'La tabla ordena los elementos por número atómico. Puedes preguntarme por uno usando su nombre, símbolo o número.' : 'The periodic table orders the elements by atomic number. Ask me about one by name, symbol or number.', [{label:'PubChem',href:'https://pubchem.ncbi.nlm.nih.gov/periodic-table/'}]),
    entry('about', 'que es el acs|acs unmsm|quienes son|quienes somos|sobre el capitulo|about the chapter|what is acs|who are you guys|american chemical society', d.about.intro, [about]),
    entry('mission', 'mision|mission|objetivo|objetivos|cual es su proposito|purpose|goals', d.about.missionText, [about]),
    entry('vision', 'vision|aspiracion|long term aim', d.about.visionText, [about]),
    entry('join', 'unir|uno|unirme|unirse|integrarme|ser miembro|ser parte|membresia|membership|become a member|part of the team|join|sumarme|formar parte|postular|pertenecer|ingresar al capitulo', es
      ? 'Aceptamos estudiantes de cualquier año. En el formulario de Contacto puedes escribir «Quiero unirme» en el asunto y pedir los siguientes pasos.'
      : 'Students from any year can join. Open the Contact form, use “Membership” as the subject and ask the team for the next steps.', [contact]),
    entry('partnership', 'patrocinio|patrocinar|alianza|alianzas|colaborar|partnership|sponsor|collaborate', es ? 'Envía una propuesta mediante el formulario de Contacto. Incluye tu organización y qué actividad te gustaría apoyar.' : 'Send your proposal through the Contact form. Include your organization and the activity you would like to support.', [contact]),
    entry('contact', 'contacto|contact|contactar|contactarlos|correo|email|e mail|escribirles|escribo|reach you', (es ? 'El correo del capítulo es ' : 'The chapter email is ') + 'acs.unmsm@gmail.com.', [contact]),
    entry('location', 'ubicacion|direccion|donde estan|donde queda|donde se encuentran|donde se ubica|facultad|location|where are you located|where is the chapter|address', r.ubicacion, [contact]),
    entry('social', 'redes|instagram|facebook|linkedin|whatsapp|social media|social networks', es ? 'Estos son los canales públicos del capítulo.' : 'These are the chapter’s public channels.', [
      {label:'Instagram', href:'https://instagram.com/acs.unmsm.pe'}, {label:'Facebook', href:'https://www.facebook.com/profile.php?id=61571451074801'},
      {label:'LinkedIn', href:'https://www.linkedin.com/company/unmsmacs'}, {label:'WhatsApp', href:'https://whatsapp.com/channel/0029Vb06ZVS42DcioR683m2J'}
    ]),
    entry('board', 'directiva|directivos|dirigentes|equipo directivo|officers|board|leadership|leaders', d.officers.intro, [board]),
    entry('awards', 'premio|premios|reconocimientos|outstanding|green chemistry award|awards|award', [d.awards.academicYear, d.awards.outstandingAward, d.awards.greenChemAward, d.awards.description].join('\n'), [nav('', 'home')]),
    entry('resources', 'recursos|recursos cientificos|resources|estudiar quimica|study chemistry|aprender quimica', d.resources.intro, [resources]),
    entry('events', 'evento|eventos|event|events|taller|talleres|workshop|workshops|charlas|charla|talks|actividades|activities|conferencias|seminarios', r.eventos, [nav('/events','events')]),
    entry('news', 'noticias|noticia|news|novedades|notas de prensa|articles|announcements|latest article', d.navbar.news, [nav('/news','news')]),
    entry('identity', 'quien eres|quien sos|como te llamas|tu nombre|mascota|who are you|your name|mascot|carbonito', r.presentacion, [], 'celebra'),
    entry('fact', 'curiosidad|curiosidades|dato curioso|cuentame algo|fun fact|trivia|interesting fact', r.curiosidad),
    entry('joke', 'chiste|broma|joke|hazme reir|make me laugh', r.chiste, [], 'celebra'),
    ...[['hello','hola|hi|hello|hey|buenas|buenos dias|buenas tardes|buenas noches|saludos','saludo'],
      ['thanks','gracias|thanks|thank you|muchas gracias','gracias'], ['bye','adios|chau|chao|bye|hasta luego|nos vemos|goodbye','despedida'],
      ['mood','como estas|que tal|how are you|todo bien','animo']].map(([id,cues,key]) => entry(id,cues,r[key],[], 'celebra'))
  ];
  for (const item of RECURSOS) {
    const card = d.resources.fichas[item.id];
    const text = item.id === 'verificar' ? d.verificar.searchSubtitle : card.texto;
    const href = item.isInternal ? '/' + lang + item.url : item.url;
    docs.push(entry(item.id, resourceCues[item.id] + '|' + card.titulo, text, [{label:card.titulo, href}]));
  }
  const areas = getOfficerAreas(key => key.split('.').reduce((value, part) => value[part], d.officers));
  for (const area of areas) {
    const roster = area.members.map(m => m.role + ' — ' + m.name + '\n' + m.email).join('\n\n');
    docs.push(entry('board-' + area.id, [areaCues[area.id],area.title,...area.members.flatMap(m => [m.role, m.name])].join('|'), roster, [board]));
  }
  return docs;
}


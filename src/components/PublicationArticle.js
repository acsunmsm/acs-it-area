import PublicationImage from '@/src/components/PublicationImage';
import { cache } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
import { publicDatabase } from '@/src/lib/publicDatabase';
import { sanitizePublication } from '@/src/lib/sanitizePublication';
import Navbar from './Navbar';
import Footer from './Footer';
import styles from './PublicationArticle.module.css';

const requestTime = cache(() => Date.now());

const loadPublication = cache(async (kind, id) => {
  const table = kind === 'event' ? 'eventos' : 'noticias';
  const { data } = await publicDatabase.from(table).select('*').eq('id', id).single();
  return data;
});

export async function publicationMetadata(kind, params) {
  const { id, lang } = await params;
  const [record, t] = await Promise.all([
    loadPublication(kind, id), getTranslations({ locale: lang, namespace: 'publication' })
  ]);
  if (!record) return { title: t(kind === 'event' ? 'missingEvent' : 'missingNews') + ' · ACS UNMSM' };
  const summary = record.extracto || record.contenido || record.descripcion || '';
  return {
    title: record.titulo + ' · ACS UNMSM',
    description: summary.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)
  };
}

function publicationDate(record, lang) {
  const raw = record.fecha || record.fecha_programada;
  if (!raw) return null;
  const calendarDate = /^\d{4}-\d{2}-\d{2}$/.test(raw);
  const date = new Date(calendarDate ? raw + 'T12:00:00Z' : raw);
  if (!Number.isFinite(date.getTime())) return null;
  return <time dateTime={raw}>{date.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-PE', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: calendarDate ? 'UTC' : 'America/Lima'
  })}</time>;
}

function EventFacts({ record, date, t }) {
  let mode = record.modalidad?.trim();
  if (/^(en persona|presencial)$/i.test(mode)) mode = t('events.modeInPerson');
  if (/^virtual$/i.test(mode)) mode = t('events.modeVirtual');
  const facts = [[t('publication.date'), date], [t('publication.time'), record.hora?.slice(0, 5)], [t('publication.mode'), mode]]
    .filter(([, value]) => value);
  return facts.length > 0 && <dl className={styles.facts}>
    {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
  </dl>;
}

export default async function PublicationArticle({ kind, params }) {
  const { id, lang } = await params;
  const event = kind === 'event';
  const [record, t] = await Promise.all([loadPublication(kind, id), getTranslations({ locale: lang })]);
  const list = '/' + lang + (event ? '/events' : '/news');
  const back = <Link className={styles.back} href={list}>
    <FiArrowLeft aria-hidden="true" />{t(event ? 'publication.backEvents' : 'publication.backNews')}
  </Link>;

  if (!record) return <>
    <Navbar />
    <main className={styles.missing}><h1>{t(event ? 'publication.missingEvent' : 'publication.missingNews')}</h1>{back}</main>
    <Footer />
  </>;

  const date = publicationDate(record, lang);
  const category = !event && record.categoria && (t.has('news.categorias.' + record.categoria)
    ? t('news.categorias.' + record.categoria) : record.categoria);
  const body = event ? record.descripcion : record.contenido || record.descripcion || record.extracto;
  const lead = !event && record.extracto?.trim() !== body?.trim() && record.extracto?.trim();
  const registrationOpen = event && record.inscription && new Date(record.fecha_programada).getTime() > requestTime();

  return <>
    <Navbar />
    <main className={styles.page}>
      <article>
        <header className={styles.masthead} data-kind={kind}>
          <div className={styles.wrap}>
            <div className={styles.navRow}>{back}</div>
            <div className={styles.spread} data-cover={Boolean(record.imagen_url)}>
              <div className={styles.headline}>
                {!event && (category || date) && <div className={styles.byline}>
                  {category && <span>{category}</span>}{date}
                </div>}
                <h1>{record.titulo}</h1>
                {lead && <p className={styles.lead}>{lead}</p>}
                {event && <EventFacts record={record} date={date} t={t} />}
                {registrationOpen && <Link className={styles.register} href={list + '/' + id + '/register'}>
                  {t('events.registerButton')} <FiArrowRight aria-hidden="true" />
                </Link>}
              </div>
              {record.imagen_url && <figure className={styles.cover}>
                <a href={record.imagen_url} target="_blank" rel="noopener noreferrer"
                  aria-label={t(event ? 'publication.openPoster' : 'publication.openImage')}>
                  <PublicationImage sizes="(max-width: 720px) 90vw, 560px" src={record.imagen_url} alt={t(event ? 'publication.posterAlt' : 'publication.imageAlt', { title: record.titulo })}
                    fetchPriority="high" />
                  <span className={styles.expand} aria-hidden="true"><FiArrowUpRight /></span>
                </a>
              </figure>}
            </div>
          </div>
        </header>
        <div className={styles.reading}>
          {body && <div className={styles.prose} data-article-body=""
            dangerouslySetInnerHTML={{ __html: sanitizePublication(body) }} />}
          <div className={styles.end}>{back}</div>
        </div>
      </article>
    </main>
    <Footer />
  </>;
}

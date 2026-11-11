'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { FiArrowDown, FiArrowRight, FiArrowUpRight, FiBookOpen, FiDatabase, FiGrid, FiTool, FiAward } from 'react-icons/fi';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import { RECURSOS } from '@/src/lib/resources';
import styles from './resources.module.css';

const categories = { bases: FiDatabase, herramientas: FiTool, revistas: FiBookOpen, formacion: FiAward };

const glassware = {
  erlenmeyer: {
    outline: 'M34 14h16v24l21 40q4 9-6 10H18q-9-1-5-10l21-40z',
    reflection: 'M37 18v21L19 76', marks: 'M57 59h-6m10 8h-7m11 8h-7',
    lip: 9, level: 65, light: '#8dfdf2', dark: '#147a94', tilt: -12
  },
  volumetric: {
    outline: 'M38 13h9v37c0 8 18 17 18 30q0 9-9 11H29q-9-2-9-11c0-13 18-23 18-30z',
    reflection: 'M40 18v33c0 9-16 19-16 29', marks: 'M38 34h9',
    lip: 6, level: 35, light: '#cfb9ff', dark: '#6252b5', tilt: 9
  },
  boiling: {
    outline: 'M35 14h15v13l15 8-2 4-13-7v11c0 5 19 10 19 27a26 25 0 1 1-52 0c0-17 18-22 18-27z',
    reflection: 'M38 18v25c0 7-17 13-17 27', marks: '',
    lip: 9, level: 67, light: '#8edfff', dark: '#3060ac', tilt: -9
  },
  tube: {
    outline: 'M31 14h23v65a11.5 12 0 0 1-23 0z',
    reflection: 'M34 19v60q0 6 3 8', marks: 'M53 36h-6m6 10h-4m4 10h-6',
    lip: 13, level: 59, light: '#ffcf86', dark: '#bb6535', tilt: 16
  }
};

function Glassware({ kind, width, height }) {
  const { outline, reflection, marks, lip, level, light, dark, tilt } = glassware[kind];
  const id = 'resource-glass-' + kind;
  return <svg aria-hidden="true" width={width} height={height} viewBox="0 0 86 100" fill="none" className="floating-flask-svg">
    <defs>
      <clipPath id={id}><path d={outline} /></clipPath>
      <linearGradient id={id + '-wall'}>
        <stop stopColor="#c4edff" stopOpacity=".52" /><stop offset=".15" stopColor="#dcf4ff" stopOpacity=".19" />
        <stop offset=".46" stopColor="#7798df" stopOpacity=".07" /><stop offset=".8" stopColor="#7c9bbf" stopOpacity=".22" />
        <stop offset="1" stopColor="#e5f9ff" stopOpacity=".64" />
      </linearGradient>
      <linearGradient id={id + '-liquid'} x2=".55" y2="1">
        <stop stopColor={light} /><stop offset=".55" stopColor={dark} /><stop offset="1" stopColor={dark} stopOpacity=".64" />
      </linearGradient>
    </defs>
    <g transform={`rotate(${tilt} 43 52)`}>
      <path d={outline} fill={`url(#${id}-wall)`} />
      <g clipPath={`url(#${id})`}>
        <g transform={`rotate(${-tilt} 43 ${level})`}>
          <rect y={level} width="86" height="100" fill={`url(#${id}-liquid)`} />
          <ellipse cx="43" cy={level} rx={kind === 'volumetric' ? 5 : 32} ry="1.8" fill={light} />
        </g>
      </g>
      <path d={outline} stroke="#bfe0f0" strokeWidth="1.25" />
      <ellipse cx="42.5" cy="14" rx={lip} ry="2.6" fill="#263044" stroke="#d1e9f5" strokeWidth="1.4" />
      <path d={reflection} stroke="white" opacity=".76" strokeWidth="1.7" strokeLinecap="round" />
      {marks && <path d={marks} stroke={kind === 'volumetric' ? '#ffb978' : '#e9fcff'} strokeWidth="1.3" />}
    </g>
  </svg>;
}

// Skeletal structures: unlabeled vertices and line ends represent carbon.
const structures = [
  { id: 'benzene', bonds: 'M42 10l21 12v24L42 58 21 46V22z M42 15l16 9 M58 43l-16 9 M26 43V25', atoms: [] },
  { id: 'acetone', bonds: 'M16 48l27-16 27 16 M40 32V15 M46 32V15', atoms: [[43, 12, 'O']] },
  { id: 'glycine', bonds: 'M22 36l16 10 21-13 M57 32V16 M62 32V16 M60 33l12 7',
    atoms: [[13, 35, 'H₂N'], [60, 13, 'O'], [82, 47, 'OH']] },
  { id: 'ethylAcetate', bonds: 'M7 47l20-12 M25 35V18 M30 35V18 M28 35l13 7 M55 42l16-9 20 12',
    atoms: [[28, 14, 'O'], [48, 49, 'O']] },
];

function MolecularStructures() {
  return structures.map(({ id, bonds, atoms }) => (
    <figure key={id} aria-hidden="true" className={`molecule molecule--${id}`}>
      <svg viewBox="0 0 98 66" fill="none">
        <path d={bonds} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
        {atoms.map(([x, y, label]) => <text key={label + x} x={x} y={y} textAnchor="middle">{label}</text>)}
      </svg>
    </figure>
  ));
}

// Estrellas fijas y micro-estrellas cósmicas
const STARS = [
  // Estrellas principales existentes
  { top: '8%', left: '12%', size: 2.2, color: '#ffffff', duration: '3.2s', delay: '0.2s' },
  { top: '15%', left: '85%', size: 2.4, color: '#6FEDEE', duration: '4.5s', delay: '1.1s' },
  { top: '22%', left: '28%', size: 1.8, color: '#ffffff', duration: '2.8s', delay: '0.5s' },
  { top: '28%', left: '72%', size: 2.5, color: '#6FEDEE', duration: '5s', delay: '2s' },
  { top: '35%', left: '6%', size: 1.8, color: '#ffffff', duration: '3s', delay: '0.8s' },
  { top: '42%', left: '92%', size: 2.2, color: '#412BFD', duration: '4s', delay: '1.5s' },
  { top: '55%', left: '18%', size: 2.4, color: '#6FEDEE', duration: '3.6s', delay: '0.3s' },
  { top: '62%', left: '80%', size: 1.8, color: '#ffffff', duration: '4.2s', delay: '2.2s' },
  { top: '70%', left: '35%', size: 2.5, color: '#ffffff', duration: '3.8s', delay: '1.7s' },
  { top: '78%', left: '88%', size: 1.8, color: '#6FEDEE', duration: '4.8s', delay: '0.9s' },
  { top: '84%', left: '10%', size: 2.2, color: '#412BFD', duration: '3.4s', delay: '2.5s' },
  { top: '12%', left: '50%', size: 1.8, color: '#ffffff', duration: '4s', delay: '0.4s' },
  { top: '88%', left: '60%', size: 2.2, color: '#6FEDEE', duration: '3.1s', delay: '1.3s' },
  { top: '18%', left: '68%', size: 1.8, color: '#ffffff', duration: '4.6s', delay: '0.7s' },
  { top: '48%', left: '4%', size: 2.2, color: '#6FEDEE', duration: '3.9s', delay: '1.9s' },
  { top: '65%', left: '95%', size: 1.8, color: '#ffffff', duration: '4.4s', delay: '0.1s' },
  { top: '75%', left: '22%', size: 2.2, color: '#6FEDEE', duration: '3.3s', delay: '2.4s' },
  { top: '32%', left: '88%', size: 1.8, color: '#ffffff', duration: '5.2s', delay: '1.2s' },
  { top: '5%', left: '38%', size: 1.8, color: '#412BFD', duration: '3.7s', delay: '0.6s' },
  { top: '92%', left: '42%', size: 2.4, color: '#ffffff', duration: '4.1s', delay: '1.8s' },
  { top: '25%', left: '3%', size: 1.8, color: '#6FEDEE', duration: '3.5s', delay: '2.1s' },
  { top: '58%', left: '84%', size: 2.2, color: '#ffffff', duration: '4.3s', delay: '0.8s' },
  { top: '14%', left: '96%', size: 1.8, color: '#6FEDEE', duration: '3.8s', delay: '1.6s' },
  { top: '82%', left: '74%', size: 1.8, color: '#ffffff', duration: '4.7s', delay: '2.3s' },

  // Estrellas muy pequeñas añadidas (polvo estelar cósmico sutil)
  { top: '4%', left: '19%', size: 1.2, color: '#ffffff', duration: '3.1s', delay: '0.5s' },
  { top: '6%', left: '62%', size: 1, color: '#93c5fd', duration: '4.2s', delay: '1.2s' },
  { top: '9%', left: '80%', size: 1.4, color: '#ffffff', duration: '3.7s', delay: '2.0s' },
  { top: '11%', left: '33%', size: 1, color: '#6FEDEE', duration: '4.8s', delay: '0.3s' },
  { top: '13%', left: '2%', size: 1.2, color: '#ffffff', duration: '3.3s', delay: '1.7s' },
  { top: '16%', left: '44%', size: 1, color: '#6FEDEE', duration: '5.1s', delay: '0.8s' },
  { top: '19%', left: '76%', size: 1.3, color: '#ffffff', duration: '2.9s', delay: '2.4s' },
  { top: '20%', left: '90%', size: 1, color: '#412BFD', duration: '4.0s', delay: '0.9s' },
  { top: '23%', left: '15%', size: 1.2, color: '#ffffff', duration: '3.5s', delay: '1.4s' },
  { top: '24%', left: '58%', size: 1, color: '#ffffff', duration: '4.6s', delay: '2.1s' },
  { top: '27%', left: '38%', size: 1.4, color: '#93c5fd', duration: '3.8s', delay: '0.6s' },
  { top: '30%', left: '83%', size: 1, color: '#6FEDEE', duration: '4.3s', delay: '1.8s' },
  { top: '31%', left: '20%', size: 1.2, color: '#ffffff', duration: '3.6s', delay: '0.2s' },
  { top: '33%', left: '48%', size: 1, color: '#6FEDEE', duration: '5.3s', delay: '2.6s' },
  { top: '36%', left: '65%', size: 1.3, color: '#ffffff', duration: '3.4s', delay: '1.0s' },
  { top: '38%', left: '25%', size: 1, color: '#412BFD', duration: '4.1s', delay: '1.5s' },
  { top: '40%', left: '78%', size: 1.2, color: '#ffffff', duration: '3.9s', delay: '0.7s' },
  { top: '43%', left: '12%', size: 1, color: '#ffffff', duration: '4.7s', delay: '2.2s' },
  { top: '45%', left: '86%', size: 1.4, color: '#93c5fd', duration: '3.2s', delay: '0.4s' },
  { top: '47%', left: '34%', size: 1, color: '#6FEDEE', duration: '4.9s', delay: '1.9s' },
  { top: '50%', left: '70%', size: 1.2, color: '#ffffff', duration: '3.3s', delay: '1.3s' },
  { top: '52%', left: '9%', size: 1, color: '#6FEDEE', duration: '4.4s', delay: '0.8s' },
  { top: '54%', left: '96%', size: 1.3, color: '#ffffff', duration: '3.8s', delay: '2.3s' },
  { top: '57%', left: '40%', size: 1, color: '#412BFD', duration: '4.2s', delay: '0.1s' },
  { top: '60%', left: '60%', size: 1.2, color: '#ffffff', duration: '3.5s', delay: '1.6s' },
  { top: '63%', left: '26%', size: 1, color: '#ffffff', duration: '5.0s', delay: '2.5s' },
  { top: '66%', left: '72%', size: 1.4, color: '#93c5fd', duration: '3.7s', delay: '0.9s' },
  { top: '68%', left: '14%', size: 1, color: '#6FEDEE', duration: '4.5s', delay: '1.1s' },
  { top: '71%', left: '86%', size: 1.2, color: '#ffffff', duration: '3.1s', delay: '2.0s' },
  { top: '73%', left: '48%', size: 1, color: '#6FEDEE', duration: '4.8s', delay: '0.6s' },
  { top: '76%', left: '64%', size: 1.3, color: '#ffffff', duration: '3.6s', delay: '1.8s' },
  { top: '79%', left: '3%', size: 1, color: '#412BFD', duration: '4.0s', delay: '0.4s' },
  { top: '81%', left: '46%', size: 1.2, color: '#ffffff', duration: '3.9s', delay: '2.2s' },
  { top: '83%', left: '92%', size: 1, color: '#ffffff', duration: '4.6s', delay: '1.5s' },
  { top: '85%', left: '32%', size: 1.4, color: '#93c5fd', duration: '3.4s', delay: '0.7s' },
  { top: '87%', left: '78%', size: 1, color: '#6FEDEE', duration: '5.2s', delay: '2.7s' },
  { top: '89%', left: '16%', size: 1.2, color: '#ffffff', duration: '3.2s', delay: '1.2s' },
  { top: '91%', left: '70%', size: 1, color: '#6FEDEE', duration: '4.1s', delay: '0.3s' },
  { top: '94%', left: '24%', size: 1.3, color: '#ffffff', duration: '3.7s', delay: '1.9s' },
  { top: '95%', left: '84%', size: 1, color: '#412BFD', duration: '4.5s', delay: '0.9s' },
  { top: '96%', left: '52%', size: 1.2, color: '#ffffff', duration: '3.5s', delay: '2.4s' },
  { top: '97%', left: '7%', size: 1, color: '#ffffff', duration: '4.3s', delay: '1.1s' },
];

export default function ResourcesPage() {
  const t = useTranslations('resources');
  const lang = useLocale();
  const [filter, setFilter] = useState('todas');
  const scrollToHerramientas = (e) => {
    e?.preventDefault?.();
    const el = document.getElementById('herramientas');
    if (el) {
      el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  };

  return <>
    <Navbar />
    <main className={styles.page}>
      <section className="cosmic-hero">
        {/* Nebulosas del espacio profundo */}
        <div className="cosmic-nebula cosmic-nebula--cyan" />
        <div className="cosmic-nebula cosmic-nebula--purple" />
        <div className="cosmic-nebula cosmic-nebula--amber" />

        {/* Campo estelar de fondo */}
        {STARS.map((star, idx) => (
          <span
            key={idx}
            className="cosmic-star"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              boxShadow: star.size > 1.8 ? `0 0 5px ${star.color}` : `0 0 2px ${star.color}`,
              '--duration': star.duration,
              '--delay': star.delay,
            }}
          />
        ))}

        {/* ---------- MATRACES VOLANDO ---------- */}
        {/* Matraz Erlenmeyer superior izquierdo (visible en desktop y móvil) */}
        <div className="floating-item float-anim-1" style={{ top: '11%', left: '5%', opacity: 0.9 }}>
          <Glassware kind="erlenmeyer" width={112} height={112} />
        </div>

        {/* Matraz Aforado superior derecho (visible en desktop y móvil) */}
        <div className="floating-item float-anim-2" style={{ top: '13%', right: '6%', opacity: 0.9 }}>
          <Glassware kind="volumetric" width={115} height={115} />
        </div>

        {/* Matraz Balón de Destilación inferior izquierdo (solo desktop/tablet) */}
        <div className="floating-item float-anim-3 hide-mobile" style={{ top: '66%', left: '5%', opacity: 0.85 }}>
          <Glassware kind="boiling" width={104} height={104} />
        </div>

        {/* Tubo de Ensayo inferior derecho (solo desktop/tablet) */}
        <div className="floating-item float-anim-4 hide-mobile" style={{ top: '68%', right: '6%', opacity: 0.9 }}>
          <Glassware kind="tube" width={98} height={98} />
        </div>

        <MolecularStructures />
        <div aria-hidden="true" className="floating-item float-anim-2 equation equation--gas">
          <i>PV</i> = <i>nRT</i>
        </div>
        <div aria-hidden="true" className="floating-item float-anim-4 equation equation--ph">
          pH = −log₁₀(<i>a</i><sub>H⁺</sub>)
        </div>
        <div aria-hidden="true" className="floating-item float-anim-3 equation equation--energy hide-mobile">
          Δ<i>G</i> = Δ<i>H</i> − <i>T</i>Δ<i>S</i>
        </div>
        <div aria-hidden="true" className="floating-item float-anim-6 equation equation--photon hide-mobile">
          <i>E</i> = <i>hν</i>
        </div>

        {/* ---------- CONTENIDO CENTRAL: GRANDAZO RECURSOS + INFO ---------- */}
        <div className="cosmic-hero__content">
          <div>
            <span className="cosmic-badge">
              {t('badge') || '✦ ACS UNMSM • RECURSOS CIENTÍFICOS ✦'}
            </span>
          </div>

          <h1 className="cosmic-title-giant">
            {t('title')}
          </h1>

          <p className="cosmic-intro-text">
            {t('intro')}
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <button
              onClick={scrollToHerramientas}
              className="btn-cosmic-scroll"
            >
              <span>{t('exploreTools') || 'Explorar Herramientas'}</span>
              <FiArrowDown aria-hidden="true" size={18} />
            </button>
          </div>
        </div>
      </section>
      <section id="herramientas" className={styles.catalog} aria-label={t('title')}>
        <div className={styles.wrap}>
          <div className={styles.filters} role="group" aria-label={t('title')}>
            {['todas', ...Object.keys(categories)].map(key => {
              const Icon = categories[key] || FiGrid;
              const count = key === 'todas' ? RECURSOS.length : RECURSOS.filter(r => r.categoria === key).length;
              return <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}>
                <Icon aria-hidden="true" />{key === 'todas' ? t('all') : t('categorias.' + key)} <small>{count}</small>
              </button>;
            })}
          </div>
          {Object.entries(categories).filter(([key]) => filter === 'todas' || filter === key).map(([key, Icon]) =>
            <section className={styles.group} key={key}>
              <h2><Icon aria-hidden="true" />{t('categorias.' + key)}</h2>
              <div>{RECURSOS.filter(r => r.categoria === key).map(resource => {
                const title = t('fichas.' + resource.id + '.titulo');
                return <article className={styles.resource} key={resource.id}>
                  <div>
                    {resource.isFeatured && <small className={styles.original}>{t('originalProject')} · ACS UNMSM</small>}
                    <h3>{title}</h3>
                    <p>{t('fichas.' + resource.id + '.texto')}</p>
                  </div>
                  {resource.url ? <Link className={styles.open}
                    href={resource.isInternal ? '/' + lang + resource.url : resource.url}
                    target={resource.isInternal ? undefined : '_blank'} rel={resource.isInternal ? undefined : 'noopener noreferrer'}
                    aria-label={t('visitar') + ' · ' + title}>
                    {t('visitar')}{resource.isInternal ? <FiArrowRight /> : <FiArrowUpRight />}
                  </Link> : <span>{t('comingSoon')}</span>}
                </article>;
              })}</div>
            </section>
          )}
        </div>
      </section>
    </main>
    <Footer />
  </>;
}

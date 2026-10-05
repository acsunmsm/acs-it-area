'use client';

import Link from 'next/link';
import { useState } from 'react';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import Reveal, { RevealLetters } from '@/src/components/Reveal';
import { useTranslations, useLocale } from 'next-intl';
import {
  FaDatabase,
  FaTools,
  FaBookOpen,
  FaGraduationCap,
  FaExternalLinkAlt,
  FaFlask,
  FaAtom,
  FaShieldAlt,
  FaCalendarAlt,
  FaDrawPolygon,
  FaLandmark,
  FaUsers,
  FaArrowRight,
  FaThLarge
} from 'react-icons/fa';

const RECURSOS = [
  { id: 'pubchem', categoria: 'bases', url: 'https://pubchem.ncbi.nlm.nih.gov/' },
  { id: 'nist', categoria: 'bases', url: 'https://webbook.nist.gov/chemistry/' },
  { id: 'sds', categoria: 'bases', url: 'https://pubchem.ncbi.nlm.nih.gov/#query=safety%20data%20sheet' },
  { id: 'chemtools', categoria: 'herramientas', url: '/chemtools', isInternal: true, isFeatured: true },
  { id: 'chemdraw', categoria: 'herramientas', url: 'https://molview.org/' },
  { id: 'horario', categoria: 'herramientas', url: '/horario', isInternal: true, isFeatured: true },
  { id: 'acsPubs', categoria: 'revistas', url: 'https://pubs.acs.org/' },
  { id: 'rsc', categoria: 'revistas', url: 'https://www.rsc.org/' },
  { id: 'becas', categoria: 'formacion', url: 'https://www.acs.org/education/students/college.html' },
];

const ORDEN_CATEGORIAS = ['bases', 'herramientas', 'revistas', 'formacion'];

const CATEGORIAS_CONFIG = {
  bases: {
    icon: FaDatabase,
    color: '#0284c7',
    badgeBg: '#e0f2fe',
    badgeText: '#0369a1',
  },
  herramientas: {
    icon: FaTools,
    color: '#412BFD',
    badgeBg: '#eef2ff',
    badgeText: '#3730a3',
  },
  revistas: {
    icon: FaBookOpen,
    color: '#059669',
    badgeBg: '#ecfdf5',
    badgeText: '#047857',
  },
  formacion: {
    icon: FaGraduationCap,
    color: '#d97706',
    badgeBg: '#fef3c7',
    badgeText: '#92400e',
  },
};

// Componentes SVG de Material de Laboratorio con Resplandor Cósmico
function ErlenmeyerFlask({ width = 74, height = 74 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="floating-flask-svg">
      <defs>
        <linearGradient id="flaskCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6FEDEE" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.75" />
        </linearGradient>
      </defs>
      <rect x="25" y="8" width="14" height="4" rx="2" stroke="#6FEDEE" strokeWidth="2.5" fill="rgba(111,237,238,0.25)" />
      <path d="M28 12V24L12 49C10 52.5 12.5 57 16.5 57H47.5C51.5 57 54 52.5 52 49L36 24V12" stroke="#6FEDEE" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M17 48L22 42C24 39 28 39 30 42C32 45 36 45 38 42L47 48C49 51 47 55 44 55H20C17 55 15 51 17 48Z" fill="url(#flaskCyanGrad)" />
      <circle cx="26" cy="47" r="1.8" fill="#ffffff" />
      <circle cx="35" cy="44" r="1.4" fill="#ffffff" opacity="0.9" />
      <circle cx="31" cy="34" r="1.2" fill="#6FEDEE" opacity="0.8" />
      <line x1="33" y1="44" x2="38" y2="44" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <line x1="31" y1="38" x2="35" y2="38" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
    </svg>
  );
}

function VolumetricFlask({ width = 64, height = 64 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="floating-flask-svg">
      <defs>
        <linearGradient id="flaskPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#412BFD" stopOpacity="0.82" />
        </linearGradient>
      </defs>
      <polygon points="30,4 34,4 36,9 28,9" stroke="#818cf8" strokeWidth="2" fill="rgba(129,140,248,0.4)" />
      <path d="M30 9V32C24 35 20 42 20 48C20 55 25 59 32 59C39 59 44 55 44 48C44 42 40 35 34 32V9" stroke="#818cf8" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="28" y1="20" x2="36" y2="20" stroke="#ffd400" strokeWidth="2" />
      <path d="M22 47C22 54 26.5 57 32 57C37.5 57 42 54 42 47C42 43 38 38 32 38C26 38 22 43 22 47Z" fill="url(#flaskPurpleGrad)" />
      <circle cx="31" cy="46" r="1.8" fill="#ffffff" />
      <circle cx="33" cy="40" r="1.3" fill="#ffffff" opacity="0.8" />
    </svg>
  );
}

function BoilingFlask({ width = 70, height = 70 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="floating-flask-svg">
      <defs>
        <linearGradient id="flaskBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <rect x="28" y="6" width="8" height="3" rx="1.5" stroke="#38bdf8" strokeWidth="2" fill="rgba(56,189,248,0.3)" />
      <path d="M29 9V24C22 27 18 34 18 42C18 51 24.5 58 32 58C39.5 58 46 51 46 42C46 34 42 27 35 24V9" stroke="#38bdf8" strokeWidth="2.5" />
      <path d="M35 15L45 21" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="44" r="11" fill="url(#flaskBlueGrad)" />
      <circle cx="29" cy="41" r="2" fill="#ffffff" opacity="0.9" />
      <circle cx="36" cy="46" r="1.5" fill="#ffffff" opacity="0.75" />
    </svg>
  );
}

function TestTube({ width = 48, height = 48 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="floating-flask-svg">
      <defs>
        <linearGradient id="tubeMintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6FEDEE" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <line x1="24" y1="10" x2="40" y2="10" stroke="#6FEDEE" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M27 10V46C27 51 29 55 32 55C35 55 37 51 37 46V10" stroke="#6FEDEE" strokeWidth="2.5" />
      <path d="M28 34V46C28 49.5 29.5 53 32 53C34.5 53 36 49.5 36 46V34C34 35.5 30 32.5 28 34Z" fill="url(#tubeMintGrad)" />
      <circle cx="32" cy="43" r="1.5" fill="#ffffff" />
      <circle cx="30" cy="37" r="1.2" fill="#ffffff" opacity="0.8" />
    </svg>
  );
}

function BenzeneRing({ width = 56, height = 56 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="floating-benzene-svg">
      <polygon points="32,8 52,19.5 52,42.5 32,54 12,42.5 12,19.5" stroke="#6FEDEE" strokeWidth="2.5" strokeLinejoin="round" fill="rgba(111,237,238,0.08)" />
      <circle cx="32" cy="31" r="13" stroke="#818cf8" strokeWidth="2" strokeDasharray="5 3" opacity="0.9" />
    </svg>
  );
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
  const [filtro, setFiltro] = useState('todas');

  const scrollToHerramientas = (e) => {
    e?.preventDefault?.();
    const el = document.getElementById('herramientas');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="tema-biblioteca" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />

      {/* ---------- Hero Cósmico Espacial (Fondo del espacio, matraces y fórmulas volando) ---------- */}
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
          <ErlenmeyerFlask width={74} height={74} />
        </div>

        {/* Matraz Aforado superior derecho (visible en desktop y móvil) */}
        <div className="floating-item float-anim-2" style={{ top: '13%', right: '6%', opacity: 0.9 }}>
          <VolumetricFlask width={66} height={66} />
        </div>

        {/* Matraz Balón de Destilación inferior izquierdo (solo desktop/tablet) */}
        <div className="floating-item float-anim-3 hide-mobile" style={{ top: '66%', left: '5%', opacity: 0.85 }}>
          <BoilingFlask width={70} height={70} />
        </div>

        {/* Tubo de Ensayo inferior derecho (solo desktop/tablet) */}
        <div className="floating-item float-anim-4 hide-mobile" style={{ top: '68%', right: '6%', opacity: 0.9 }}>
          <TestTube width={54} height={54} />
        </div>

        {/* Anillo de Benceno resonante flotando lateral derecho */}
        <div className="floating-item float-anim-5 hide-mobile" style={{ top: '38%', right: '3%', opacity: 0.75 }}>
          <BenzeneRing width={62} height={62} />
        </div>

        {/* Anillo de Benceno lateral izquierdo */}
        <div className="floating-item float-anim-6 hide-mobile" style={{ top: '44%', left: '3%', opacity: 0.7 }}>
          <BenzeneRing width={52} height={52} />
        </div>

        {/* ---------- FÓRMULAS QUÍMICAS VOLANDO ---------- */}
        {/* PV = nRT (esquina inferior izquierda) */}
        <div className="floating-item float-anim-2" style={{ bottom: '10%', left: '7%' }}>
          <span className="floating-formula formula--cyan" style={{ fontSize: '1.35rem' }}>PV = nRT</span>
        </div>

        {/* pH = -log[H+] (esquina inferior derecha) */}
        <div className="floating-item float-anim-4" style={{ bottom: '10%', right: '7%' }}>
          <span className="floating-formula formula--cyan" style={{ fontSize: '1.25rem' }}>pH = -log[H<sup>+</sup>]</span>
        </div>

        {/* ΔG = ΔH - TΔS */}
        <div className="floating-item float-anim-3 hide-mobile" style={{ top: '22%', right: '15%' }}>
          <span className="floating-formula formula--violet" style={{ fontSize: '1.28rem' }}>ΔG = ΔH - TΔS</span>
        </div>

        {/* k = A e^(-Ea/RT) */}
        <div className="floating-item float-anim-1 hide-mobile" style={{ top: '78%', left: '16%' }}>
          <span className="floating-formula formula--gold" style={{ fontSize: '1.2rem' }}>k = A e<sup>-Ea/RT</sup></span>
        </div>

        {/* Keq */}
        <div className="floating-item float-anim-5 hide-mobile" style={{ top: '30%', left: '11%' }}>
          <span className="floating-formula formula--white" style={{ fontSize: '1.15rem' }}>K<sub>eq</sub> = [Prod] / [React]</span>
        </div>

        {/* E = hν (desplazado para no tapar el título) */}
        <div className="floating-item float-anim-6 hide-mobile" style={{ top: '11%', right: '28%' }}>
          <span className="floating-formula formula--gold" style={{ fontSize: '1.25rem' }}>E = hν</span>
        </div>

        {/* H2O */}
        <div className="floating-item float-anim-2 hide-mobile" style={{ top: '56%', left: '2%', opacity: 0.65 }}>
          <span className="floating-formula formula--cyan" style={{ fontSize: '1.15rem' }}>H<sub>2</sub>O</span>
        </div>

        {/* C6H12O6 */}
        <div className="floating-item float-anim-3 hide-mobile" style={{ top: '57%', right: '2%', opacity: 0.65 }}>
          <span className="floating-formula formula--violet" style={{ fontSize: '1.15rem' }}>C<sub>6</sub>H<sub>12</sub>O<sub>6</sub></span>
        </div>

        {/* ΔS_univ > 0 */}
        <div className="floating-item float-anim-4 hide-mobile" style={{ top: '84%', left: '30%' }}>
          <span className="floating-formula formula--white" style={{ fontSize: '1.12rem' }}>ΔS<sub>univ</sub> &gt; 0</span>
        </div>

        {/* CH3CH2OH */}
        <div className="floating-item float-anim-1 hide-mobile" style={{ top: '85%', right: '30%' }}>
          <span className="floating-formula formula--gold" style={{ fontSize: '1.12rem' }}>CH<sub>3</sub>CH<sub>2</sub>OH</span>
        </div>

        {/* ---------- CONTENIDO CENTRAL: GRANDAZO RECURSOS + INFO ---------- */}
        <div className="cosmic-hero__content">
          <div>
            <span className="cosmic-badge">
              ✦ ACS UNMSM • RECURSOS CIENTÍFICOS ✦
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
              <span>Explorar Herramientas</span>
              <FaArrowRight size={13} style={{ transform: 'rotate(90deg)' }} />
            </button>
          </div>
        </div>
      </section>



      {/* ---------- Barra de Filtros y Aviso (Modo Claro Premium) ---------- */}
      <section id="herramientas" className="py-4 cosmic-light-bottom" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #f1f5f9', scrollMarginTop: '76px' }}>
        <div className="container">
          <div className="d-flex justify-content-center flex-wrap gap-3">
            <button
              onClick={() => setFiltro('todas')}
              className={`cosmic-light-filter-btn ${filtro === 'todas' ? 'active' : ''}`}
            >
              <FaThLarge size={14} />
              <span>Todos</span>
              <span className="cosmic-light-filter-count">{RECURSOS.length}</span>
            </button>

            {ORDEN_CATEGORIAS.map((cat) => {
              const count = RECURSOS.filter((r) => r.categoria === cat).length;
              const IconComp = CATEGORIAS_CONFIG[cat].icon;
              return (
                <button
                  key={cat}
                  onClick={() => setFiltro(cat)}
                  className={`cosmic-light-filter-btn ${filtro === cat ? 'active' : ''}`}
                >
                  <IconComp size={14} />
                  <span>{t(`categorias.${cat}`)}</span>
                  <span className="cosmic-light-filter-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Cuadrícula Clara ---------- */}
      <section className="py-5 cosmic-light-bottom" style={{ background: '#ffffff', minHeight: '50vh' }}>
        <div className="container">
          {ORDEN_CATEGORIAS.map((categoria) => {
            if (filtro !== 'todas' && filtro !== categoria) return null;
            const delCategoria = RECURSOS.filter((r) => r.categoria === categoria);
            if (delCategoria.length === 0) return null;
            const config = CATEGORIAS_CONFIG[categoria];
            const CatIcon = config.icon;

            return (
              <div key={categoria} className="mb-5">
                <div className="d-flex align-items-center gap-3 mb-4 pb-2">
                  <div className="cosmic-light-category-icon" style={{ background: config.badgeBg, color: config.color }}>
                    <CatIcon size={20} />
                  </div>
                  <h2 className="h4 fw-bold mb-0" style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>
                    {t(`categorias.${categoria}`)}
                  </h2>
                </div>

                <div className="row g-4">
                  {delCategoria.map((recurso, idx) => {
                    const isOfficial = recurso.isFeatured;

                    return (
                      <Reveal key={recurso.id} delay={idx % 3} className="col-md-6 col-lg-4">
                        <article className={`cosmic-light-card ${isOfficial ? 'cosmic-light-card-official' : ''}`}>

                          <div className="cosmic-light-card-header">
                            {isOfficial && (
                              <div className="acs-exclusive-label">
                                <span className="acs-dot"></span> Proyecto Original
                              </div>
                            )}
                          </div>

                          <div className="cosmic-light-card-body">
                            <h3 className="cosmic-light-card-title">{t(`fichas.${recurso.id}.titulo`)}</h3>
                            <p className="cosmic-light-card-text">{t(`fichas.${recurso.id}.texto`)}</p>
                          </div>

                          <div className="cosmic-light-card-footer">
                            {recurso.url ? (
                              recurso.isInternal || recurso.url.startsWith('/') ? (
                                <Link className="cosmic-light-card-link" href={`/${lang}${recurso.url}`}>
                                  Abrir recurso <FaArrowRight size={11} className="ms-2" />
                                </Link>
                              ) : (
                                <a className="cosmic-light-card-link" href={recurso.url} target="_blank" rel="noopener noreferrer">
                                  Abrir recurso <FaExternalLinkAlt size={10} className="ms-2" />
                                </a>
                              )
                            ) : (
                              <span className="cosmic-light-card-soon">Próximamente</span>
                            )}


                          </div>

                        </article>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}

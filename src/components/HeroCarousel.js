'use client';

import { useTranslations } from 'next-intl';
import '@/src/assets/styles/hero.css';

export default function HeroCarousel() {
  const t = useTranslations('homePage');
  
  const handleScroll = (e) => {
    e.preventDefault();
    const section = document.querySelector('.hero-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-container">
      {/* Lado Izquierdo (3 figuras) */}
      <img src="/assets/img/000643421W.jpg" alt="Students" className="floating-element shape-left-1" />
      <img src="/assets/img/Fondo2.jpeg" alt="Campus" className="floating-element shape-left-2" />
      <div className="floating-element shape-left-3-color"></div>

      {/* Lado Derecho (3 figuras) */}
      <div className="floating-element shape-right-1-color"></div>
      <img src="/assets/img/about.jpg" alt="UNMSM" className="floating-element shape-right-2" />
      <img src="https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=500" alt="Industry" className="floating-element shape-right-3" />

      {/* Contenido Central */}
      <div className="content-wrapper">
        <h1 className="title">
          {t('portadaTitulo')} <span className="highlight">{t('portadaDestacado')}</span>
        </h1>
        <p className="subtitle">
          {t('portadaTexto')}
        </p>
        <button onClick={handleScroll} className="cta-button">
          {t('portadaCta')}
        </button>
      </div>
    </section>
  );
}

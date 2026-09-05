'use client';

import { useTranslations } from 'next-intl';
import '@/src/assets/styles/hero.css';
import { motion } from 'framer-motion';

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
      <motion.img 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        src="/assets/img/000643421W.jpg" alt="Students" className="floating-element shape-left-1" />
      <motion.img 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        src="/assets/img/Fondo2.jpeg" alt="Campus" className="floating-element shape-left-2" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="floating-element shape-left-3-color"></motion.div>

      {/* Lado Derecho (3 figuras) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="floating-element shape-right-1-color"></motion.div>
      <motion.img 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        src="/assets/img/about.jpg" alt="UNMSM" className="floating-element shape-right-2" />
      <motion.img 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        src="https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=500" alt="Industry" className="floating-element shape-right-3" />

      {/* Contenido Central */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="content-wrapper">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="title">
          {t('portadaTitulo')} <span className="highlight">{t('portadaDestacado')}</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="subtitle">
          {t('portadaTexto')}
        </motion.p>
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          onClick={handleScroll} className="cta-button">
          {t('portadaCta')}
        </motion.button>
      </motion.div>
    </section>
  );
}

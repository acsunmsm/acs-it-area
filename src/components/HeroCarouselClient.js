'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import '@/src/assets/styles/hero.css';

export default function HeroCarouselClient({ photos }) {
  const t = useTranslations('homePage');
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches || photos.length < 2) return;

    const timer = window.setInterval(() => {
      setActivePhoto(current => (current + 1) % photos.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [photos.length]);

  return (
    <section className="chapter-hero" aria-labelledby="chapter-hero-title">
      <div className="chapter-hero__layout">
        <div className="chapter-hero__copy">
          <h1 id="chapter-hero-title">
            {t('portadaTitulo')} <span>{t('portadaDestacado')}</span>
          </h1>
          <p>{t('portadaTexto')}</p>
          <a className="chapter-hero__action" href="#conocenos">
            {t('portadaCta')} <span aria-hidden="true">↓</span>
          </a>
        </div>

        {photos.length > 0 && (
          <div className="chapter-hero__photos">
            <div className="chapter-hero__gallery">
              {photos.map((src, index) => (
                <Image
                  key={src}
                  className="chapter-hero__group"
                  data-active={index === activePhoto}
                  src={src}
                  alt={index === activePhoto ? t('portadaGaleria', { numero: index + 1 }) : ''}
                  width={1600}
                  height={900}
                  sizes="(max-width: 800px) 90vw, 45vw"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  priority={index === 0}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

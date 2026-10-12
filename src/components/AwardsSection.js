'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export default function AwardsSection() {
  const t = useTranslations('awards');

  return (
    <section className="awards-section-wrapper">
      {/* Esquinas ornamentales estilo filigrana dorada en los bordes de la pantalla */}
      <div className="filigree-corner top-left" aria-hidden="true">
        <svg viewBox="0 0 100 100" className="filigree-svg">
          <path
            d="M 5 95 C 5 45, 45 5, 95 5 M 10 95 C 10 50, 50 10, 95 10 M 5 25 C 25 25, 25 5, 25 5 M 15 45 C 35 45, 45 35, 45 15 M 5 65 C 40 65, 65 40, 65 5 M 8 8 C 8 18, 18 18, 18 8 Z"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2B2" />
              <stop offset="50%" stopColor="#E5B338" />
              <stop offset="100%" stopColor="#B37D14" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="filigree-corner top-right" aria-hidden="true">
        <svg viewBox="0 0 100 100" className="filigree-svg">
          <path
            d="M 5 95 C 5 45, 45 5, 95 5 M 10 95 C 10 50, 50 10, 95 10 M 5 25 C 25 25, 25 5, 25 5 M 15 45 C 35 45, 45 35, 45 15 M 5 65 C 40 65, 65 40, 65 5 M 8 8 C 8 18, 18 18, 18 8 Z"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="filigree-corner bottom-left" aria-hidden="true">
        <svg viewBox="0 0 100 100" className="filigree-svg">
          <path
            d="M 5 95 C 5 45, 45 5, 95 5 M 10 95 C 10 50, 50 10, 95 10 M 5 25 C 25 25, 25 5, 25 5 M 15 45 C 35 45, 45 35, 45 15 M 5 65 C 40 65, 65 40, 65 5 M 8 8 C 8 18, 18 18, 18 8 Z"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="filigree-corner bottom-right" aria-hidden="true">
        <svg viewBox="0 0 100 100" className="filigree-svg">
          <path
            d="M 5 95 C 5 45, 45 5, 95 5 M 10 95 C 10 50, 50 10, 95 10 M 5 25 C 25 25, 25 5, 25 5 M 15 45 C 35 45, 45 35, 45 15 M 5 65 C 40 65, 65 40, 65 5 M 8 8 C 8 18, 18 18, 18 8 Z"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Marco ornamental perimetral doble dorado que recorre todo el ancho de la pantalla */}
      <div className="awards-frame-outer" aria-hidden="true"></div>
      <div className="awards-frame-inner" aria-hidden="true"></div>

      {/* Contenedor a pantalla completa para el contenido */}
      <div className="awards-inner-container">
        <div className="awards-content text-center">
          {/* Etiqueta superior */}
          <div className="awards-eyebrow">
            <span>{t('badge')}</span>
          </div>

          {/* Título y subtítulo con brillo dorado */}
          <h2 className="awards-title">
            {t('title')}
          </h2>

          <p className="awards-subtitle">
            {t('subtitle')}
          </p>

          {/* Divisor ornamental dorado */}
          <div className="awards-divider" aria-hidden="true">
            <span className="divider-line"></span>
            <span className="divider-diamond">✦</span>
            <span className="divider-line"></span>
          </div>

          {/* Texto explicativo institucional */}
          <p className="awards-description">
            {t('description')}
          </p>

          {/* Galería de las dos medallas */}
          <div className="awards-badges-grid">
            {/* Medalla 1: Outstanding Student Communities Award */}
            <div className="award-badge-card">
              <div className="badge-glow-halo gold-halo"></div>
              <div className="badge-image-container">
                <img
                  src="/assets/img/badge-outstanding.png"
                  alt="2025-2026 Outstanding Student Communities Award - ACS"
                  className="award-badge-img"
                  loading="lazy"
                />
              </div>
              <h4 className="badge-card-title">Outstanding</h4>
              <p className="badge-card-type">Student Communities Award</p>
            </div>

            {/* Medalla 2: Green Chemistry Student Communities Award */}
            <div className="award-badge-card">
              <div className="badge-glow-halo green-halo"></div>
              <div className="badge-image-container">
                <img
                  src="/assets/img/badge-greenchem.png"
                  alt="2025-2026 Green Chemistry Student Communities Award - ACS"
                  className="award-badge-img"
                  loading="lazy"
                />
              </div>
              <h4 className="badge-card-title">Green Chemistry</h4>
              <p className="badge-card-type">Student Communities Award</p>
            </div>
          </div>

          {/* Franja de Año Académico */}
          <div className="awards-academic-year">
            <span>| {t('academicYear')} |</span>
          </div>

          {/* Identidad institucional del Capítulo */}
          <div className="awards-branding">
            <div className="d-inline-flex align-items-center justify-content-center">
              <img
                src="/assets/img/whitelogo.svg"
                alt="ACS White Logo"
                className="awards-whitelogo-img"
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .awards-section-wrapper {
          position: relative;
          width: 100%;
          font-family: 'Stolzl', sans-serif;
          margin: 0;
          background-image: 
            linear-gradient(135deg, var(--color-primary) 0%, rgba(14, 30, 99, 0.86) 50%, rgba(20, 42, 133, 0.92) 100%),
            url('/assets/img/premiosFondo1.jpeg');
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          border-top: 2px solid rgba(229, 179, 56, 0.55);
          border-bottom: 2px solid rgba(229, 179, 56, 0.55);
          box-shadow: none;
          padding: 50px 0 45px;
          overflow: hidden;
        }

        /* Marco dorado perimetral que recorre los extremos de toda la pantalla */
        .awards-frame-outer {
          position: absolute;
          top: 10px;
          bottom: 10px;
          left: 10px;
          right: 10px;
          border: 1px solid rgba(229, 179, 56, 0.4);
          pointer-events: none;
          z-index: 2;
        }

        .awards-frame-inner {
          position: absolute;
          top: 15px;
          bottom: 15px;
          left: 15px;
          right: 15px;
          border: 1.5px solid rgba(229, 179, 56, 0.75);
          pointer-events: none;
          z-index: 2;
        }

        .awards-inner-container {
          position: relative;
          z-index: 3;
          width: 100%;
          max-width: 100%;
          padding: 0 clamp(16px, 3.5vw, 48px);
          margin: 0 auto;
        }

        /* Esquinas ornamentales filigrana ubicadas en los extremos de la pantalla */
        .filigree-corner {
          position: absolute;
          width: 75px;
          height: 75px;
          pointer-events: none;
          opacity: 0.9;
          z-index: 3;
        }

        .filigree-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
        }

        .filigree-corner.top-left {
          top: 10px;
          left: 10px;
        }

        .filigree-corner.top-right {
          top: 10px;
          right: 10px;
          transform: scaleX(-1);
        }

        .filigree-corner.bottom-left {
          bottom: 10px;
          left: 10px;
          transform: scaleY(-1);
        }

        .filigree-corner.bottom-right {
          bottom: 10px;
          right: 10px;
          transform: scale(-1);
        }

        .awards-content {
          position: relative;
          z-index: 3;
          width: 100%;
          max-width: 1300px;
          margin: 0 auto;
        }

        .awards-eyebrow {
          color: #E6C658;
          font-family: 'Stolzl', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-bottom: 8px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
        }

        .awards-title {
          font-family: 'Stolzl', sans-serif;
          font-size: clamp(1.9rem, 3.8vw, 2.9rem);
          font-weight: 800;
          letter-spacing: clamp(0.5px, 0.2vw, 1.5px);
          line-height: 1.15;
          margin: 0 0 6px 0;
          text-transform: uppercase;
          background: linear-gradient(135deg, #FFF6D1 0%, #F5C542 35%, #E29B12 70%, #FFE98A 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 4px 15px rgba(0, 0, 0, 0.5));
        }

        .awards-subtitle {
          font-family: 'Stolzl', sans-serif;
          font-style: italic;
          font-size: clamp(1.05rem, 1.6vw, 1.32rem);
          font-weight: 300;
          color: #F8D97D;
          margin: 0 0 12px 0;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        /* Divisor ornamental */
        .awards-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 0 auto 16px;
          max-width: 260px;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(245, 197, 66, 0.7), transparent);
        }

        .divider-diamond {
          color: #F5C542;
          font-size: 0.85rem;
          filter: drop-shadow(0 0 6px rgba(245, 197, 66, 0.8));
        }

        .awards-description {
          font-family: 'Stolzl', sans-serif;
          font-size: clamp(0.92rem, 1.1vw, 1.02rem);
          line-height: 1.65;
          color: rgba(240, 244, 255, 0.95);
          font-weight: 300;
          max-width: 860px;
          margin: 0 auto 26px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
        }

        /* Cuadrícula de medallas a pantalla completa */
        .awards-badges-grid {
          display: flex;
          align-items: stretch;
          justify-content: center;
          gap: clamp(24px, 4vw, 50px);
          margin-bottom: 26px;
          flex-wrap: wrap;
          width: 100%;
          max-width: 1150px;
          margin-left: auto;
          margin-right: auto;
        }

        .award-badge-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 26px 20px;
          border-radius: 20px;
          background: rgba(20, 15, 60, 0.65);
          background: color-mix(in srgb, var(--color-primary-dark, #2B1BAA) 35%, rgba(10, 15, 45, 0.65));
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(245, 197, 66, 0.25);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease;
          width: clamp(285px, 27vw, 350px);
          max-width: 100%;
        }

        .award-badge-card:hover {
          transform: translateY(-6px);
          border-color: rgba(245, 197, 66, 0.5);
          box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.6), 0 0 25px rgba(65, 43, 253, 0.25);
        }

        .badge-glow-halo {
          position: absolute;
          top: 25px;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(24px);
        }

        .gold-halo {
          background: radial-gradient(circle, rgba(245, 197, 66, 0.35) 0%, transparent 70%);
        }

        .green-halo {
          background: radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, transparent 70%);
        }

        .badge-image-container {
          position: relative;
          z-index: 1;
          width: 175px;
          height: 175px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }

        .award-badge-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.55));
          transition: transform 0.3s ease;
        }

        .award-badge-card:hover .award-badge-img {
          transform: scale(1.04);
        }

        .badge-card-title {
          font-family: 'Stolzl', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 3px 0;
          letter-spacing: 0.3px;
        }

        .badge-card-type {
          font-family: 'Stolzl', sans-serif;
          font-size: 0.85rem;
          color: rgba(226, 232, 240, 0.82);
          margin: 0;
        }

        .awards-academic-year {
          font-family: 'Stolzl', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: 3px;
          color: #E6C658;
          margin-bottom: 16px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        .awards-branding {
          padding-top: 20px;
          border-top: 1px solid rgba(245, 197, 66, 0.25);
          display: inline-block;
          margin-top: 4px;
        }

        .awards-whitelogo-img {
          width: 340px;
          height: auto;
          max-width: 90vw;
          object-fit: contain;
          filter: drop-shadow(0 6px 20px rgba(0, 0, 0, 0.45));
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease;
          display: block;
        }

        .awards-whitelogo-img:hover {
          transform: scale(1.05);
          filter: drop-shadow(0 8px 26px rgba(245, 197, 66, 0.4));
        }

        @media (max-width: 992px) {
          .awards-title {
            font-size: 2.3rem;
          }

          .awards-badges-grid {
            gap: 28px;
          }

          .filigree-corner {
            width: 65px;
            height: 65px;
          }

          .awards-whitelogo-img {
            width: 290px;
          }
        }

        @media (max-width: 768px) {
          .awards-section-wrapper {
            padding: 44px 0 40px;
          }

          .awards-frame-outer {
            top: 7px;
            bottom: 7px;
            left: 7px;
            right: 7px;
          }

          .awards-frame-inner {
            top: 11px;
            bottom: 11px;
            left: 11px;
            right: 11px;
          }

          .filigree-corner {
            width: 46px;
            height: 46px;
          }

          .filigree-corner.top-left {
            top: 7px;
            left: 7px;
          }

          .filigree-corner.top-right {
            top: 7px;
            right: 7px;
          }

          .filigree-corner.bottom-left {
            bottom: 7px;
            left: 7px;
          }

          .filigree-corner.bottom-right {
            bottom: 7px;
            right: 7px;
          }

          .awards-title {
            font-size: 1.8rem;
            letter-spacing: 0.6px;
          }

          .awards-subtitle {
            font-size: 1.1rem;
          }

          .awards-eyebrow {
            font-size: 0.78rem;
            letter-spacing: 2.5px;
          }

          .awards-description {
            font-size: 0.92rem;
            margin-bottom: 24px;
          }

          .awards-badges-grid {
            gap: 20px;
          }

          .award-badge-card {
            width: 100%;
            max-width: 310px;
            padding: 20px 18px 16px;
          }

          .badge-image-container {
            width: 145px;
            height: 145px;
            margin-bottom: 10px;
          }

          .badge-card-title {
            font-size: 1.12rem;
          }

          .awards-academic-year {
            font-size: 0.82rem;
            letter-spacing: 2px;
            margin-bottom: 14px;
          }

          .awards-whitelogo-img {
            width: 250px;
            max-width: 85vw;
          }
        }

        @media (max-width: 480px) {
          .awards-section-wrapper {
            padding: 36px 0 32px;
          }

          .filigree-corner {
            width: 34px;
            height: 34px;
            opacity: 0.65;
          }

          .awards-title {
            font-size: 1.5rem;
          }

          .awards-subtitle {
            font-size: 0.98rem;
          }

          .award-badge-card {
            max-width: 100%;
            padding: 18px 14px 14px;
          }

          .badge-image-container {
            width: 130px;
            height: 130px;
          }

          .awards-whitelogo-img {
            width: 210px;
            max-width: 80vw;
          }
        }
      `}</style>
    </section>
  );
}

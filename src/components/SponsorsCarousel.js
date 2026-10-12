// components/SponsorsCarousel.js
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export default function SponsorsCarousel() {
  const t = useTranslations('homePage');

  // Ajuste óptico individual para que los círculos y textos de cada logo coincidan en escala
  const sponsors = [
    { src: "/assets/img/UNInew.svg", alt: "ACS UNI", height: 42 },
    { src: "/assets/img/PERUnew.svg", alt: "ACS Peru", height: 40 },
    { src: "/assets/img/Logo10.svg", alt: "ACS Marca", height: 50 },
    { src: "/assets/img/PUCPnew.svg", alt: "ACS PUCP", height: 42 },
  ];

  // Duplicar para un desplazamiento continuo infinito
  const duplicatedSponsors = [...sponsors, ...sponsors, ...sponsors];

  return (
    <section className="sponsors-wrapper container">
      <div className="text-center mb-3">
        <span className="sponsors-title">{t('alliedChapters')}</span>
      </div>

      <div className="sponsors-carousel">
        <div className="marquee-content">
          {duplicatedSponsors.map((sponsor, index) => (
            <div key={index} className="sponsor-logo-box">
              <img
                src={sponsor.src}
                alt={sponsor.alt}
                style={{ height: `${sponsor.height}px` }}
                className="sponsor-logo-img"
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .sponsors-wrapper {
          margin-top: 75px;
          margin-bottom: 80px;
          padding-top: 15px;
          padding-bottom: 15px;
        }

        .sponsors-title {
          font-family: 'Stolzl', sans-serif;
          font-size: 1.3rem;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--color-primary);
          display: inline-block;
          margin-bottom: 20px;
        }

        .sponsors-carousel {
          height: 90px;
          margin: 0 auto;
          max-width: 100%;
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          background-color: #ffffff;
          display: flex;
          align-items: center;
          border: 1px solid rgba(226, 232, 240, 0.85);
          box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.04);
        }
        
        .sponsors-carousel::before,
        .sponsors-carousel::after {
          content: "";
          position: absolute;
          top: 0;
          width: 70px;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }
        
        .sponsors-carousel::before {
          left: 0;
          background: linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
        }
        
        .sponsors-carousel::after {
          right: 0;
          background: linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
        }

        .marquee-content {
          display: flex;
          align-items: center;
          gap: 75px;
          width: max-content;
          animation: scroll 45s linear infinite;
        }
        
        .marquee-content:hover {
          animation-play-state: paused;
        }

        .sponsor-logo-box {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sponsor-logo-img {
          width: auto;
          margin-left: 20px;
          margin-right: 20px;
          object-fit: contain;
          transition: all 0.3s ease;
          filter: grayscale(70%) opacity(70%);
        }

        .sponsor-logo-img:hover {
          transform: scale(1.06);
          filter: grayscale(0%) opacity(100%);
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 37.5px));
          }
        }

        @media (max-width: 768px) {
          .sponsors-wrapper {
            margin-top: 45px;
            margin-bottom: 50px;
          }

          .sponsors-carousel {
            height: 78px;
          }

          .marquee-content {
            gap: 50px;
          }
        }
      `}</style>
    </section>
  );
}
// components/SponsorsCarousel.js
'use client';

import React from 'react';

export default function SponsorsCarousel() {
  const sponsors = [
    { src: "/assets/img/ACS%20UNI.jpg", alt: "ACS UNI" },
    { src: "/assets/img/ACS-SC-UNAM-Color.png", alt: "ACS UNAM" },
    { src: "/assets/img/Logo10.svg", alt: "ACS Marca" },
  ];

  // Duplicating the list 6 times (even number) for a seamless infinite scroll on any screen size
  const duplicatedSponsors = [...sponsors, ...sponsors, ...sponsors, ...sponsors, ...sponsors, ...sponsors];

  return (
    <section className="container mt-5 mb-5 py-4">
      <div className="sponsors-carousel shadow-sm">
        <div className="marquee-content">
          {duplicatedSponsors.map((sponsor, index) => (
            <img key={index} src={sponsor.src} alt={sponsor.alt} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .sponsors-carousel {
          height: 150px;
          margin: 0 auto;
          max-width: 100%;
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          background-color: #ffffff;
          display: flex;
          align-items: center;
        }
        
        .sponsors-carousel::before,
        .sponsors-carousel::after {
          content: "";
          position: absolute;
          top: 0;
          width: 80px;
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
          gap: 100px;
          width: max-content;
          animation: scroll 50s linear infinite;
        }
        
        .marquee-content:hover {
          animation-play-state: paused;
        }

        .marquee-content img {
          height: 60px;
          width: auto;
          object-fit: contain;
          transition: all 0.3s ease;
          filter: grayscale(80%) opacity(60%);
        }

        .marquee-content img:hover {
          transform: scale(1.08);
          filter: grayscale(0%) opacity(100%);
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            /* calc(-50% - (gap / 2)) for mathematically exact loop when duplicated an even number of times */
            transform: translateX(calc(-50% - 50px));
          }
        }
      `}</style>
    </section>
  );
}
'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

function OfficerCard({ role, name, email }) {
  const imageFilename = name.toLowerCase().replace(/phd\. ?/g, '').replace(/ /g, '_') + '.jpg';
  const imagePath = `/assets/img/${imageFilename}`;
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

return (
  <div className={`officer-card ${isVisible ? 'visible' : ''}`} ref={cardRef}>
    <div className="officer-photo-container">
      <Image
        src={imagePath}
        alt={`Foto de ${name}`}
        width={100}
        height={100}
        loading="lazy"
        className="officer-photo"
      />
    </div>
    <div className="officer-details">
      <p className="officer-role">{role}</p>
      <h3 className="officer-name">{name}</h3>
      <a href={`mailto:${email}`} className="officer-email">
        {email}
      </a>
    </div>
  </div>
);


}

export default function OfficersList({ officers, title }) {
  return (
        <div className="officers-container">
          {officers.map(([role, name, email], idx) => (
            <OfficerCard key={idx} role={role} name={name} email={email} />
          ))}
        </div>
        );
}
'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTools, faArrowLeft } from '@/src/lib/fontawesome';

export default function MaintenancePage({ title, description }) {
  const locale = useLocale();

  return (
    <div className="maintenance-wrapper" style={{ marginTop: '-76px', paddingTop: '76px' }}>
      <div className="maintenance-container">

        <div className="maintenance-badge">
          Próximamente
        </div>

        <h1 className="maintenance-title">
          {title.split(' ').map((word, index) =>
            // Highlight specific words depending on the title, or just the first word
            index === 0 ? <span key={index}>{word} </span> : word + ' '
          )}
        </h1>

        <div className="maintenance-divider"></div>

        <p className="maintenance-text">
          {description}
        </p>

        <div className="maintenance-btn-group">
          <Link href={`/${locale}`} className="maintenance-btn-primary">
            <FontAwesomeIcon icon={faArrowLeft} />
            Volver al Inicio
          </Link>
        </div>

      </div>
    </div>
  );
}

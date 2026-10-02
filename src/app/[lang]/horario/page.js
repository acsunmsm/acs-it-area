'use client';

import Navbar from '@/src/components/Navbar';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function HorarioPage() {
  const locale = useLocale();

  return (
    <>
      <Navbar />

      <div className="container-fluid px-3 px-md-4 py-2 bg-white border-bottom d-flex align-items-center">
        <Link
          href={`/${locale}/resources`}
          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-2"
          style={{ borderRadius: '6px', fontWeight: 500 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>{locale === 'en' ? 'Back to Resources' : 'Volver a Recursos'}</span>
        </Link>
      </div>

      <main
        style={{
          width: '100%',
          height: 'calc(100vh - 76px - 49px)',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f8fafc'
        }}
      >
        <iframe
          src="/horario/index.html"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
          title="Generador de Horario ACS UNMSM"
        />
      </main>
    </>
  );
}


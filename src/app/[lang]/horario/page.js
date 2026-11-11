'use client';

import Navbar from '@/src/components/Navbar';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import styles from './horario.module.css';

export default function HorarioPage() {
  const locale = useLocale();

  return (
    <>
      <Navbar />

      <main className={styles.workspace}>
        <nav className={styles.returnBar}>
          <Link href={`/${locale}/resources`}>
            <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
            {locale === 'en' ? 'Back to Resources' : 'Volver a Recursos'}
          </Link>
        </nav>
        <iframe src="/horario/index.html"
          title="Generador de Horario ACS UNMSM"
        />
      </main>
    </>
  );
}


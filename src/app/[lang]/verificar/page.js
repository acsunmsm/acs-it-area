import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import { getTranslations } from 'next-intl/server';
import VerificarSearchForm from './VerificarSearchForm';
import styles from './verificar-search.module.css';

// ---------- Metadata dinámica ----------
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: 'verificar' });

  return {
    title: `${t('title')} – ACS UNMSM`,
    description: t('metaDescription'),
  };
}

export default async function VerificarPage({ params }) {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: 'verificar' });

  return (
    <>
      <Navbar />

      <main className="tema-biblioteca">
        {/* ---------- Hero Section con temática espacial y científica ---------- */}
        <section className={styles.heroSection}>
          <div className={styles.heroOverlay} />

          <div className={`container position-relative ${styles.heroContent}`}>
            <div className="row justify-content-center">
              <div className="col-lg-8 col-xl-7 text-center">
                <h1 className={styles.heroTitle}>
                  {t('title')}
                </h1>
                <p className={styles.heroSubtitle}>
                  {t('subtitle')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Form Section ---------- */}
        <section className={styles.searchSection}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 col-xl-7">
                <VerificarSearchForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

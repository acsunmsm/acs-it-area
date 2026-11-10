import Navbar from '@/src/components/Navbar';
import HeroCarousel from '@/src/components/HeroCarousel';
import Footer from '@/src/components/Footer';
import AwardsSection from '@/src/components/AwardsSection';
import FeaturedEventPopup from '@/src/components/FeaturedEventPopup';
import MascotaBot from '@/src/components/MascotaBot';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/src/i18n/navigation';
import styles from './home-community.module.css';

const alliedChapters = [
  { key: 'uni', logo: 'UNInew.svg', width: 1156, height: 108 },
  { key: 'pucp', logo: 'PUCPnew.svg', width: 1196, height: 108 },
  { key: 'peru', logo: 'PERUnew.svg', width: 1011, height: 103 },
];

export default async function HomePage({ params }) {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: 'homePage' });

  const about = await getTranslations({ locale: lang, namespace: 'about' });

  return (
    <main>
      <Navbar />
      <HeroCarousel />

      <section id="conocenos" className={styles.welcome} aria-labelledby="welcome-title">
        <div className={styles.welcomeLayout}>
          <div className={styles.welcomeCopy}>
            <h2 id="welcome-title">
              {t.rich('welcome', { chapter: name => <span>{name}</span> })}
            </h2>
            <p>{t('welcomeIntro')}</p>
            <p>{t('welcomeInvitation')}</p>
            <Link href="/contact" locale={lang} className={styles.contactLink}>
              <span>{t('welcomeContact')}</span> <span aria-hidden="true">→</span>
            </Link>
          </div>
          <figure className={styles.workshop}>
            <Image
              src="/assets/img/bienvenida-taller.webp"
              width={1280}
              height={720}
              sizes="(max-width: 800px) 88vw, (max-width: 1380px) 48vw, 650px"
              alt={t('workshopAlt')}
            />
            <figcaption>{t('workshopCaption')}</figcaption>
          </figure>
        </div>
      </section>

      <section id="nosotros" className={styles.about} aria-labelledby="about-title">
        <div className={styles.aboutLayout}>
          <div>
            <h2 id="about-title">{about('title')}</h2>
            <p>{about('intro')}</p>
          </div>
          <div className={styles.purpose}>
            {['mission', 'vision'].map(key => (
              <div key={key}>
                <h3>{about(key + 'Title')}</h3>
                <p>{about(key + 'Text')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reconocimientos Internacionales & Premios */}
      <AwardsSection />

      <section id="capitulos-aliados" className={styles.allies} aria-labelledby="allies-title">
        <div className={styles.alliesInner}>
          <div className={styles.alliesHeader}>
            <div>
              <h2 id="allies-title">{t('alliedChapters')}</h2>
              <p>{t('alliesIntro')}</p>
            </div>
            <Image
              className={styles.societyLogo}
              src="/assets/img/Logo10.svg"
              width={368}
              height={137}
              alt="American Chemical Society"
            />
          </div>
          <ul className={styles.chapterList}>
            {alliedChapters.map(({ key, logo, width, height }) => (
              <li key={key}>
                <Image
                  src={`/assets/img/${logo}`}
                  width={width}
                  height={height}
                  alt={t(`chapterNames.${key}`)}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Footer />
      <FeaturedEventPopup />

      {/* Asistente de bienvenida (mascota Carbonito). Abajo a la izquierda
          para no chocar con el botón de WhatsApp de la derecha. */}
      <MascotaBot />
    </main>
  );
}

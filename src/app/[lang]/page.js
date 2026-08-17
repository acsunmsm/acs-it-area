import Navbar from '@/src/components/Navbar';
import HeroCarousel from '@/src/components/HeroCarousel';
import Footer from '@/src/components/Footer';
import SponsorsCarousel from '@/src/components/SponsorsCarousel';
import FeaturedEventPopup from '@/src/components/FeaturedEventPopup';
import MascotaBot from '@/src/components/MascotaBot';
import { getTranslations } from 'next-intl/server';

export default async function HomePage({ params }) {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: 'homePage' });

  return (
    <main>
      <Navbar />
      <HeroCarousel />

      {/* Contenido principal */}
      <section className="hero-section py-10">
        <div className="container">
          <div className="row hero-content align-items-center">
            <div className="col-md-6 hero-image text-center">
              <img src="/assets/img/main.png" alt="Hero Image" className="img-fluid" />
            </div>
            <div className="col-md-6 hero-text mt-4 mt-md-0">
              <h1>{t('welcome')}</h1>
              <p className="lead">
                {t.rich('welcomePart1', {
                  strong: (chunks, i) => <strong key={`welcome1-${i}`}>{chunks}</strong>
                })}
                <br /><br />
                {t.rich('welcomePart2', {
                  strong: (chunks, i) => <strong key={`welcome2-${i}`}>{chunks}</strong>
                })}
                <br /><br />
                {t.rich('welcomePart3', {
                  strong: (chunks, i) => <strong key={`welcome3-${i}`}>{chunks}</strong>
                })}
              </p>
              <button
                className="btn btn-primary mt-3"
                style={{
                  backgroundColor: '#ffd400',
                  color: '#000',
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                {t('JoinUs')}
              </button>
            </div>
          </div>
        </div>
      </section>

      <SponsorsCarousel />
      <Footer />
      <FeaturedEventPopup />

      {/* Asistente de bienvenida (mascota Carbonito). Abajo a la izquierda
          para no chocar con el botón de WhatsApp de la derecha. */}
      <MascotaBot />
    </main>
  );
}

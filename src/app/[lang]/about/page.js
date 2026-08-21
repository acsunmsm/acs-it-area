// pages/about.js
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { getTranslations } from 'next-intl/server';
import Reveal, { RevealWords } from '@/src/components/Reveal';
import { FaBullseye, FaEye } from "react-icons/fa"; // íconos de misión y visión

export default async function About({ params }) {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: 'about' });

  return (
    <>
      <Navbar />

      {/* Hero con imagen de fondo */}
      <section
        className="hero-section py-3 text-white"
        style={{
          backgroundImage: "url('/assets/img/about.jpg')", // pon aquí tu imagen
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          minHeight: '75vh', // Ocupa todo el alto de la pantalla restante
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* Overlay con el nuevo gradiente corporativo */}
        <div
          className="fondo-molecular fondo-molecular--claro"
          style={{
            background: "linear-gradient(135deg, rgba(54, 36, 209, 0.85) 0%, rgba(30, 18, 126, 0.95) 100%)",
            position: "absolute",
            inset: 0,
          }}
        ></div>

        <div className="container position-relative z-1 mt-3">
          <div className="row align-items-center justify-content-center text-center">
            <div className="col-lg-10">
              <div className="mb-3 mx-auto">
                <span style={{ display: 'inline-block', width: '60px', height: '5px', backgroundColor: '#6FEDEE', borderRadius: '3px', marginBottom: '1rem' }}></span>
              </div>
              <RevealWords
                as="h1"
                text={t('title')}
                className="display-4 fw-bold mb-3"
                style={{ color: "#ffffff", letterSpacing: '-1px' }}
              />
              <Reveal as="p" delay={1} className="lead mb-3 mx-auto" style={{ maxWidth: '800px', color: 'rgba(226, 223, 223, 0.9)' }}>
                {t('intro')}
              </Reveal>

              {/* Bloques misión y visión */}
              <div className="row g-4 mt-2">
                <Reveal variant="scale" delay={2} className="col-md-6">
                  <div className="p-4 bg-white rounded-4 shadow-lg text-dark h-100 tarjeta-quimica" style={{ borderTop: '5px solid #1E127E', transition: 'transform 0.3s ease', paddingBottom: '3.5rem !important' }}>
                    <FaBullseye size={45} color="#1E127E" className="mb-3" />
                    <h4 className="fw-bold mb-3" style={{ color: "#1E127E" }}>
                      {t('missionTitle')}
                    </h4>
                    <p className="mb-3" style={{ fontSize: '1.05rem', color: '#444' }}>{t('missionText')}</p>
                  </div>
                </Reveal>

                <Reveal variant="scale" delay={3} className="col-md-6">
                  <div className="p-4 bg-white rounded-4 shadow-lg text-dark h-100 tarjeta-quimica" style={{ borderTop: '5px solid #1E127E', transition: 'transform 0.3s ease', paddingBottom: '3.5rem !important' }}>
                    <FaEye size={45} color="#1E127E" className="mb-3" />
                    <h4 className="fw-bold mb-3" style={{ color: "#1E127E" }}>
                      {t('visionTitle')}
                    </h4>
                    <p className="mb-3" style={{ fontSize: '1.05rem', color: '#444' }}>{t('visionText')}</p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

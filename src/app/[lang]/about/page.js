// pages/about.js
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { getTranslations } from 'next-intl/server';
import { FaBullseye, FaEye } from "react-icons/fa"; // íconos de misión y visión

export default async function About({ params }) {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: 'about' });

  return (
    <>
      <Navbar />

      {/* Hero con imagen de fondo */}
      <section
        className="hero-section py-5 text-white"
        style={{
          backgroundImage: "url('/assets/img/about.jpg')", // pon aquí tu imagen
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        {/* Overlay oscuro para mejorar contraste */}
        <div
          style={{
            backgroundColor: "rgba(0, 84, 166, 0.8)",
            position: "absolute",
            inset: 0,
          }}
        ></div>

        <div className="container position-relative">
          <div className="row align-items-center justify-content-center text-center">
            <div className="col-md-8">
              <h1 className="fw-bold mb-3" style={{ color: "#ffd400" }}>
                {t('title')}
              </h1>
              <p className="lead mb-5">{t('intro')}</p>

              {/* Bloques misión y visión con íconos */}
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="p-4 bg-white rounded shadow text-dark h-100 mission-vision-card">
                    <svg className="bg-icon" viewBox="0 0 100 100">
                      <polygon points="50,5 95,27 95,73 50,95 5,73 5,27" />
                    </svg>
                    <FaBullseye size={40} color="#412BFD" className="mb-3 position-relative z-1" />
                    <h5 className="fw-bold position-relative z-1" style={{ color: "#412BFD" }}>
                      {t('missionTitle')}
                    </h5>
                    <p className="position-relative z-1">{t('missionText')}</p>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-4 bg-white rounded shadow text-dark h-100 mission-vision-card">
                    <svg className="bg-icon" viewBox="0 0 100 100">
                      <polygon points="50,5 95,27 95,73 50,95 5,73 5,27" />
                    </svg>
                    <FaEye size={40} color="#412BFD" className="mb-3 position-relative z-1" />
                    <h5 className="fw-bold position-relative z-1" style={{ color: "#412BFD" }}>
                      {t('visionTitle')}
                    </h5>
                    <p className="position-relative z-1">{t('visionText')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Separador */}
      <section style={{ backgroundColor: "#ffffff", height: "50px" }}></section>

      <Footer />
    </>
  );
}

import { getOfficerAreas } from '@/src/lib/officerAreas';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import OfficersList from '@/src/components/OfficersList';
import { getTranslations } from 'next-intl/server';
import { RevealWords } from '@/src/components/Reveal';
import '@/src/assets/styles/globals.css';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: 'officers' });
  return {
    title: t('title'),
  };
}

export default async function Officers({ params }) {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: 'officers' });

  const areas = getOfficerAreas(t);

  const i18n = {
    advisorSection: t('advisorSection'),
    advisorAffiliation: t('advisorAffiliation'),
    boardHeading: t('boardHeading'),
    areas: {
      advisor: t('areas.advisor'),
      presidency: t('areas.presidency'),
      executive: t('areas.executive'),
      coordinations: t('areas.coordinations'),
    },
    singleMember: t('singleMember'),
    multipleMembers: t('multipleMembers'),
    filters: {
      all: t('filters.all'),
      advisor: t('filters.advisor'),
      presidency: t('filters.presidency'),
      executive: t('filters.executive'),
      coordinations: t('filters.coordinations'),
    },
    copyEmail: t('copyEmail'),
    copied: t('copied'),
  };

  return (
    <>
      <Navbar />

      <section
        className="hero-section text-white d-flex align-items-center"
        style={{
          minHeight: '35vh',
          marginTop: '-76px',
          paddingTop: '146px', // 70 + 76
          paddingBottom: '60px',
          background: 'linear-gradient(135deg, #3624D1 0%, #1E127E 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Elementos decorativos (Glow) para modernizar el fondo */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          right: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(111,237,238,0.15) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-40%',
          left: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255,212,0,0.08) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%'
        }}></div>

        {/* Elementos gráficos de Química (Collage de fondo) */}
        <div style={{ position: 'absolute', right: '0', top: '0', width: '50%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
          {/* Matraz principal */}
          <i className="fa fa-flask" style={{ position: 'absolute', right: '15%', top: '35%', transform: 'rotate(15deg)', fontSize: '180px', color: 'rgba(255, 255, 255, 0.15)' }}></i>
          {/* Enlaces moleculares */}
          <i className="fa fa-share-alt" style={{ position: 'absolute', right: '5%', bottom: '0%', transform: 'rotate(-25deg)', fontSize: '150px', color: 'rgba(111, 237, 238, 0.15)' }}></i>
          {/* Estructura cristalina/cubos */}
          <i className="fa fa-cubes" style={{ position: 'absolute', right: '35%', top: '55%', transform: 'translateY(-50%) rotate(10deg)', fontSize: '110px', color: 'rgba(255, 212, 0, 0.12)' }}></i>
          {/* Ideas/Ciencia */}
          <i className="fa fa-lightbulb-o" style={{ position: 'absolute', right: '28%', top: '25%', transform: 'rotate(-15deg)', fontSize: '70px', color: 'rgba(255, 255, 255, 0.1)' }}></i>
          {/* Pequeños nodos decorativos */}
          <div style={{ position: 'absolute', right: '40%', bottom: '25%', width: '15px', height: '15px', backgroundColor: 'rgba(111, 237, 238, 0.3)', borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', right: '20%', bottom: '45%', width: '10px', height: '10px', backgroundColor: 'rgba(255, 212, 0, 0.3)', borderRadius: '50%' }}></div>
        </div>

        <div className="container position-relative z-1 text-md-start text-center">
          <div className="mb-2">
            <span style={{
              display: 'inline-block',
              width: '60px',
              height: '5px',
              backgroundColor: '#6FEDEE',
              borderRadius: '3px',
              marginBottom: '1rem'
            }}></span>
          </div>
          <RevealWords
            as="h1"
            text={t('title')}
            className="display-4 fw-bold mb-3"
            style={{ color: '#ffffff', letterSpacing: '-1px' }}
          />
          <p style={{ color: 'rgba(226, 223, 223, 0.9)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto 0 0' }} className="mx-auto mx-md-0">
            {t('intro')}
          </p>
        </div>
      </section>
      <OfficersList areas={areas} title={t('title')} i18n={i18n} />

      <Footer />
    </>
  );
}
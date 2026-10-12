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

  // Traducciones de roles de la junta directiva
  const facultyAdvisor = t('roles.facultyAdvisor');
  const president = t('roles.president');
  const president2 = t('roles.president2');
  const vicePresident = t('roles.vicePresident');
  const treasurer = t('roles.treasurer');
  const secretary = t('roles.secretary');
  const marketingCoordinator = t('roles.marketingCoordinator');
  const marketingSubCoordinator = t('roles.marketingSubCoordinator');
  const eventsCoordinator = t('roles.eventsCoordinator');
  const eventsSubCoordinator = t('roles.eventsSubCoordinator');
  const humanResources = t('roles.humanResources');
  const humanResourcesSubCoordinator = t('roles.humanResourcesSubCoordinator');
  const internalLiaison = t('roles.internalLiaison');
  const externalLiaison = t('roles.externalLiaison');
  const cio = t('roles.cio');
  const dcio = t('roles.dcio');
  const k12Coordinator = t('roles.k12Coordinator');
  const k12SubCoordinator = t('roles.k12SubCoordinator');

  const areas = [
    {
      id: 'advisor',
      title: t('areas.advisor'),
      type: 'advisor',
      columns: 1,
      members: [
        {
          role: facultyAdvisor,
          name: 'PhD Jose Orlando Calvay Castillo',
          email: 'advisor@acs-unmsm.org',
          image: 'josecalvay.png',
          isAdvisor: true,
          affiliation: t('advisorAffiliation')
        }
      ]
    },
    {
      id: 'presidency',
      title: t('areas.presidency'),
      type: 'board',
      columns: 3,
      members: [
        {
          role: president,
          name: 'Breiner Smith Fuentes Bulnes',
          email: 'president@acs-unmsm.org',
          image: 'breiner_fuentes.jpg',
        },
        {
          role: president2,
          name: 'Geraldine Campos Arias',
          email: 'president@acs-unmsm.org',
          image: 'geraldine_campos.jpg',
        },
        {
          role: vicePresident,
          name: 'Rosario Cinthya Yaya Paitan',
          email: 'vicepresident@acs-unmsm.org',
          image: 'rosario_yaya.jpg',
        }
      ]
    },
    {
      id: 'executive',
      title: t('areas.executive'),
      type: 'board',
      columns: 2,
      members: [
        {
          role: secretary,
          name: 'Jean Franco Toledo Rodriguez',
          email: 'secretary@acs-unmsm.org',
          image: 'jean_toledo.jpg',
        },
        {
          role: treasurer,
          name: 'Yaquelin Cristina Juana Rivera Antonio',
          email: 'treasurer@acs-unmsm.org',
          image: 'yaquelin_rivera.jpeg',
        }
      ]
    },
    {
      id: 'marketing',
      title: t('areas.marketing'),
      type: 'coordination',
      columns: 2,
      members: [
        {
          role: marketingCoordinator,
          name: 'Angelica Esther Naucapoma Chillcce',
          email: 'chief.marketing@acs-unmsm.org',
          image: 'angelica_naucapoma.jpg',
        },
        {
          role: marketingSubCoordinator,
          name: 'Cielo Brighitt Rodriguez Montes',
          email: 'marketing@acs-unmsm.org',
          image: 'cielo_rodriguez.jpeg',
        }
      ]
    },
    {
      id: 'events',
      title: t('areas.events'),
      type: 'coordination',
      columns: 2,
      members: [
        {
          role: eventsCoordinator,
          name: 'Antonio Alburqueque Ampuero',
          email: 'chief.project.manager@acs-unmsm.org',
          image: 'antonio_alburqueque.jpg',
        },
        {
          role: eventsSubCoordinator,
          name: 'Andres Sebastián Bailon Vento',
          email: 'project.manager@acs-unmsm.org',
          image: 'andres_bailon.jpg',
        }
      ]
    },
    {
      id: 'humanResources',
      title: t('areas.humanResources'),
      type: 'coordination',
      columns: 2,
      members: [
        {
          role: humanResources,
          name: 'Yoselin Estefany Alvarez Cueva',
          email: 'chief.human.resources@acs-unmsm.org',
          image: 'yoselin_alvarez.jpg',
        },
        {
          role: humanResourcesSubCoordinator,
          name: 'Geancarlos Genaro Cora Díaz',
          email: 'human.resources@acs-unmsm.org',
          image: 'geancarlos_cora.jpg',
        }
      ]
    },
    {
      id: 'liaison',
      title: t('areas.liaison'),
      type: 'coordination',
      columns: 2,
      members: [
        {
          role: externalLiaison,
          name: 'Javier Antony Sanchez Hilasaca',
          email: 'external.liaison@acs-unmsm.org',
          image: 'javier_sanchez.jpg',
        },
        {
          role: internalLiaison,
          name: 'Kessia Brigitte Cordova Tantalean',
          email: 'internal.liaison@acs-unmsm.org',
          image: 'kesia_cordova.jpg',
        }
      ]
    },
    {
      id: 'technology',
      title: t('areas.technology'),
      type: 'coordination',
      columns: 2,
      members: [
        {
          role: cio,
          name: 'Gonzalo Manuel Aguilar Espinoza',
          email: 'cio@acs-unmsm.org',
          image: 'gonzalo.jpg',
        },
        {
          role: dcio,
          name: 'Paolo Jesus Pichilingue La Torre',
          email: 'dcio@acs-unmsm.org',
          image: 'paolo.jpeg',
        }
      ]
    },
    {
      id: 'k12',
      title: t('areas.k12'),
      type: 'coordination',
      columns: 2,
      members: [
        {
          role: k12Coordinator,
          name: 'Jeremy Antonio Silva More',
          email: 'k12@acs-unmsm.org',
          image: 'jeremy_silva.jpg',
        },
        {
          role: k12SubCoordinator,
          name: 'Ricardo Javier Gomez Sangay',
          email: 'subk12@acs-unmsm.org',
          image: 'ricardo.jpeg',
        }
      ]
    }
  ];

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
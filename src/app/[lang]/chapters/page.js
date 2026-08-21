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

  const officers = [
    [facultyAdvisor, 'PhD Jose Orlando Calvay Castillo', 'advisor@acs-unmsm.org', 'josecalvay.png'],
    [president, 'Breiner Smith Fuentes Bulnes', 'president@acs-unmsm.org', 'breiner_fuentes.jpg'],
    [vicePresident, 'Geraldine Campos Arias', 'president@acs-unmsm.org', 'geraldine_campos.jpg'],
    [treasurer, 'Yaquelin Cristina Juana Rivera Antonio', 'treasurer@acs-unmsm.org', 'yaquelin_rivera.jpeg'],
    [secretary, 'Jean Franco Toledo Rodriguez', 'secretary@acs-unmsm.org', 'jean_toledo.jpg'],
    [marketingCoordinator, 'Rosario Cinthya Yaya Paitan', 'chief.marketing@acs-unmsm.org', 'rosario_yaya.jpg'],
    [marketingSubCoordinator, 'Angelica Esther Naucapoma Chillcce', 'marketing@acs-unmsm.org', 'angelica_naucapoma.jpg'],
    [eventsCoordinator, 'Antonio Alburqueque Ampuero', 'chief.project.manager@acs-unmsm.org', 'antonio_alburqueque.jpg'],
    [eventsSubCoordinator, 'Andres Sebastián Bailon Vento', 'project.manager@acs-unmsm.org', 'andres_bailon.jpg'],
    [humanResources, 'Yoselin Estefany Alvarez Cueva', 'chief.human.resources@acs-unmsm.org', 'yoselin_alvarez.jpg'],
    [humanResourcesSubCoordinator, 'Geancarlos Genaro Cora Díaz', 'human.resources@acs-unmsm.org', 'geancarlos_cora.jpg'],
    [externalLiaison, 'Javier Antony Sanchez Hilasaca', 'external.liaison@acs-unmsm.org', 'javier_sanchez.jpg'],
    [internalLiaison, 'Kessia Brigitte Cordova Tantalean', 'internal.liaison@acs-unmsm.org', 'kesia_cordova.jpg'],
    [cio, 'Gonzalo Manuel Aguilar Espinoza', 'cio@acs-unmsm.org', 'gonzalo.jpg'],
    [dcio, 'Paolo Jesus Pichilingue La Torre', 'dcio@acs-unmsm.org', 'paolo.jpeg'],
    [k12Coordinator, 'Lucero Lidia Ventura Cruz', 'k12@acs-unmsm.org', 'lucero_ventura.jpg'],
    [k12SubCoordinator, 'Ricardo Gomez', 'subk12@acs-unmsm.org', 'ricardo.jpg']
  ];

  return (
    <>
      <Navbar />

      <section
        className="hero-section text-white d-flex align-items-center"
        style={{
          minHeight: '35vh',
          paddingTop: '70px',
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
          <i className="fa fa-flask" style={{ position: 'absolute', right: '15%', top: '15%', transform: 'rotate(15deg)', fontSize: '180px', color: 'rgba(255, 255, 255, 0.15)' }}></i>
          {/* Enlaces moleculares */}
          <i className="fa fa-share-alt" style={{ position: 'absolute', right: '5%', bottom: '10%', transform: 'rotate(-25deg)', fontSize: '150px', color: 'rgba(111, 237, 238, 0.15)' }}></i>
          {/* Estructura cristalina/cubos */}
          <i className="fa fa-cubes" style={{ position: 'absolute', right: '35%', top: '55%', transform: 'translateY(-50%) rotate(10deg)', fontSize: '110px', color: 'rgba(255, 212, 0, 0.12)' }}></i>
          {/* Ideas/Ciencia */}
          <i className="fa fa-lightbulb-o" style={{ position: 'absolute', right: '28%', top: '5%', transform: 'rotate(-15deg)', fontSize: '70px', color: 'rgba(255, 255, 255, 0.1)' }}></i>
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
      <OfficersList officers={officers} title={t('title')} />
      <Footer />
    </>
  );
}
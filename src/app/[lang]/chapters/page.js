import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import OfficersList from '@/src/components/OfficersList';
import { getTranslations } from 'next-intl/server';
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

      <section className="hero-section py-5 text-white" style={{ backgroundColor: '#0054a6' }}>
        <div className="container text-center">
          <h1 className="display-4 fw-bold mb-4" style={{ color: '#ffd400' }}>{t('title')}</h1>
        </div>
      </section>
      <OfficersList officers={officers} title={t('title')} />
      <Footer />
    </>
  );
}
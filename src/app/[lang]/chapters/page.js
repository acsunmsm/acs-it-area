import Head from 'next/head';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import OfficersList from '@/src/components/OfficersList';
import { getTranslations } from 'next-intl/server';
import '@/src/assets/styles/globals.css';

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
  const internalLiaison = t('roles.internalLiaison');
  const externalLiaison = t('roles.externalLiaison');
  const cio = t('roles.cio');
  const k12Coordinator = t('roles.k12Coordinator');
  
  const officers = [
    [facultyAdvisor, 'PhD Jose Orlando Calvay Castillo', 'advisor@acs-unmsm.org'],
    [president, 'Frances Atena Malapi Segura', 'president@acs-unmsm.org'],
    [treasurer, 'Breiner Smith Fuentes Bulnes', 'treasurer@acs-unmsm.org'],
    [secretary, 'Geraldine Campos Arias', 'secretary@acs-unmsm.org'],
    [secretary, 'Valery Celit Figueroa Chachi', 'secretary@acs-unmsm.org'],
    [marketingCoordinator, 'Zulie Milene Yucra Luza', 'chief.marketing@acs-unmsm.org'],
    [marketingSubCoordinator, 'Dalma Cruzado Tintaya', 'marketing@acs-unmsm.org'],
    [eventsCoordinator, 'Jhefferson Andre Zagaceta Pinpincos', 'chief.project.manager@acs-unmsm.org'],
    [eventsSubCoordinator, 'Victor Manuel Valqui Ramos', 'project.manager@acs-unmsm.org'],
    [humanResources, 'Amira Briseida Jacinto Mauricio', 'human.resources@acs-unmsm.org'],
    [internalLiaison, 'Javier Antony Sanchez Hilasaca', 'internal.liaison@acs-unmsm.org'],
    [externalLiaison, 'Diana Rosa Soto Mezarino', 'external.liaison@acs-unmsm.org'],
    [cio, 'Jose Alessandro Quispe Cabello', 'cio@acs-unmsm.org'],
    [k12Coordinator, 'Katia Melissa Merino Huaman', 'k12@acs-unmsm.org'],
  ];

  return (
    <>
      <Head>
        <title>{t('title')}</title>
      </Head>
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
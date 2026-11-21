import { getOfficerAreas, getOfficerPeriods } from '@/src/lib/officerAreas';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import OfficersList from '@/src/components/OfficersList';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import '@/src/assets/styles/officers.css';
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

  const periods = getOfficerPeriods(t);
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
      marketing: t('areas.marketing'),
      events: t('areas.events'),
      humanResources: t('areas.humanResources'),
      liaison: t('areas.liaison'),
      technology: t('areas.technology'),
      k12: t('areas.k12'),
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
    periods: {
      heading: t('periods.heading'),
      subtitle: t('periods.subtitle'),
      period2026: t('periods.period2026'),
      period2026Badge: t('periods.period2026Badge'),
      period2025: t('periods.period2025'),
      period2025Badge: t('periods.period2025Badge'),
      foundersHeaderTitle: t('periods.foundersHeaderTitle'),
      foundersSubtitle: t('periods.foundersSubtitle'),
      foundersIntro: t('periods.foundersIntro'),
      foundersTag: t('periods.foundersTag'),
      foundersArea: t('periods.foundersArea'),
    },
    copyEmail: t('copyEmail'),
    copied: t('copied'),
  };

  return (
    <>
      <Navbar />

      <main className="officers-page">
        <header className="officers-cover">
          <div className="officers-cover-inner">
            <div className="officers-cover-copy">
              <h1>{t('title')}</h1>
              <p>{t('intro')}</p>
            </div>
            <Image
              className="officers-cover-photo"
              src="/assets/img/fondosinicio/1786226892943-vn2xo9y.jpeg"
              alt=""
              width={1280}
              height={853}
              sizes="(max-width: 720px) 90vw, (max-width: 1400px) 40vw, 540px"
              loading="eager"
            />
          </div>
        </header>
        <OfficersList periods={periods} areas={areas} title={t('title')} i18n={i18n} />
      </main>

      <Footer />
    </>
  );
}
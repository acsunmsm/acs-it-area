import { getOfficerAreas } from '@/src/lib/officerAreas';
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
        <OfficersList areas={areas} title={t('title')} i18n={i18n} />
      </main>

      <Footer />
    </>
  );
}
// app/[lang]/prueba/page.js
import { getTranslations } from 'next-intl/server';

export default async function DebugPage({ params }) {
  // 🔥 idem: await params
  const { lang } = await params;

  const t = await getTranslations({ locale: lang, namespace: 'debug' });

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Debug Page</h1>
      <p><strong>Language param:</strong> {lang}</p>
      <p><strong>Title:</strong> {t('title')}</p>
      <p><strong>Description:</strong> {t('description')}</p>
    </div>
  );
}

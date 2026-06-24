// app/[lang]/layout.js
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { routing } from '@/src/i18n/routing';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';

import BootstrapJS from '@/src/components/BootstrapJS';
import WhatsAppButton from '@/src/components/WhatsAppButton';

export default async function LocaleLayout({ children, params }) {
  const { lang } = await params;

  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  const messages = await getMessages({ locale: lang });

  return (
    <NextIntlClientProvider locale={lang} messages={messages}>
      <BootstrapJS />
      <WhatsAppButton />
      {children}
    </NextIntlClientProvider>
  );
}

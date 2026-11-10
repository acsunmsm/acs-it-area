import { permanentRedirect } from 'next/navigation';

export default async function About({ params }) {
  const { lang } = await params;
  permanentRedirect(`/${lang}#nosotros`);
}

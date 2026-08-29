import ChemToolsClient from '@/src/components/chemtools/ChemToolsClient';

export const metadata = {
  title: 'ChemTools | ACS Student Chapter UNMSM',
  description: 'Herramientas interactivas de ingeniería química: Conversor de Unidades (SI, Inglés, Técnico) y ChemSolver (Colebrook-White, Antoine, Van der Waals, Números Adimensionales).',
};

export default async function ChemToolsPage({ params }) {
  const { lang } = await params;

  return <ChemToolsClient lang={lang} />;
}

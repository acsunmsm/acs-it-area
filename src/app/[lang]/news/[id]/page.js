import PublicationArticle, { publicationMetadata } from '@/src/components/PublicationArticle';

export function generateMetadata({ params }) {
  return publicationMetadata('news', params);
}

export default function NewsDetailsPage({ params }) {
  return <PublicationArticle kind="news" params={params} />;
}

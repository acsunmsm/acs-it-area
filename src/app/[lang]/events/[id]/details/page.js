import PublicationArticle, { publicationMetadata } from '@/src/components/PublicationArticle';

export function generateMetadata({ params }) {
  return publicationMetadata('event', params);
}

export default function EventDetailsPage({ params }) {
  return <PublicationArticle kind="event" params={params} />;
}

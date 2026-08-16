import { supabaseServer as supabase } from '../../../../../lib/supabase-server';
import Navbar from '../../../../../components/Navbar';
import Footer from '../../../../../components/Footer';
import styles from './page.module.css';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data: event } = await supabase
    .from('eventos')
    .select('titulo, descripcion')
    .eq('id', id)
    .single();

  if (!event) return { title: 'Evento no encontrado - ACS UNMSM' };

  return {
    title: `${event.titulo} - ACS UNMSM`,
    description: event.descripcion ? event.descripcion.substring(0, 160) : 'Detalles del evento',
  };
}

export default async function EventDetailsPage({ params }) {
  const { id, lang } = await params;

  // Data fetching en el servidor
  const { data: event, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !event) {
    // Retorna a página 404 de Next.js si no se encuentra
    return (
      <>
        <Navbar />
        <div className={styles.errorContainer}>
          <div className="alert alert-danger" role="alert">
            No se encontró el evento con el ID proporcionado o hubo un error al cargarlo.
          </div>
          <Link href={`/${lang}/events`} className="btn btn-primary mt-3">
            Volver a eventos
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <article className={styles.article}>
          <h1 className={styles.title}>{event.titulo}</h1>
          <p className={styles.meta}>
            Fecha: {new Date(event.fecha_programada).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <div className={styles.content}>
            {event.imagen_url && (
              <img
                src={event.imagen_url}
                alt={event.titulo || 'Imagen del evento'}
                className={styles.image}
              />
            )}
            <div className={styles.description}>
              <div dangerouslySetInnerHTML={{ __html: event.descripcion }} />
            </div>
          </div>
          <div className={styles.actions}>
            <Link href={`/${lang}/events`} className={styles.backButton}>
              Volver a Eventos
            </Link>
          </div>
        </article>
      </div>
      <Footer />
    </>
  );
}
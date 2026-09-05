import { supabaseServer as supabase } from '@/src/lib/supabase-server';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import styles from './page.module.css';
import Link from 'next/link';

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const { data: news } = await supabase
      .from('noticias')
      .select('titulo, extracto, contenido')
      .eq('id', id)
      .single();

    if (!news) return { title: 'Noticia no encontrada - ACS UNMSM' };

    return {
      title: `${news.titulo} - ACS UNMSM`,
      description: news.extracto || (news.contenido ? news.contenido.substring(0, 160) : 'Detalles de la noticia'),
    };
  } catch (err) {
    return { title: 'Noticia - ACS UNMSM' };
  }
}

export default async function NewsDetailsPage({ params }) {
  const { id, lang } = await params;

  // Data fetching en el servidor
  const { data: article, error } = await supabase
    .from('noticias')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !article) {
    // Retorna a página de error / 404 si no se encuentra
    return (
      <>
        <Navbar />
        <div className={styles.errorContainer}>
          <div className="alert alert-danger" role="alert">
            No se encontró la noticia con el ID proporcionado o hubo un error al cargarla.
          </div>
          <Link href={`/${lang}/news`} className="btn btn-primary mt-3">
            Volver a noticias
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  // Formateo de fecha
  let formattedDate = article.fecha;
  if (article.fecha) {
    try {
      const parsedDate = new Date(`${article.fecha}T12:00:00`);
      formattedDate = parsedDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      console.error('Error formateando la fecha:', e);
    }
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <article className={styles.article}>
          <h1 className={styles.title}>{article.titulo}</h1>
          <p className={styles.meta}>
            Fecha: {formattedDate}
          </p>
          <div className={styles.content}>
            {article.imagen_url && (
              <img
                src={article.imagen_url}
                alt={article.titulo || 'Imagen de la noticia'}
                className={styles.image}
              />
            )}
            <div className={styles.description}>
              <div dangerouslySetInnerHTML={{ __html: article.contenido || article.descripcion || article.extracto }} />
            </div>
          </div>
          <div className={styles.actions}>
            <Link href={`/${lang}/news`} className={styles.backButton}>
              Volver a Noticias
            </Link>
          </div>
        </article>
      </div>
      <Footer />
    </>
  );
}

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import Head from 'next/head';
import Navbar from '../../../../../components/Navbar';
import Footer from '../../../../../components/Footer';
import styles from './page.module.css';

export default function EventDetailsPage() {
  const params = useParams();
  const id = params.id; // Obtenemos el ID del evento desde la URL
  const router = useRouter();

  // Estados para manejar la información del evento, la carga y posibles errores
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    //Se ejecuta al montar el componente o cuando cambia el ID
    async function fetchEventDetails() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        //Consulta a Supabase para obtener un evento por ID
        const { data, error } = await supabase
          .from('eventos')
          .select('*')
          .eq('id', id)
          .single(); // ✅ Usamos .single() para obtener un solo registro

        if (error) {
          throw error; // Si hay error en la consulta, se maneja en catch
        }

        if (!data) {
          setError('No se encontró el evento con el ID proporcionado.');
        } else {
          setEvent(data);
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Ocurrió un error al cargar los detalles del evento.');
      } finally {
        setLoading(false);
      }
    }

    fetchEventDetails();
  }, [id]);

  //Mientras se cargan los datos, se muestra un mensaje de carga
  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.loadingContainer}>
          Cargando detalles del evento...
        </div>
        <Footer />
      </>
    );
  }

  //Si ocurre un error, mostramos un mensaje y un botón para volver a la lista de eventos
  if (error) {
    return (
      <>
        <Navbar />
        <div className={styles.errorContainer}>
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <button onClick={() => router.push('/es/events')} className="btn btn-primary mt-3">
            Volver a eventos
          </button>
        </div>
        <Footer />
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar />
        <div className={styles.notFoundContainer}>
          No se encontró el evento.
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{event.titulo} - ACS UNMSM</title>
        <meta name="description" content={event.descripcion} />
      </Head>
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
              <p>{event.descripcion}</p>
            </div>
          </div>
          <div className={styles.actions}>
            <button onClick={() => router.push('/es/events')} className={styles.backButton}>
              Volver a Eventos
            </button>
          </div>
        </article>
      </div>
      <Footer />
    </>
  );
}
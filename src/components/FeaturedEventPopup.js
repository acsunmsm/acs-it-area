'use client'; // This component will use client-side features like useState and useEffect

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Adjust path if necessary
import EventModal from './EventModal'; // Adjust path if necessary
import Link from 'next/link'; // For the "Register Now!" button
import { useTranslations, useLocale } from 'next-intl';

export default function FeaturedEventPopup() {
  const t = useTranslations('featuredEvent');
  const locale = useLocale();
  const [showModal, setShowModal] = useState(false);
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to format time (reused from your EventsPage)
  const formatTime12Hour = (time24h) => {
    if (!time24h) return '';
    try {
      const [hours, minutes] = time24h.split(':');
      let hour = parseInt(hours, 10);
      const suffix = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12; // Converts 0 to 12 for midnight, and 13-23 to 1-11
      return `${hour}:${minutes} ${suffix}`;
    } catch (e) {
      console.error('Error formatting time:', e);
      return time24h;
    }
  };

  useEffect(() => {
    async function fetchFeaturedEvent() {
      setLoading(true);
      setError(null);

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of today for comparison

        // Fetch events ordered by date ascending, limited to recent ones for efficiency
        // ✅ Se agregó 'inscription' a la consulta para validar si hay formulario
        const { data, error: supabaseError } = await supabase
          .from('eventos')
          .select('*, inscription') 
          .gte('fecha', today.toISOString().split('T')[0]) // Only get events from today onwards
          .order('fecha', { ascending: true }) // Order by closest date
          .limit(5);

        if (supabaseError) {
          console.error('Error fetching featured event:', supabaseError);
          setError('Could not load featured event.');
          setFeaturedEvent(null);
          return;
        }

        if (data && data.length > 0) {
          let closestFutureEvent = null;
          let minDiff = Infinity;

          data.forEach(event => {
            if (!event.hora || !event.fecha) return;

            const [year, month, day] = event.fecha.split('-').map(Number);
            const [hour, minute] = event.hora.split(':').map(Number);

            const eventDateTime = new Date(year, month - 1, day, hour, minute);
            const now = new Date();

            const diff = eventDateTime.getTime() - now.getTime();

            if (diff >= 0 && diff < minDiff) {
              minDiff = diff;
              closestFutureEvent = event;
            }
          });

          if (closestFutureEvent) {
            setFeaturedEvent(closestFutureEvent);
            // Only show if it hasn't been shown and dismissed in this session
            setShowModal(true);
          }
        } else {
          setFeaturedEvent(null); // No upcoming events found
        }

      } catch (err) {
        console.error('Unexpected error in fetchFeaturedEvent:', err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedEvent();
  }, []); // Run only once on component mount

  const handleCloseModal = () => {
    setShowModal(false);
    // Store in session storage that the user has dismissed the modal
    // This prevents it from popping up again if they navigate away and come back
    sessionStorage.setItem('featuredEventModalDismissed', 'true');
  };

  if (loading || error || !featuredEvent) {
    // Optionally render a loading state, error, or nothing if no event
    return null;
  }

  // ✅ Validar si el evento tiene un formulario de inscripción
  const hasInscription = featuredEvent.inscription && featuredEvent.inscription.length > 0;
  const buttonText = hasInscription ? t('register') : t('details');
  const buttonHref = hasInscription
    ? `/${locale}/events/${featuredEvent.id}/register`
    : `/${locale}/events/${featuredEvent.id}/details`;

  return (
    <EventModal
      onClose={handleCloseModal}
      title={t('title')}
      show={showModal}
    >
      <div style={{ padding: '20px', textAlign: 'center' }}>
        {featuredEvent.imagen_url ? (
          <img
            src={featuredEvent.imagen_url}
            alt={featuredEvent.titulo || 'Imagen del evento destacado'}
            style={{
              maxWidth: '100%',
              maxHeight: '300px', // Max height for the image in the popup
              height: 'auto',
              borderRadius: '8px',
              objectFit: 'cover',
              marginBottom: '15px'
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '250px', // Maintain consistent height with other images
              backgroundColor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              color: '#888',
              marginBottom: '15px'
            }}
          >
            {t('noImage')}
          </div>
        )}

        <h3 style={{ fontSize: '1.8em', color: '#333', marginBottom: '10px' }}>{featuredEvent.titulo}</h3>
        <p style={{ fontSize: '1em', color: '#666', marginBottom: '5px' }}>
          📅 {t('date')} {
            (() => {
              const dateParts = featuredEvent.fecha.split('-');
              const year = parseInt(dateParts[0]);
              const month = parseInt(dateParts[1]) - 1;
              const day = parseInt(dateParts[2]);
              const displayDate = new Date(year, month, day);
              const dateLocale = locale === 'en' ? 'en-US' : 'es-ES';
              return displayDate.toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' });
            })()
          }
        </p>
        <p style={{ fontSize: '1em', color: '#666', marginBottom: '20px' }}>
          <span style={{ marginRight: '5px' }}>🕓</span>{t('time')}{formatTime12Hour(featuredEvent.hora)}
        </p>

        {/* ✅ Lógica de botón dinámico */}
        <Link href={buttonHref} passHref>
          <button
            onClick={() => {
              if (hasInscription) {
                // Si hay inscripción, se navega normalmente, no es necesario hacer nada extra aquí
              } else {
                // Si no hay inscripción, puedes cerrar el modal y navegar
                handleCloseModal();
              }
            }}
            style={{
              padding: '12px 25px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1.1em',
              fontWeight: 'bold',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            {buttonText}
          </button>
        </Link>
      </div>
    </EventModal>
  );
}
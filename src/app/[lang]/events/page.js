'use client';

import { removePublicationCover } from '@/src/lib/updatePublication';
import { supabase } from '../../../lib/supabaseClient'; // Asegúrate de que esta ruta sea correcta
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import EventModal from '../../../components/EventModal';
import EventoForm from '../../../components/EventoForm';
import useAuth from '@/src/hooks/useAuth';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import './agenda.css';

const archivePhotos = [
  'reaccion-en-cadena', 'goodyear', 'diversilab', 'copeiq',
  'sintesis', 'atarjea', 'primavera', 'chemtalent',
];

function EventPhotoColumn({ side }) {
  const offset = side === 'right' ? 4 : 0;
  const photos = archivePhotos.slice(offset).concat(archivePhotos.slice(0, offset));
  return (
    <div className={`agenda-rail agenda-rail--${side}`} aria-hidden="true">
      <div className="agenda-reel">
        {[0, 1, 2].map(copy => (
          <div key={copy} className="agenda-reel-cycle">
            {photos.map(name => (
              <Image key={name} alt="" width={640} height={360} loading="eager" unoptimized
                src={`/assets/img/eventos-portada/${name}.webp`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function EventsPage() {
  const locale = useLocale();
  const t = useTranslations('events');

  const requestId = useRef(0);

  // Estados principales
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Búsqueda y preview
  const [previewFlyer, setPreviewFlyer] = useState(null); // { url, title }
  const [currentSearchInput, setCurrentSearchInput] = useState('');
  const [actualSearchTerm, setActualSearchTerm] = useState('');

  // Verificación de sesión de usuario
  const { session, loading: authLoading } = useAuth();
  const isAuthenticated = !!session;

  // Manejador de teclado para cerrar lightbox con Escape y bloqueo de scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPreviewFlyer(null);
      }
    };
    if (previewFlyer) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [previewFlyer]);

  // Formatear hora de 24h → 12h (con AM/PM)
  const formatTime12Hour = (time24h) => {
    if (!time24h) return '';
    try {
      const [hours, minutes] = time24h.split(':');
      let hour = parseInt(hours, 10);
      const suffix = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      return `${hour}:${minutes} ${suffix}`;
    } catch (e) {
      console.error('Error formateando la hora:', e);
      return time24h;
    }
  };

  // Verifica si un evento ya pasó
  const isEventExpired = (fechaProgramadaString) => {
    if (!fechaProgramadaString) return true;
    const eventDate = new Date(fechaProgramadaString);
    const now = new Date();
    return eventDate < now;
  };

  // Verifica si la hora debe mostrarse (se oculta 1 día después del evento o si no hay hora)
  const shouldShowTime = (event) => {
    if (!event.hora) return false;
    if (!event.fecha_programada) return true;
    const eventDate = new Date(event.fecha_programada);
    const hideDate = new Date(eventDate);
    hideDate.setDate(hideDate.getDate() + 1);
    const now = new Date();
    return now < hideDate;
  };

  // Función para manejar el clic en "Inscríbete"
  const handleRegisterClick = (event) => {
    if (isEventExpired(event.fecha_programada)) {
      alert(t('alertExpired'));
    } else {
      window.open(`/${locale}/events/${event.id}/register`, '_blank');
    }
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setCurrentSearchInput('');
    if (actualSearchTerm) searchEvents('');
  };

  // Cargar eventos desde Supabase con paginación
  const fetchEvents = useCallback(async (pageNumber, search, isLoadMore = false) => {
    const currentRequest = ++requestId.current;
    let query = supabase
      .from('eventos')
      .select('*', { count: 'exact' })
      .order('fecha', { ascending: false })
      .order('id', { ascending: false });

    if (search) {
      // Buscar por título o descripción
      query = query.or(`titulo.ilike.%${search}%,descripcion.ilike.%${search}%`);
    }

    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    try {
      const { data, count, error: supabaseError } = await query;

      if (currentRequest !== requestId.current) return;
      setError(null);
      if (supabaseError) {
        console.error('Error fetching events:', supabaseError);
        setError(t('errorFetch'));
        if (!isLoadMore) setEvents([]);
      } else {
        setPage(pageNumber);
        const fetchedData = data || [];
        if (isLoadMore) {
          setEvents((prev) => [...prev, ...fetchedData]);
        } else {
          setEvents(fetchedData);
        }

        const currentTotal = from + fetchedData.length;
        const totalAvailable = count ?? 0;
        setHasMore(count != null ? currentTotal < totalAvailable : fetchedData.length === PAGE_SIZE);
      }
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      console.error('Unexpected error fetching events:', err);
      setError('Ocurrió un error inesperado al cargar los eventos.');
      if (!isLoadMore) setEvents([]);
    } finally {
      if (currentRequest === requestId.current) {
        setLoadingMore(false);
        setLoadingEvents(false);
      }
    }
  }, [t]);

  function searchEvents(term) {
    setLoadingEvents(true);
    setActualSearchTerm(term);
    fetchEvents(0, term);
  }

  // Cargar más eventos (siguiente página)
  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    fetchEvents(nextPage, actualSearchTerm, true);
  };

  // Guardar término de búsqueda cuando el usuario hace submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (loadingEvents || authLoading || loadingMore) return;
    if (currentSearchInput !== actualSearchTerm || error) searchEvents(currentSearchInput);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- State updates follow the Supabase response.
    fetchEvents(0, '');
    return () => { requestId.current++; };
  }, [fetchEvents]);

  useEffect(() => {
    document.title = `${t('title')} - ACS UNMSM`;
  }, [t]);

  //Editar evento
  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  // Eliminar evento
  const handleDeleteClick = async (eventId) => {
    if (window.confirm(t('deleteConfirm'))) {
      setLoadingEvents(true);
      try {
        const { data, error } = await supabase.from('eventos').delete()
          .eq('id', eventId).select('imagen_url').single();
        if (error) throw error;
        await removePublicationCover(data.imagen_url);

        alert(t('deleteSuccess'));
        fetchEvents(0, actualSearchTerm, false);
      } catch (err) {
        console.error('Error al eliminar evento:', err);
        setError(err.message || 'Ocurrió un error al eliminar el evento.');
      } finally {
        setLoadingEvents(false);
      }
    }
  };

  // Cerrar sesión
  const handleLogout = async () => {
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) {
      console.error('Error al cerrar sesión:', logoutError);
      alert(t('logoutError'));
    } else {
      alert(t('logoutSuccess'));
    }
  };

  const busy = loadingEvents || authLoading;

  return (
    <div className="events-page-container chapter-agenda">
      <Navbar />
      <main>
        <header className="agenda-cover">
          <EventPhotoColumn side="left" />
          <div className="agenda-cover-copy">
            <h1>{t('title')}</h1>
            <p>{t('intro')}</p>
            <form onSubmit={handleSearchSubmit} className="agenda-search" role="search">
              <div className="agenda-search-field">
                <i className="fas fa-search" aria-hidden="true" />
                <input
                  type="text"
                  aria-label={t('searchPlaceholder')}
                  placeholder={t('searchHint')}
                  value={currentSearchInput}
                  onChange={(e) => setCurrentSearchInput(e.target.value)}
                />
                {currentSearchInput && (
                  <button
                    type="button"
                    className="agenda-clear"
                    disabled={busy || loadingMore}
                    onClick={handleClearSearch}
                    aria-label={t('clearSearch')}
                    title={t('clearSearch')}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <button type="submit" className="agenda-submit" disabled={busy || loadingMore}>
                <span>{t('searchButton')}</span>
              </button>
            </form>
          </div>
          <EventPhotoColumn side="right" />
        </header>
        <section className="agenda-list" aria-label={t('filterAll')} aria-busy={busy}>
          {isAuthenticated && (
            <div className="d-flex justify-content-end mb-4 px-2">
              <button onClick={handleLogout} className="btn btn-outline-danger fw-bold" style={{ borderRadius: '20px', padding: '8px 20px', fontFamily: 'Stolzl, sans-serif' }}>
                <i className="fas fa-sign-out-alt me-2"></i> {t('logout')}
              </button>
            </div>
          )}

          {error && !busy && <p className="agenda-message" role="alert">{error}</p>}
          {busy ? (
            <p className="agenda-message" role="status">{t('loadingMessage')}</p>
          ) : error && events.length === 0 ? null : events.length === 0 ? (
            <div className="no-events-container">
              <i className="fas fa-calendar-times no-events-icon"></i>
              <h3 className="no-events-text">
                {actualSearchTerm
                  ? `${t('noEventsSearch')} "${actualSearchTerm}"`
                  : t('noEventsEmpty')}
              </h3>
            </div>
          ) : (
            <div className="events-grid">
              {events.map((event) => {
                const isExpired = isEventExpired(event.fecha_programada);
                const showTime = shouldShowTime(event);

                return (
                  <article key={event.id} className="event-card">
                    <div className="event-image-wrapper">
                      {event.imagen_url ? (
                        <>
                          <img
                            src={event.imagen_url}
                            alt={event.titulo || event.nombre || 'Evento ACS UNMSM'}
                            className="event-image"
                            loading="lazy"
                          />
                          <button
                            type="button"
                            className="event-flyer-expand-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewFlyer({
                                url: event.imagen_url,
                                title: event.titulo || event.nombre || 'Flyer del evento'
                              });
                            }}
                            title={t('viewFlyer')}
                            aria-label={t('viewFlyer')}
                          >
                            <i className="fas fa-expand-arrows-alt"></i>
                            <span>{t('viewFlyer')}</span>
                          </button>
                        </>
                      ) : (
                        <div className="event-no-image">
                          <i className="fas fa-calendar-alt"></i>
                          <span>{t('noImage')}</span>
                        </div>
                      )}
                    </div>

                    {/* Contenido descriptivo del evento con tipografía Stolzl */}
                    <div className="event-content">
                      <h2 className="event-title">
                        {event.titulo}
                      </h2>

                      <ul className="event-info-list">
                        <li className="event-info-item">
                          <i className="far fa-calendar-alt"></i>
                          <span>
                            {(() => {
                              const displayDate = new Date(event.fecha_programada);
                              return displayDate.toLocaleDateString(locale, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              });
                            })()}
                          </span>
                        </li>
                        {showTime && (
                          <li className="event-info-item">
                            <i className="far fa-clock"></i>
                            <span>{formatTime12Hour(event.hora)}</span>
                          </li>
                        )}
                        <li className="event-info-item">
                          <i className="fas fa-map-marker-alt"></i>
                          <span>
                            {event.modalidad?.toLowerCase() === 'en persona' ? t('modeInPerson') : (event.modalidad === 'Virtual' || !event.modalidad ? t('modeVirtual') : event.modalidad)}
                          </span>
                        </li>
                      </ul>

                      <div className="event-actions">
                        <Link href={`/${locale}/events/${event.id}/details`} className="btn-event btn-event-outline">
                          {t('detailsButton')} <span aria-hidden="true">&rarr;</span>
                        </Link>

                        {event.inscription && (
                          <button
                            onClick={() => handleRegisterClick(event)}
                            className={`btn-event ${isExpired ? 'btn-event-disabled' : 'btn-event-primary'}`}
                            disabled={isExpired}
                          >
                            <i className="fas fa-ticket-alt"></i> {isExpired ? t('expiredButton') : t('registerButton')}
                          </button>
                        )}
                      </div>

                      {isAuthenticated && (
                        <div className="admin-actions">
                          <button onClick={() => handleEditClick(event)} className="btn-event btn-event-edit">
                            <i className="fas fa-edit"></i> {t('editButton')}
                          </button>
                          <button onClick={() => handleDeleteClick(event.id)} className="btn-event btn-event-delete">
                            <i className="fas fa-trash-alt"></i> {t('deleteButton')}
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!busy && events.length > 0 && hasMore && (
            <div className="agenda-pagination">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="agenda-submit agenda-load-more"
                aria-busy={loadingMore}
              >
                <span>{t(loadingMore ? 'loadingMore' : 'loadMore')}</span>
                <i className={loadingMore ? 'fas fa-spinner fa-spin' : 'fas fa-arrow-down'} aria-hidden="true" />
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Modal Lightbox para ver flyer completo en alta resolución */}
      {previewFlyer && (
        <div className="flyer-lightbox-overlay" onClick={() => setPreviewFlyer(null)} role="dialog" aria-modal="true">
          <div className="flyer-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="flyer-lightbox-close"
              onClick={() => setPreviewFlyer(null)}
              aria-label={t('closePreview')}
              title={t('closePreview')}
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="flyer-lightbox-header">
              <h4>{previewFlyer.title}</h4>
            </div>
            <div className="flyer-lightbox-body">
              <img src={previewFlyer.url} alt={previewFlyer.title} className="flyer-lightbox-img" />
            </div>
          </div>
        </div>
      )}

      <Footer />
      {showEditModal && (
        <EventModal
          onClose={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
          }}
          title={selectedEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
          show={showEditModal}
        >
          <EventoForm
            key={selectedEvent?.id || 'new'}
            event={selectedEvent}
            onSave={() => {
              fetchEvents(0, actualSearchTerm, false);
              setShowEditModal(false);
              setSelectedEvent(null);
            }}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedEvent(null);
            }}
          />
        </EventModal>
      )}
    </div>
  );
}

'use client';

import { supabase } from '../../../lib/supabaseClient'; // Asegúrate de que esta ruta sea correcta
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import EventModal from '../../../components/EventModal';
import EventoForm from '../../../components/EventoForm';
import useAuth from '@/src/hooks/useAuth';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { RevealWords } from '@/src/components/Reveal';

export default function EventsPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('events');

  const PAGE_SIZE = 10;

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

  // Ir a la página de detalles de un evento
  const handleDetailsClick = (event) => {
    router.push(`/${locale}/events/${event.id}/details`);
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
    setActualSearchTerm('');
    setPage(0);
  };

  // Cargar eventos desde Supabase con paginación
  async function fetchEvents(pageNumber = 0, search = '', isLoadMore = false) {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoadingEvents(true);
    }
    setError(null);

    let query = supabase
      .from('eventos')
      .select('*, inscription', { count: 'exact' })
      .order('fecha', { ascending: false });

    if (search) {
      // Buscar por título o descripción
      query = query.or(`titulo.ilike.%${search}%,descripcion.ilike.%${search}%`);
    }

    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    try {
      const { data, count, error: supabaseError } = await query;

      if (supabaseError) {
        console.error('Error fetching events:', supabaseError);
        setError(t('errorFetch'));
        if (!isLoadMore) setEvents([]);
      } else {
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
      console.error('Unexpected error fetching events:', err);
      setError('Ocurrió un error inesperado al cargar los eventos.');
      if (!isLoadMore) setEvents([]);
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoadingEvents(false);
      }
    }
  }

  // Cargar más eventos (siguiente página)
  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(nextPage, actualSearchTerm, true);
  };

  // Guardar término de búsqueda cuando el usuario hace submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActualSearchTerm(currentSearchInput);
    setPage(0);
  };

  useEffect(() => {
    setPage(0);
    fetchEvents(0, actualSearchTerm, false);
  }, [actualSearchTerm]);

  useEffect(() => {
    document.title = `${t('title')} - ACS UNMSM`;
  }, [t]);

  //Editar evento
  const handleEditClick = (event) => {
    console.log('DEBUG (EventsPage): Botón Editar clickeado. Evento seleccionado:', event);
    setSelectedEvent(event);
    setShowEditModal(true);
    console.log('DEBUG (EventsPage): showEditModal establecido a true.');
  };

  // Eliminar evento
  const handleDeleteClick = async (eventId) => {
    if (window.confirm(t('deleteConfirm'))) {
      setLoadingEvents(true);
      try {
        const { data: eventData, error: fetchError } = await supabase
          .from('eventos')
          .select('imagen_url')
          .eq('id', eventId)
          .single();

        if (fetchError) {
          throw new Error(`Error al obtener el evento para eliminar: ${fetchError.message}`);
        }

        if (eventData?.imagen_url) {
          const parts = eventData.imagen_url.split('/public/');
          const filePath = parts.length > 1 ? parts[1].split('/').slice(1).join('/') : null;

          if (filePath) {
            const { error: storageError } = await supabase.storage
              .from('eventos')
              .remove([filePath]);

            if (storageError) {
              console.warn('Advertencia: No se pudo eliminar la imagen del storage:', storageError.message);
            }
          }
        }

        const { error: deleteError } = await supabase
          .from('eventos')
          .delete()
          .eq('id', eventId);

        if (deleteError) {
          throw new Error(`Error al eliminar el evento de la base de datos: ${deleteError.message}`);
        }

        alert(t('deleteSuccess'));
        setPage(0);
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

  // Vista mientras carga
  if (loadingEvents || authLoading) {
    return (
      <div className="events-page-container">
        <Navbar />
        <section
          className="hero-section text-white d-flex align-items-center"
          style={{
            minHeight: '35vh',
            marginTop: '-76px',
            paddingTop: '146px', // 70 + 76
            paddingBottom: '60px',
            background: 'linear-gradient(135deg, #3624D1 0%, #1E127E 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Elementos decorativos (Glow) para modernizar el fondo */}
          <div style={{
            position: 'absolute',
            top: '-30%',
            right: '-5%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(111,237,238,0.15) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-40%',
            left: '-10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,212,0,0.08) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%'
          }}></div>

          {/* Elemento gráfico de Química (Marca de agua) */}
          <i className="fa fa-flask" style={{
            position: 'absolute',
            right: '5%',
            top: '57%',
            transform: 'translateY(-50%) rotate(15deg)',
            fontSize: '250px',
            color: 'rgba(255, 255, 255, 0.15)',
            zIndex: 0
          }}></i>

          <div className="container position-relative z-1 text-md-start text-center">
            <div className="mb-2">
              <span style={{
                display: 'inline-block',
                width: '60px',
                height: '5px',
                backgroundColor: '#6FEDEE',
                borderRadius: '3px',
                marginBottom: '1rem'
              }}></span>
            </div>
            <RevealWords
              as="h1"
              text={t('title')}
              className="display-4 fw-bold mb-3"
              style={{ color: '#ffffff', letterSpacing: '-1px' }}
            />
            <p style={{ color: 'rgba(226, 223, 223, 0.9)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto 0 0' }} className="mx-auto mx-md-0">
              {t('intro')}
            </p>
          </div>
        </section>
        <div className="container" style={{ flexGrow: 1, marginTop: '100px', textAlign: 'center' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 fw-bold text-muted">{t('loadingMessage')}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-page-container">
        <Navbar />
        <section
          className="hero-section text-white d-flex align-items-center"
          style={{
            minHeight: '35vh',
            marginTop: '-76px',
            paddingTop: '146px',
            paddingBottom: '60px',
            background: 'linear-gradient(135deg, #3624D1 0%, #1E127E 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Elementos decorativos (Glow) para modernizar el fondo */}
          <div style={{
            position: 'absolute',
            top: '-30%',
            right: '-5%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(111,237,238,0.15) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-40%',
            left: '-10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,212,0,0.08) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%'
          }}></div>

          {/* Elemento gráfico de Química (Marca de agua) */}
          <i className="fa fa-flask" style={{
            position: 'absolute',
            right: '5%',
            top: '57%',
            transform: 'translateY(-50%) rotate(15deg)',
            fontSize: '250px',
            color: 'rgba(255, 255, 255, 0.15)',
            zIndex: 0
          }}></i>

          <div className="container position-relative z-1 text-md-start text-center">
            <div className="mb-2">
              <span style={{
                display: 'inline-block',
                width: '60px',
                height: '5px',
                backgroundColor: '#6FEDEE',
                borderRadius: '3px',
                marginBottom: '1rem'
              }}></span>
            </div>
            <RevealWords
              as="h1"
              text={t('title')}
              className="display-4 fw-bold mb-3"
              style={{ color: '#ffffff', letterSpacing: '-1px' }}
            />
            <p style={{ color: 'rgba(226, 223, 223, 0.9)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto 0 0' }} className="mx-auto mx-md-0">
              {t('intro')}
            </p>
          </div>
        </section>
        <div className="container" style={{ flexGrow: 1, marginTop: '100px', textAlign: 'center' }}>
          <div className="alert alert-danger d-inline-block" role="alert" style={{ borderRadius: '15px' }}>
            <i className="fas fa-exclamation-triangle me-2"></i> Error: {error}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="events-page-container">
      <Navbar />

      <section
        className="hero-section text-white d-flex align-items-center"
        style={{
          minHeight: '35vh',
          marginTop: '-76px',
          paddingTop: '146px',
          paddingBottom: '60px',
          background: 'linear-gradient(135deg, #3624D1 0%, #1E127E 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Elementos decorativos (Glow) para modernizar el fondo */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          right: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(111,237,238,0.15) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-40%',
          left: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255,212,0,0.08) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%'
        }}></div>

        {/* Elemento gráfico de Química (Marca de agua) */}
        <i className="fa fa-flask" style={{
          position: 'absolute',
          right: '5%',
          top: '57%',
          transform: 'translateY(-50%) rotate(15deg)',
          fontSize: '250px',
          color: 'rgba(255, 255, 255, 0.15)',
          zIndex: 0
        }}></i>

        <div className="container position-relative z-1 text-md-start text-center">
          <div className="mb-2">
            <span style={{
              display: 'inline-block',
              width: '60px',
              height: '5px',
              backgroundColor: '#6FEDEE',
              borderRadius: '3px',
              marginBottom: '1rem'
            }}></span>
          </div>
          <RevealWords
            as="h1"
            text={t('title')}
            className="display-4 fw-bold mb-3"
            style={{ color: '#ffffff', letterSpacing: '-1px' }}
          />
          <p style={{ color: 'rgba(226, 223, 223, 0.9)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto 0 0', fontFamily: 'Stolzl, sans-serif' }} className="mx-auto mx-md-0">
            {t('intro')}
          </p>
        </div>
      </section>

      <div className="container" style={{ flexGrow: 1 }}>
        {/* Barra de búsqueda interactiva */}
        <div className="events-search-container">
          <form onSubmit={handleSearchSubmit} className="events-search-form">
            <i className="fas fa-search events-search-icon"></i>
            <input
              type="text"
              className="events-search-input"
              placeholder={t('searchPlaceholder')}
              value={currentSearchInput}
              onChange={(e) => setCurrentSearchInput(e.target.value)}
            />
            {currentSearchInput && (
              <button
                type="button"
                className="events-search-clear"
                onClick={handleClearSearch}
                aria-label="Limpiar búsqueda"
                title="Limpiar búsqueda"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
            <button type="submit" className="events-search-btn">
              <span>{t('searchButton')}</span>
            </button>
          </form>
        </div>

        {isAuthenticated && (
          <div className="d-flex justify-content-end mb-4 px-2">
            <button onClick={handleLogout} className="btn btn-outline-danger fw-bold" style={{ borderRadius: '20px', padding: '8px 20px', fontFamily: 'Stolzl, sans-serif' }}>
              <i className="fas fa-sign-out-alt me-2"></i> {t('logout')}
            </button>
          </div>
        )}

        {events.length === 0 ? (
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
                <div key={event.id} className="event-card">
                  {/* Contenedor del flyer sin recorte y con fondo ambiental */}
                  <div className="event-image-wrapper">
                    {event.imagen_url ? (
                      <>
                        <div
                          className="event-image-ambient"
                          style={{ backgroundImage: `url(${event.imagen_url})` }}
                          aria-hidden="true"
                        />
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
                    <h3 className="event-title" title={event.titulo}>
                      {event.titulo}
                    </h3>

                    <ul className="event-info-list">
                      <li className="event-info-item">
                        <i className="far fa-calendar-alt"></i>
                        <span>
                          {(() => {
                            const displayDate = new Date(event.fecha_programada);
                            return displayDate.toLocaleDateString('es-ES', {
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
                      <button onClick={() => handleDetailsClick(event)} className="btn-event btn-event-outline">
                        <i className="fas fa-info-circle"></i> {t('detailsButton')}
                      </button>

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
                </div>
              );
            })}
          </div>
        )}

        {events.length > 0 && hasMore && (
          <div className="btn-load-more-container">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="btn-load-more"
            >
              {loadingMore ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>{t('loadingMore')}</span>
                </>
              ) : (
                <>
                  <i className="fas fa-plus-circle"></i>
                  <span>{t('loadMore')}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

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
            console.log('DEBUG (EventsPage): Cerrando EventModal. Reseteando showEditModal y selectedEvent.');
            setShowEditModal(false);
            setSelectedEvent(null);
          }}
          title={selectedEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
          show={showEditModal}
        >
          <EventoForm
            event={selectedEvent}
            onSave={() => {
              console.log('DEBUG (EventsPage): onSave disparado desde EventoForm. Recargando eventos y cerrando modal.');
              setPage(0);
              fetchEvents(0, actualSearchTerm, false);
              setShowEditModal(false);
              setSelectedEvent(null);
            }}
            onCancel={() => {
              console.log('DEBUG (EventsPage): onCancel disparado desde EventoForm. Cerrando modal.');
              setShowEditModal(false);
              setSelectedEvent(null);
            }}
          />
        </EventModal>
      )}
    </div>
  );
}

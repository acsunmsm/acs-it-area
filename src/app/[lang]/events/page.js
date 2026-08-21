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
  const t = useTranslations('events');

  // Estados principales
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Estados para la búsqueda
  const [currentSearchInput, setCurrentSearchInput] = useState('');
  const [actualSearchTerm, setActualSearchTerm] = useState('');

  // Verificación de sesión de usuario
  const { session, loading: authLoading } = useAuth();
  const isAuthenticated = !!session;

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
    router.push(`events/${event.id}/details`);
  };

  // Función para manejar el clic en "Inscríbete"
  const handleRegisterClick = (event) => {
    if (isEventExpired(event.fecha_programada)) {
      alert(t('alertExpired'));
    } else {
      window.open(`events/${event.id}/register`, '_blank');
    }
  };

  // Cargar eventos desde Supabase (con búsqueda y límite de 10)
  async function fetchEvents(search = '') {
    setLoadingEvents(true);
    setError(null);

    let query = supabase
      .from('eventos')
      .select('*, inscription')
      .order('fecha', { ascending: false });

    if (search) {
      // Buscar por título o descripción
      query = query.or(`titulo.ilike.%${search}%,descripcion.ilike.%${search}%`);
    }

    query = query.limit(10);

    try {
      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        console.error('Error fetching events:', supabaseError);
        setError(t('errorFetch'));
        setEvents([]);
      } else {
        setEvents(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching events:', err);
      setError('Ocurrió un error inesperado al cargar los eventos.');
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }

  // Guardar término de búsqueda cuando el usuario hace submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActualSearchTerm(currentSearchInput);
  };

  useEffect(() => {
    fetchEvents(actualSearchTerm);
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
        fetchEvents(actualSearchTerm);
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
            paddingTop: '70px',
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
            top: '50%',
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
            paddingTop: '70px',
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
            top: '50%',
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
          paddingTop: '70px',
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
          top: '50%',
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
            Descubre y participa en las actividades, conferencias y talleres organizados para nuestra comunidad.
          </p>
        </div>
      </section>

      <div className="container" style={{ flexGrow: 1 }}>
        <div className="events-search-container">
          <form onSubmit={handleSearchSubmit} className="events-search-form">
            <input
              type="text"
              className="events-search-input"
              placeholder={t('searchPlaceholder')}
              value={currentSearchInput}
              onChange={(e) => setCurrentSearchInput(e.target.value)}
            />
            <button type="submit" className="events-search-btn">
              <i className="fas fa-search me-2"></i> {t('searchButton')}
            </button>
          </form>
        </div>

        {isAuthenticated && (
          <div className="d-flex justify-content-end mb-4 px-2">
            <button onClick={handleLogout} className="btn btn-outline-danger fw-bold" style={{ borderRadius: '20px', padding: '8px 20px' }}>
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
                  <div className="event-image-wrapper">
                    {event.imagen_url ? (
                      <img src={event.imagen_url} alt={event.nombre || 'Evento'} className="event-image" />
                    ) : (
                      <div className="event-no-image">
                        <i className="fas fa-image"></i>
                        <span>{t('noImage')}</span>
                      </div>
                    )}
                    <div className={`event-status-badge ${isExpired ? 'status-expired' : 'status-active'}`}>
                      {isExpired ? t('statusExpired') : t('statusNext')}
                    </div>
                  </div>

                  <div className="event-content">
                    <div className="event-type">
                      <i className="fas fa-tag"></i> {event.nombre}
                    </div>

                    <h3 className="event-title">{event.titulo}</h3>

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
      </div>

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
              fetchEvents(actualSearchTerm);
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

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
      alert('Lo sentimos, ¡este es un evento vencido! Te esperamos en el siguiente.');
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
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) {
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

        alert('Evento eliminado exitosamente.');
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
      alert('No se pudo cerrar la sesión. Inténtalo de nuevo.');
    } else {
      alert('Sesión cerrada exitosamente.');
    }
  };

  // Vista mientras carga
  if (loadingEvents || authLoading) {
    return (
      <>
        <Navbar />
        <section className="hero-section py-5 text-white" style={{ backgroundColor: '#0054A6' }}>
          <div className="container text-center">
            <h1 className="display-4 fw-bold mb-4" style={{ color: '#ffd400' }}>{t('title')}</h1>
          </div>
        </section>
        <section className="py-5 bg-white chapters-section" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <div className="container" style={{ flexGrow: 1, marginTop: '100px', textAlign: 'center' }}>
            <p className="text-center">{t('loadingMessage')}</p>
          </div>
          <Footer />
        </section>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <section className="py-5 bg-white chapters-section" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <div className="container" style={{ flexGrow: 1, marginTop: '100px', textAlign: 'center' }}>
            <h1 className="text-center">{t('title')}</h1>
            <p className="text-center" style={{ color: 'red' }}>Error: {error}</p>
          </div>
          <Footer />
        </section>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section className="hero-section py-5 text-white" style={{ backgroundColor: '#0054A6' }}>
        <div className="container text-center">
          <h1 className="display-4 fw-bold mb-4" style={{ color: '#ffd400' }}>{t('title')}</h1>
        </div>
      </section>
      <section className="py-5 bg-white chapters-section" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div className="container" style={{ flexGrow: 1 }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
            <input
              type="text"
              placeholder="Buscar eventos por título o descripción..."
              value={currentSearchInput}
              onChange={(e) => setCurrentSearchInput(e.target.value)}
              style={{
                flexGrow: 1,
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '1em',
                transition: 'background-color 0.3s ease'
              }}
            >
              Buscar
            </button>
          </form>

          {isAuthenticated && (
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  transition: 'background-color 0.3s ease',
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          )}

          {events.length === 0 && actualSearchTerm ? (
            <p className="text-center">No se encontraron eventos para: &quot;{actualSearchTerm}&quot;.</p>
          ) : events.length === 0 && !actualSearchTerm ? (
            <p className="text-center">No hay eventos disponibles en este momento.</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="mt-4" style={{ marginBottom: '40px', padding: '20px', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '1.8em', color: '#333', marginBottom: '15px' }}>{event.nombre}</h2>
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: '30px' }}>
                  <div style={{ flex: '1 1 300px', maxWidth: '450px' }}>
                    {event.imagen_url ? (
                      <img
                        src={event.imagen_url}
                        alt={event.nombre || 'Imagen del evento'}
                        style={{
                          width: '100%',
                          height: '250px',
                          borderRadius: '8px',
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '250px',
                          backgroundColor: '#e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '8px',
                          color: '#888'
                        }}
                      >
                        No hay imagen disponible
                      </div>
                    )}
                  </div>

                  <div style={{ flex: '1 1 400px' }}>
                    <h3 style={{ fontSize: '1.4em', color: '#555', marginBottom: '10px' }}>{event.titulo}</h3>
                    <p style={{ fontSize: '1em', color: '#666', marginTop: shouldShowTime(event) ? '10px' : '25px' }}>
                      📅 Fecha: {
                        (() => {
                          const displayDate = new Date(event.fecha_programada);
                          return displayDate.toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          });
                        })()
                      }
                    </p>
                    {shouldShowTime(event) && (
                      <p style={{ fontSize: '1em', color: '#666', marginTop: '10px' }}>
                        <span style={{ marginRight: '5px' }}>🕓</span>Hora: {formatTime12Hour(event.hora)}
                      </p>
                    )}
                    <p style={{ fontSize: '1em', color: '#666', marginTop: shouldShowTime(event) ? '10px' : '10px' }}>🚀Evento {event.modalidad?.toLowerCase() === 'en persona' ? 'presencial' : event.modalidad?.toLowerCase()}</p>

                    <div style={{ display: 'flex', gap: '10px', marginTop: shouldShowTime(event) ? '10px' : '30px' }}>
                      {/* ✅ Botón "Saber más" siempre visible, abre en nueva pestaña */}
                      <button
                        onClick={() => handleDetailsClick(event)}
                        style={{
                          padding: '10px 15px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '0.9em',
                          transition: 'background-color 0.3s ease',
                          display: 'inline-block'
                        }}
                      >
                        Saber más
                      </button>

                      {/* ✅ Botón "Inscríbete" condicional, abre en nueva pestaña */}
                      {event.inscription && (
                        <button
                          onClick={() => handleRegisterClick(event)}
                          style={{
                            padding: '10px 15px',
                            backgroundColor: isEventExpired(event.fecha_programada) ? '#6c757d' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: isEventExpired(event.fecha_programada) ? 'not-allowed' : 'pointer',
                            fontSize: '0.9em',
                            transition: 'background-color 0.3s ease',
                            display: 'inline-block'
                          }}
                          disabled={isEventExpired(event.fecha_programada)}
                        >
                          {isEventExpired(event.fecha_programada) ? 'Evento vencido' : 'Inscríbete'}
                        </button>
                      )}

                      {isAuthenticated && (
                        <>
                          <button
                            onClick={() => handleEditClick(event)}
                            style={{
                              padding: '10px 15px',
                              backgroundColor: '#ffc107',
                              borderColor: '#ffc107',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '0.9em',
                              transition: 'background-color 0.3s ease',
                            }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteClick(event.id)}
                            style={{
                              padding: '10px 15px',
                              backgroundColor: '#dc3545',
                              borderColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '0.9em',
                              transition: 'background-color 0.3s ease',
                            }}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

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
    </>
  );
}

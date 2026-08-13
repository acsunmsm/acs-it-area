// src/app/[lang]/dashboard/event-registrations/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabaseClient';
import useAuth from '@/src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Footer from '../../../../components/Footer';
import Navbar from '../../../../components/Navbar';
import RegistrationsModal from '../../../../components/RegistrationsModal'; // Importa el nuevo componente modal

export default function EventRegistrationsPage() {
  const { session, loading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Nuevo estado para controlar el modal

  // Redirección si no hay sesión
  useEffect(() => {
    if (loading) return;
    if (!session) {
      console.log('EventRegistrationsPage: No hay sesión activa. Redirigiendo a /login');
      router.push('/login');
    }
  }, [session, loading, router]);

  // Cargar eventos al cargar la página
  useEffect(() => {
    if (session) { // Solo cargar eventos si hay sesión
      fetchEvents();
    }
  }, [session]);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('eventos') // Tu tabla de eventos
        .select('id, titulo, fecha, hora, modalidad'); // Columnas que necesitas
      if (error) throw error;
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err.message);
      setError('Error al cargar los eventos. Inténtalo de nuevo.');
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchRegistrations = async (eventId) => {
    setLoadingRegistrations(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('event_registrations') // Tu tabla de registros de eventos
        .select('id,event_id,full_name,email,id_document,organization,position,major,phone_number,is_member,member_id,image_use_content,following_social_media,registered_at') // Consulta compacta
        .eq('event_id', eventId); // La columna que relaciona registros con eventos

      if (error) throw error;
      setRegistrations(data);
    } catch (err) {
      console.error('Error fetching registrations:', err.message);
      setError('Error al cargar los registros. Inténtalo de nuevo.');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleEventSelect = async (event) => {
    setSelectedEvent(event);
    await fetchRegistrations(event.id); // Espera a que los registros se carguen
    setIsModalOpen(true); // Abre el modal después de cargar los registros
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRegistrations([]); // Opcional: Limpiar registros al cerrar el modal
    setSelectedEvent(null); // Opcional: Limpiar evento seleccionado
  };

  const handleSearchButtonClick = () => {
    // La búsqueda se aplica automáticamente al filtrar `filteredEvents`
    // No se necesita lógica adicional aquí a menos que quieras buscar en la base de datos
    console.log("Botón Buscar clicado con término:", searchTerm);
  };

  const filteredEvents = events.filter(event => {
    const eventTitle = event.titulo || '';
    return eventTitle.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Si estás en estado de carga inicial o sin sesión, muestra un mensaje
  if (loading || !session) {
    return (
      <div className="loading-page">
        Verificando sesión o redirigiendo...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="event-registrations-page-container">
        <div className="event-registrations-card">
          <h1>Usuarios Registrados por Evento</h1>
          <p className="page-description">Selecciona un evento para ver la lista de usuarios registrados y descargarla.</p>

          {error && <p className="error-message">{error}</p>}

          <div className="search-input-container">
            <input
              type="text"
              placeholder="Buscar evento por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button
              onClick={handleSearchButtonClick}
              className="search-button"
            >
              Buscar
            </button>
          </div>

          {loadingEvents ? (
            <p className="loading-text">Cargando eventos...</p>
          ) : (
            <div className="event-grid-wrapper"> {/* Nuevo wrapper para la cuadrícula */}
              <h3>Eventos Disponibles:</h3>
              <div className="event-grid"> {/* Contenedor para la cuadrícula de eventos */}
                {filteredEvents.length > 0 ? (
                  filteredEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={() => handleEventSelect(event)}
                      className={`event-card ${selectedEvent?.id === event.id ? 'selected' : ''}`}
                    >
                      <h4 className="event-card-title">{event.titulo || '[Sin Título]'}</h4>
                      <p className="event-card-detail">
                        <span className="icon">🗓️</span> {new Date(event.fecha).toLocaleDateString()}
                      </p>
                      <p className="event-card-detail">
                        <span className="icon">⏰</span> {event.hora}
                      </p>
                      <p className="event-card-detail">
                        <span className="icon">📍</span> {event.modalidad?.toLowerCase() === 'en persona' ? 'presencial' : event.modalidad?.toLowerCase()}
                      </p>
                      <button className="view-registrations-button">Ver Registros</button>
                    </div>
                  ))
                ) : (
                  <p className="no-data-message">No se encontraron eventos.</p>
                )}
              </div>
            </div>
          )}
        </div>
        

      </div>

      {isModalOpen && selectedEvent && (
        <RegistrationsModal
          selectedEvent={selectedEvent}
          registrations={registrations}
          onClose={handleCloseModal}
          loadingRegistrations={loadingRegistrations}
          error={error}
        />
      )}

      {/* Estilos para la página y los nuevos estilos de eventos */}
      <style jsx>{`
        .loading-page {
          text-align: center;
          margin-top: 100px;
          font-size: 1.2em;
          color: #555;
        }
        .event-registrations-page-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 30px 20px;
          background-color: #f0f2f5;
          min-height: calc(100vh - var(--navbar-height, 60px) - var(--footer-height, 60px));
        }
        .event-registrations-card {
          background: #ffffff;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          max-width: 1200px; /* Aumentar el ancho máximo para la cuadrícula */
          width: 100%;
          text-align: center;
          margin-bottom: 30px;
        }
        .event-registrations-card h1 {
          font-size: 2.8em;
          color: #2c3e50;
          margin-bottom: 15px;
          font-weight: 700;
        }
        .page-description {
          font-size: 1.1em;
          color: #666;
          margin-bottom: 30px;
        }
        .error-message {
          color: #e74c3c;
          background-color: #fdeded;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #e74c3c;
          margin-bottom: 20px;
        }

        /* NIVELES DE ESTILO PARA EL INPUT Y EL BOTÓN DE BÚSQUEDA */
        .search-input-container {
          display: flex;
          gap: 10px;
          margin-bottom: 25px;
          width: 100%;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }
        .search-input {
          flex-grow: 1;
          padding: 12px 18px;
          border: 1px solid #dcdcdc;
          border-radius: 8px;
          font-size: 1.1em;
          box-sizing: border-box;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .search-input:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
          outline: none;
        }
        .search-button {
          padding: 12px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.1em;
          font-weight: 600;
          transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 10px rgba(0, 123, 255, 0.2);
        }
        .search-button:hover {
          background-color: #0056b3;
          transform: translateY(-1px);
          box-shadow: 0 6px 15px rgba(0, 123, 255, 0.3);
        }

        .loading-text, .no-data-message {
          font-style: italic;
          color: #777;
          margin: 20px 0;
        }

        /* Estilos para la cuadrícula de eventos (Event Grid) */
        .event-grid-wrapper {
          width: 100%;
          margin-bottom: 30px;
          padding: 10px;
          text-align: left;
        }
        .event-grid-wrapper h3 {
          font-size: 1.6em;
          color: #333;
          margin-bottom: 25px;
          text-align: left;
          border-bottom: 2px solid #eee;
          padding-bottom: 10px;
        }
        .event-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Columnas responsivas */
          gap: 25px; /* Espacio entre las tarjetas */
          padding: 10px;
        }
        .event-card {
          background-color: #fdfdfd;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          padding: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          justify-content: space-between; /* Para empujar el botón al final */
          text-align: left;
        }
        .event-card:hover {
          border-color: #007bff;
          box-shadow: 0 6px 20px rgba(0, 123, 255, 0.15);
          transform: translateY(-5px);
        }
        .event-card.selected {
          border: 2px solid #007bff;
          box-shadow: 0 8px 25px rgba(0, 123, 255, 0.2);
          background-color: #e6f0ff;
        }
        .event-card-title {
          font-size: 1.5em;
          color: #2c3e50;
          margin-bottom: 10px;
          font-weight: 600;
          line-height: 1.3;
        }
        .event-card-detail {
          font-size: 0.95em;
          color: #555;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }
        .event-card-detail .icon {
          margin-right: 8px;
          font-size: 1.1em;
          color: #007bff;
        }
        .view-registrations-button {
          margin-top: 20px;
          padding: 10px 18px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.95em;
          font-weight: 500;
          transition: background-color 0.3s ease, transform 0.2s ease;
          align-self: flex-start; /* Alinea el botón a la izquierda dentro de la tarjeta */
        }
        .view-registrations-button:hover {
          background-color: #0056b3;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .event-registrations-card {
            padding: 30px 20px;
          }
          .event-registrations-card h1 {
            font-size: 2em;
          }
          .page-description {
            font-size: 1em;
          }
          .search-input-container {
            flex-direction: column;
            align-items: stretch;
          }
          .search-input, .search-button {
            padding: 10px 15px;
            font-size: 0.9em;
          }
          .event-grid {
            grid-template-columns: 1fr; /* Una columna en móviles */
          }
          .event-card {
            padding: 20px;
          }
          .event-card-title {
            font-size: 1.3em;
          }
          .event-card-detail {
            font-size: 0.9em;
          }
          .view-registrations-button {
            font-size: 0.9em;
            padding: 8px 15px;
          }
        }
      `}</style>
    <Footer />
    </>
  );
}
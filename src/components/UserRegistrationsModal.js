// src/components/UserRegistrationsModal.js
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabaseClient';
import * as XLSX from 'xlsx'; // Importa la librería para Excel

// Modal que muestra registros de usuarios por evento
export default function UserRegistrationsModal({ show, onClose }) {
  // Estados principales
  const [events, setEvents] = useState([]); // Lista de eventos disponibles
  const [selectedEvent, setSelectedEvent] = useState(null); // Evento seleccionado
  const [registrations, setRegistrations] = useState([]); // Registros del evento seleccionado
  const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda de eventos
  const [loadingEvents, setLoadingEvents] = useState(true); // Estado de carga para eventos
  const [loadingRegistrations, setLoadingRegistrations] = useState(false); // Estado de carga para registros
  const [error, setError] = useState(''); // Manejo de errores

  // useEffect: cuando el modal se abre, carga los eventos. Si se cierra, limpia estados.
  useEffect(() => {
    if (show) {
      fetchEvents();
    } else {
      // Limpiar estados cuando el modal se cierra
      setEvents([]);
      setSelectedEvent(null);
      setRegistrations([]);
      setSearchTerm('');
      setError('');
    }
  }, [show]);

  // Obtiene todos los eventos desde la base de datos
  const fetchEvents = async () => {
    setLoadingEvents(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, name, date'); // Asume que 'name' y 'date' son campos de tu tabla events
      if (error) throw error;
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err.message);
      setError('Error al cargar los eventos. Inténtalo de nuevo.');
    } finally {
      setLoadingEvents(false);
    }
  };

  // Obtiene los registros de un evento específico
  const fetchRegistrations = async (eventId) => {
    setLoadingRegistrations(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *, // Selecciona todos los campos de event_registrations
          users ( // Une con la tabla de usuarios para obtener sus datos
            name, // Asume que el usuario tiene un campo 'name'
            email // Asume que el usuario tiene un campo 'email'
          )
        `)
        .eq('event_id', eventId); // Filtra por el evento

      if (error) throw error;
      setRegistrations(data);
    } catch (err) {
      console.error('Error fetching registrations:', err.message);
      setError('Error al cargar los registros. Inténtalo de nuevo.');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  // Al seleccionar un evento, guarda el evento y carga sus registros
  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    fetchRegistrations(event.id);
  };

  // Filtra eventos por nombre usando el término de búsqueda
  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadExcel = () => {
    if (registrations.length === 0) {
      alert('No hay datos de registro para descargar.');
      return;
    }

    // Mapear los datos para el formato de Excel
    const dataToExport = registrations.map(reg => ({
      'ID Registro': reg.id,
      'Nombre Usuario': reg.users ? reg.users.name : 'N/A', // Asume que el nombre del usuario está en reg.users.name
      'Email Usuario': reg.users ? reg.users.email : 'N/A', // Asume que el email del usuario está en reg.users.email
      'Fecha Registro': new Date(reg.registration_date).toLocaleDateString(), // Ajusta según tu campo
      // Añade aquí más campos que quieras exportar de event_registrations
      // 'Otro Campo': reg.otro_campo,
    }));

    // Genera el archivo Excel
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Registros ${selectedEvent?.name || 'Evento'}`);
    XLSX.writeFile(wb, `registros_evento_${selectedEvent?.name.replace(/\s/g, '_') || 'desconocido'}.xlsx`);
  };

  // Si el modal no está activo, no renderiza nada
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content-lg">
        <div className="modal-header">
          <h2>Ver Usuarios Registrados por Evento</h2>
          <button className="modal-close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {error && <p className="error-message">{error}</p>}

          <input
            type="text"
            placeholder="Buscar evento por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          {loadingEvents ? (
            <p>Cargando eventos...</p>
          ) : (
            <div className="event-list-container">
              <h3>Eventos Disponibles:</h3>
              <ul className="event-list">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map(event => (
                    <li
                      key={event.id}
                      onClick={() => handleEventSelect(event)}
                      className={`event-item ${selectedEvent?.id === event.id ? 'selected' : ''}`}
                    >
                      {event.name} ({new Date(event.date).toLocaleDateString()})
                    </li>
                  ))
                ) : (
                  <p>No se encontraron eventos.</p>
                )}
              </ul>
            </div>
          )}

          {selectedEvent && (
            <div className="registrations-section">
              <h3>Registros para: {selectedEvent.name}</h3>
              {loadingRegistrations ? (
                <p>Cargando registros...</p>
              ) : registrations.length > 0 ? (
                <>
                  <button onClick={handleDownloadExcel} className="download-button">
                    Descargar en Excel
                  </button>
                  <table className="registrations-table">
                    <thead>
                      <tr>
                        <th>ID Registro</th>
                        <th>Nombre Usuario</th>
                        <th>Email Usuario</th>
                        <th>Fecha Registro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map(reg => (
                        <tr key={reg.id}>
                          <td>{reg.id}</td>
                          <td>{reg.users ? reg.users.name : 'N/A'}</td>
                          <td>{reg.users ? reg.users.email : 'N/A'}</td>
                          <td>{new Date(reg.registration_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <p>No hay usuarios registrados para este evento.</p>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="button secondary-button">Cerrar</button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content-lg {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #eee;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .modal-header h2 {
          margin: 0;
          font-size: 1.8em;
          color: #333;
        }
        .modal-close-button {
          background: none;
          border: none;
          font-size: 2em;
          cursor: pointer;
          color: #aaa;
          transition: color 0.2s ease;
        }
        .modal-close-button:hover {
          color: #555;
        }
        .modal-body {
          flex-grow: 1;
          overflow-y: auto;
          padding-right: 10px; /* Para el scrollbar */
        }
        .search-input {
          width: 100%;
          padding: 12px 15px;
          margin-bottom: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1em;
        }
        .event-list-container {
          max-height: 250px;
          overflow-y: auto;
          border: 1px solid #eee;
          border-radius: 8px;
          margin-bottom: 20px;
          padding: 10px;
          background-color: #f9f9f9;
        }
        .event-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .event-item {
          padding: 12px 15px;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          transition: background-color 0.2s ease;
          font-weight: 500;
        }
        .event-item:last-child {
          border-bottom: none;
        }
        .event-item:hover {
          background-color: #eef;
        }
        .event-item.selected {
          background-color: #d0e0ff;
          color: #0056b3;
          font-weight: bold;
        }
        .registrations-section {
          margin-top: 30px;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        .registrations-section h3 {
          font-size: 1.5em;
          margin-bottom: 15px;
          color: #444;
        }
        .registrations-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        .registrations-table th, .registrations-table td {
          border: 1px solid #ddd;
          padding: 10px 12px;
          text-align: left;
          font-size: 0.95em;
        }
        .registrations-table th {
          background-color: #f2f2f2;
          font-weight: 600;
        }
        .download-button {
          background-color: #28a745; /* Verde */
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 0.95em;
          margin-bottom: 15px;
          transition: background-color 0.2s ease;
        }
        .download-button:hover {
          background-color: #218838;
        }
        .modal-footer {
          border-top: 1px solid #eee;
          padding-top: 15px;
          margin-top: 20px;
          text-align: right;
        }
        .button {
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1em;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        .secondary-button {
          background-color: #f0f0f0;
          color: #333;
          border: 1px solid #ccc;
        }
        .secondary-button:hover {
          background-color: #e0e0e0;
        }
        .error-message {
          color: #d32f2f;
          background-color: #ffebee;
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #ef9a9a;
          margin-bottom: 15px;
        }
      `}</style>
    </div>
  );
}
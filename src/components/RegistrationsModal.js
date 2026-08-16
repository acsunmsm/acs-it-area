// src/components/RegistrationsModal.js
import React from 'react';
import * as XLSX from 'xlsx';

export default function RegistrationsModal({ selectedEvent, registrations, onClose, loadingRegistrations, error }) {
  if (!selectedEvent) {
    return null; // No renderizar si no hay evento seleccionado
  }

  //Maneja la descarga de los registros en un archivo de Excel.
  const handleDownloadExcel = () => {
    // Si no hay registros, muestra una alerta y detiene la función.
    if (registrations.length === 0) {
      alert('No hay datos de registro para descargar.');
      return;
    }

    // Mapea los datos de los registros a un formato más amigable para el Excel.
    // Se definen las cabeceras de las columnas y se formatean los valores.
    const dataToExport = registrations.map(reg => ({
      'ID Registro': reg.id,
      'ID Evento': reg.event_id,
      'Nombre Completo': reg.full_name,
      'Email': reg.email,
      'Documento de Identidad': reg.id_document,
      'Organización': reg.organization,
      'Cargo': reg.position,
      'Carrera/Especialidad': reg.major,
      'Número de Teléfono': reg.phone_number,
      'Es Miembro': reg.is_member ? 'Sí' : 'No',
      'ID Miembro': reg.member_id || 'N/A',
      'Uso de Imagen/Contenido': reg.image_use_content ? 'Sí' : 'No',
      'Sigue Redes Sociales': reg.following_social_media ? 'Sí' : 'No',
      'Fecha de Registro': new Date(reg.registered_at).toLocaleDateString(),
    }));

    // Usa la librería XLSX para crear y descargar el archivo.
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Registros ${selectedEvent.titulo || 'Evento'}`);
    XLSX.writeFile(wb, `registros_evento_${selectedEvent.titulo?.replace(/\s/g, '_') || 'desconocido'}.xlsx`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h2>Registros para: <span className="selected-event-title">{selectedEvent.titulo || '[Sin Título]'}</span></h2>
        <p className="modal-event-details">
          Fecha: {new Date(selectedEvent.fecha).toLocaleDateString()} | Modalidad: {selectedEvent.modalidad?.toLowerCase() === 'en persona' ? 'presencial' : selectedEvent.modalidad?.toLowerCase()}
        </p>

        {error && <p className="error-message">{error}</p>}

        {loadingRegistrations ? (
          <p className="loading-text">Cargando registros...</p>
        ) : registrations.length > 0 ? (
          <>
            <button onClick={handleDownloadExcel} className="download-button-excel">
              Descargar en Excel
            </button>
            <div className="table-responsive-container">
              <table className="registrations-table-full">
                <thead>
                  <tr>
                    <th>ID Reg.</th>
                    <th>Nombre Completo</th>
                    <th>Email</th>
                    <th>Doc. Identidad</th>
                    <th>Organización</th>
                    <th>Cargo</th>
                    <th>Carrera</th>
                    <th>Teléfono</th>
                    <th>Es Miembro</th>
                    <th>ID Miembro</th>
                    <th>Uso Imagen</th>
                    <th>Redes Sociales</th>
                    <th>Fecha Reg.</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map(reg => (
                    <tr key={reg.id}>
                      <td>{reg.id}</td>
                      <td>{reg.full_name}</td>
                      <td>{reg.email}</td>
                      <td>{reg.id_document}</td>
                      <td>{reg.organization}</td>
                      <td>{reg.position}</td>
                      <td>{reg.major}</td>
                      <td>{reg.phone_number}</td>
                      <td>{reg.is_member ? 'Sí' : 'No'}</td>
                      <td>{reg.member_id || 'N/A'}</td>
                      <td>{reg.image_use_content ? 'Sí' : 'No'}</td>
                      <td>{reg.following_social_media ? 'Sí' : 'No'}</td>
                      <td>{new Date(reg.registered_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="no-data-message">No hay usuarios registrados para este evento.</p>
        )}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000; /* Asegura que esté por encima de todo */
          backdrop-filter: blur(5px); /* Efecto de desenfoque */
        }
        .modal-content {
          background: #ffffff;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25);
          max-width: 95%; /* Ajusta el ancho máximo */
          max-height: 90vh; /* Ajusta la altura máxima */
          overflow-y: auto; /* Permite desplazamiento si el contenido es muy largo */
          position: relative;
          width: 1000px; /* Ancho deseado para el modal */
          animation: fadeInScale 0.3s ease-out forwards;
        }

        .modal-close-button {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          font-size: 2em;
          color: #888;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .modal-close-button:hover {
          color: #333;
        }

        .modal-content h2 {
          font-size: 2.2em;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        .selected-event-title {
          color: #007bff;
        }
        .modal-event-details {
          font-size: 1em;
          color: #555;
          margin-bottom: 25px;
        }

        /* Reutilizamos estilos de la tabla y botones */
        .download-button-excel {
          background-color: #28a745;
          color: white;
          padding: 12px 25px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1em;
          margin-bottom: 20px;
          transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 10px rgba(40, 167, 69, 0.2);
        }
        .download-button-excel:hover {
          background-color: #218838;
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(40, 167, 69, 0.3);
        }
        .table-responsive-container {
          overflow-x: auto;
          margin-bottom: 20px;
        }
        .registrations-table-full {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          border-radius: 8px;
          overflow: hidden; /* Asegura que el border-radius se aplique */
        }
        .registrations-table-full th, .registrations-table-full td {
          border: 1px solid #e9ecef;
          padding: 12px 15px;
          text-align: left;
          font-size: 0.9em; /* Ligeramente más pequeño para el modal */
        }
        .registrations-table-full th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #495057;
          position: sticky; /* Fija los encabezados al hacer scroll dentro del modal */
          top: 0;
          z-index: 10;
        }
        .registrations-table-full tbody tr:nth-child(even) {
          background-color: #fcfcfc;
        }
        .registrations-table-full tbody tr:hover {
          background-color: #f5f5f5;
        }
        .loading-text, .no-data-message, .error-message {
            font-style: italic;
            color: #777;
            margin: 20px 0;
            text-align: center;
        }
        .error-message {
            color: #e74c3c;
            background-color: #fdeded;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid #e74c3c;
        }

        @keyframes fadeInScale {
            from {
                opacity: 0;
                transform: scale(0.95);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        @media (max-width: 768px) {
            .modal-content {
                padding: 20px;
            }
            .modal-content h2 {
                font-size: 1.8em;
            }
            .registrations-table-full th, .registrations-table-full td {
                padding: 8px 10px;
                font-size: 0.8em;
            }
            .download-button-excel {
                padding: 10px 20px;
                font-size: 0.9em;
            }
        }
      `}</style>
    </div>
  );
}
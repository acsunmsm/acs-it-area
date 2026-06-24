'use client';

import React from 'react';

export default function EventModal({ show, onClose, children, title = 'Detalles del Evento' }) {
  // Si el prop 'show' es falso, no renderizamos nada.
  // Esto es redundante si el padre ya lo renderiza condicionalmente,
  // pero lo hace más robusto si se usa de otra manera.
  if (!show) {
    return null;
  }

  console.log('DEBUG (EventModal): Modal renderizado con título:', title);

  return (
    // Overlay de fondo oscuro
    <div style={{
      position: 'fixed', // Clave para que se posicione respecto al viewport
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fondo semitransparente
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000, // ¡Muy importante! Asegura que esté por encima de todo
      // Animación de aparición
      opacity: 1, // Siempre 1 cuando 'show' es true
      transition: 'opacity 0.3s ease-in-out',
    }}>
      {/* Contenido del Modal */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        maxWidth: '90%',
        width: '600px', // Ancho máximo del modal
        maxHeight: '90vh', // Altura máxima del 90% del viewport
        overflowY: 'auto', // Permite desplazamiento si el contenido es largo
        // Animación de entrada
        transform: 'translateY(0)', // Siempre 0 cuando 'show' es true
        transition: 'transform 0.3s ease-out',
      }}>
        {/* Encabezado del Modal */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '10px',
          borderBottom: '1px solid #eee',
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5em', color: '#333' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '2em',
              cursor: 'pointer',
              color: '#666',
              padding: '0 8px',
              lineHeight: '1',
              transition: 'color 0.2s ease',
            }}
            onMouseOver={e => e.currentTarget.style.color = '#dc3545'}
            onMouseOut={e => e.currentTarget.style.color = '#666'}
          >
            &times; {/* Símbolo de cerrar */}
          </button>
        </div>

        {/* Aquí se renderizarán los 'children' (nuestro EventoForm) */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}

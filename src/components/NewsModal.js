'use client';

import React from 'react';

export default function NewsModal({ show, onClose, children, title = 'Detalles de la Noticia' }) {
  if (!show) {
    return null;
  }

  console.log('DEBUG (NewsModal): Modal renderizado con título:', title);

  return (
    // Overlay de fondo oscuro
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      opacity: 1,
      transition: 'opacity 0.3s ease-in-out',
      padding: '15px',
    }}>
      {/* Contenido del Modal */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        maxWidth: '90%',
        width: '720px',
        maxHeight: '90vh',
        overflowY: 'auto',
        transform: 'translateY(0)',
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
            &times;
          </button>
        </div>

        {/* NoticiaForm */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}

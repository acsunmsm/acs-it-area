'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Asegúrate de que esta ruta sea correcta
import { useRouter } from 'next/navigation'; // ¡Importa useRouter aquí!

export default function EventoForm({ event, onSave, onCancel }) {
  console.log('DEBUG (EventoForm): Componente EventoForm renderizado. Prop "event":', event);

  // Inicializa el estado con los datos del evento si se proporciona, o con valores vacíos
  const [id, setId] = useState(event?.id || null);
  const [titulo, setTitulo] = useState(event?.titulo || '');
  const [descripcion, setDescripcion] = useState(event?.descripcion || '');
  // Formatea la fecha para el input type="date" (YYYY-MM-DD)
  const [fecha, setFecha] = useState(event?.fecha ? new Date(event.fecha).toISOString().split('T')[0] : '');
  // 🆕 Añadir estado para la hora
  const [hora, setHora] = useState(event?.hora || '');
  // 🆕 Añadir estado para la modalidad
  const [modalidad, setModalidad] = useState(event?.modalidad || '');
  // ✅ Añadir estado para la inscripción
  const [inscripcion, setInscripcion] = useState(event?.inscription ?? true); // Valor por defecto a 'true'
  const [imagen, setImagen] = useState(null); // Para el nuevo archivo de imagen seleccionado
  const [imagenUrlActual, setImagenUrlActual] = useState(event?.imagen_url || null); // Para la URL de la imagen existente en la DB
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter(); // Inicializa el router

  // useEffect para actualizar el estado del formulario cuando el prop 'event' cambia
  // Esto es CRUCIAL para que el formulario se pre-rellene cuando se abre el modal para editar
  useEffect(() => {
    console.log('DEBUG (EventoForm): useEffect disparado. Valor actual de "event":', event);
    if (event) {
      setId(event.id);
      setTitulo(event.titulo);
      setDescripcion(event.descripcion);
      setFecha(event.fecha ? new Date(event.fecha).toISOString().split('T')[0] : '');
      // 🆕 Actualizar estado de hora y modalidad al editar
      setHora(event.hora || '');
      setModalidad(event.modalidad || '');
      // ✅ Actualizar estado de inscripción al editar
      setInscripcion(event.inscription ?? true);
      setImagenUrlActual(event.imagen_url || null);
      setImagen(null); // Resetea el archivo de imagen seleccionado al cambiar de evento
      if (fileInputRef.current) {
        fileInputRef.current.value = null; // Limpia el input de archivo
      }
      console.log('DEBUG (EventoForm): Estado inicializado para edición:', { id: event.id, titulo: event.titulo, fecha: event.fecha, hora: event.hora, modalidad: event.modalidad, inscripcion: event.inscription, imagenUrlActual: event.imagen_url });
    } else {
      // Si no hay evento (modo creación), resetea todos los campos
      setId(null);
      setTitulo('');
      setDescripcion('');
      setFecha('');
      // 🆕 Resetear hora y modalidad en modo creación
      setHora('');
      setModalidad('');
      // ✅ Resetear inscripción a su valor por defecto
      setInscripcion(true);
      setImagen(null);
      setImagenUrlActual(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      console.log('DEBUG (EventoForm): Estado inicializado para creación (vacío).');
    }
    setError(null); // Limpia cualquier error anterior
  }, [event]); // Dependencia: el objeto 'event'. Se ejecuta cada vez que 'event' cambia.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let finalImagenUrl = imagenUrlActual; // Por defecto, usa la URL de imagen actual o null

    try {
      if (imagen) { // Si se ha seleccionado un nuevo archivo de imagen
        const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(imagen.type)) {
          throw new Error('Tipo de archivo no permitido. Sube una imagen JPEG, PNG, GIF o WebP.');
        }

        // Eliminar la imagen antigua del storage de Supabase si estamos editando y había una imagen previa
        if (imagenUrlActual && id) {
          const parts = imagenUrlActual.split('/public/');
          const filePathToDelete = parts.length > 1 ? parts[1].split('/').slice(1).join('/') : null;
          if (filePathToDelete) {
            console.log('DEBUG (EventoForm): Eliminando imagen antigua del storage:', filePathToDelete);
            const { error: storageDeleteError } = await supabase.storage
              .from('eventos')
              .remove([filePathToDelete]);
            if (storageDeleteError) {
              console.warn('Advertencia: No se pudo eliminar la imagen antigua del storage:', storageDeleteError.message);
            }
          }
        }

        // Subir la nueva imagen
        const fileExt = imagen.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `flyers/${fileName}`;

        console.log('DEBUG (EventoForm): Subiendo nueva imagen a:', filePath);
        const { error: uploadError } = await supabase.storage
          .from('eventos')
          .upload(filePath, imagen, {
            cacheControl: '3600',
            upsert: false,
            contentType: imagen.type,
          });

        if (uploadError) {
          console.error('Error subiendo imagen:', uploadError);
          throw new Error('No se pudo subir la imagen. Por favor, intenta de nuevo.');
        }

        const { data: publicData } = supabase.storage
          .from('eventos')
          .getPublicUrl(filePath);

        if (!publicData?.publicUrl) {
          throw new Error('No se pudo obtener la URL pública de la imagen después de la subida.');
        }
        finalImagenUrl = publicData.publicUrl;
        console.log('DEBUG (EventoForm): Nueva imagen subida, URL:', finalImagenUrl);
      } else if (imagenUrlActual === null && event?.imagen_url) {
        // Caso en que el usuario tenía una imagen, pero la quitó explícitamente (imagenUrlActual = null)
        // y no seleccionó una nueva. finalImagenUrl ya es null, lo cual es correcto.
        // Si quieres eliminar la imagen del storage en este caso, necesitarías un botón específico
        // para "quitar imagen" que dispare la eliminación en el storage.
        // Por ahora, solo se elimina si se sube una nueva.
      }

      // 🆕 Combinar fecha + hora
      const fechaProgramada = fecha && hora
        ? new Date(`${fecha}T${hora}`).toISOString()
        : null;

      const eventData = {
        titulo,
        descripcion,
        fecha,
        hora: hora || null,
        modalidad: modalidad || null,
        // ✅ Añadir el campo de inscripción al objeto de datos
        inscription: inscripcion, 
        imagen_url: finalImagenUrl,
        fecha_programada: fechaProgramada, // 🆕 Nuevo campo
      };

      let dbError = null;
      if (id) {
        // Modo Edición: Actualizar evento existente
        console.log('DEBUG (EventoForm): Modo Edición. Actualizando evento con ID:', id, 'Datos:', eventData);
        const { error: updateError } = await supabase
          .from('eventos')
          .update(eventData)
          .eq('id', id);
        dbError = updateError;
      } else {
        // Modo Creación: Insertar nuevo evento
        console.log('DEBUG (EventoForm): Modo Creación. Insertando nuevo evento. Datos:', eventData);
        const { error: insertError } = await supabase.from('eventos').insert(eventData);
        dbError = insertError;
      }

      if (dbError) {
        console.error('Error guardando evento en la base de datos:', dbError);
        throw new Error(`No se pudo guardar el evento. Por favor, revisa los datos: ${dbError.message}`);
      }

      alert(`Evento ${id ? 'actualizado' : 'guardado'} exitosamente.`);

      if (id) { // Si estamos editando, cerramos el modal y refrescamos la lista
        if (onSave) {
          console.log('DEBUG (EventoForm): Llamando a onSave del padre (modo edición).');
          onSave(); // Llama a la función del padre para refrescar la lista y cerrar el modal
        }
      } else { // Si estamos creando, redirigimos a la página de eventos
        console.log('DEBUG (EventoForm): Modo creación. Redirigiendo a /events.');
        router.push('/es/events'); // Redirige a la página de eventos
      }

      // Resetea el formulario SOLO si es modo creación o si se cierra el modal
      if (!id) { // Solo resetea si estamos creando un nuevo evento
        setTitulo('');
        setDescripcion('');
        setFecha('');
        // 🆕 Resetear hora y modalidad
        setHora('');
        setModalidad('');
        // ✅ Resetear inscripción
        setInscripcion(true);
        setImagen(null);
        setImagenUrlActual(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
      }

    } catch (err) {
      console.error('Error en handleSubmit (EventoForm):', err);
      setError(err.message || 'Ocurrió un error inesperado al procesar el evento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flexGrow: 1, marginTop: '20px' }}>
      <h2 className="text-center mb-4" style={{ marginBottom: '2rem' }}>{id ? 'Editar Evento' : 'Crear Nuevo Evento'}</h2>
      {error && <p style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '500px',
        margin: '0 auto',
        padding: '10px',
        border: '1px solid #e0e0e0',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        backgroundColor: '#ffffff',
        gap: '15px'
      }}>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título del evento"
          required
          disabled={loading}
          style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
        />
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción detallada del evento"
          required
          disabled={loading}
          rows="6"
          style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical', fontSize: '1rem' }}
        />
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
          disabled={loading}
          style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
        />
        {/* 🆕 Campo de entrada para la hora */}
        <input
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          placeholder="Hora del evento"
          disabled={loading}
          style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
        />
        {/* 🆕 Selector para la modalidad */}
        <select
          value={modalidad}
          onChange={(e) => setModalidad(e.target.value)}
          required
          disabled={loading}
          style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
        >
          <option value="">Selecciona la modalidad</option>
          <option value="En persona">En persona</option>
          <option value="Virtual">Virtual</option>
        </select>

        {/* ✅ Campo de entrada para la inscripción */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
          <input
            id="inscripcion-checkbox"
            type="checkbox"
            checked={inscripcion}
            onChange={(e) => setInscripcion(e.target.checked)}
            disabled={loading}
            style={{ width: '20px', height: '20px' }}
          />
          <label htmlFor="inscripcion-checkbox" style={{ fontSize: '1rem', color: '#333' }}>
            Se requiere inscripción
          </label>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label htmlFor="file-input" style={{ fontSize: '0.9rem', color: '#555' }}>Seleccionar nueva imagen (opcional):</label>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => setImagen(e.target.files[0])}
            disabled={loading}
            style={{ padding: '12px 0', borderRadius: '6px', border: 'none', backgroundColor: 'transparent' }}
          />
          {imagen && <p style={{ fontSize: '0.9em', color: '#555' }}>Archivo seleccionado: <b>{imagen.name}</b></p>}
          {imagenUrlActual && !imagen && ( // Muestra la imagen actual solo si no se ha seleccionado una nueva
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <p style={{ fontSize: '0.9em', color: '#555' }}>Imagen actual:</p>
              <img src={imagenUrlActual} alt="Imagen actual del evento" style={{ width: '80px', height: 'auto', borderRadius: '5px', border: '1px solid #eee' }} />
              <button
                type="button"
                onClick={() => {
                  setImagenUrlActual(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = null;
                  }
                  console.log('DEBUG (EventoForm): Imagen actual eliminada del estado.');
                }}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.8em',
                }}
              >
                Quitar imagen
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 20px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: loading ? '#9dd5ff' : '#007bff',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            marginTop: '10px',
            transition: 'background-color 0.3s ease'
          }}
        >
          {loading ? 'Guardando Evento...' : (id ? 'Actualizar Evento' : 'Guardar Evento')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: '12px 20px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            backgroundColor: 'transparent',
            color: '#666',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            marginTop: '5px',
            transition: 'background-color 0.3s ease, color 0.3s ease'
          }}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}
'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Asegúrate de que esta ruta sea correcta
import { useRouter } from 'next/navigation'; // ¡Importa useRouter aquí!
import { Editor } from '@tinymce/tinymce-react';
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
      let fechaProgramada = null;
      if (fecha && hora) {
        fechaProgramada = new Date(`${fecha}T${hora}`).toISOString();
      } else if (fecha) {
        fechaProgramada = new Date(`${fecha}T00:00`).toISOString();
      }

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
        maxWidth: '700px',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <Editor
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
            value={descripcion}
            onEditorChange={(newValue, editor) => setDescripcion(newValue)}
            disabled={loading}
            init={{
              height: 400,
              menubar: false,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
              ],
              toolbar: 'undo redo | blocks fontfamily fontsize | ' +
                'bold italic underline strikethrough forecolor backcolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'image media link table charmap | removeformat fullscreen code | help',
              font_family_formats: 'Stolzl=Stolzl, sans-serif; Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats',
              toolbar_mode: 'sliding',
              image_advtab: true,
              image_dimensions: false,
              image_class_list: [
                { title: 'Normal (bloque, ajuste automático)', value: 'img-responsive' },
                { title: 'Flotar a la izquierda (texto al lado derecho)', value: 'img-float-left' },
                { title: 'Flotar a la derecha (texto al lado izquierdo)', value: 'img-float-right' },
                { title: 'Centrar imagen', value: 'img-center' },
                { title: 'En línea (varias imágenes en fila)', value: 'img-inline' },
              ],
              content_style: `
                @font-face { font-family: 'Stolzl'; src: url('/fonts/stolzl_thin.otf') format('opentype'); font-weight: 100; font-style: normal; font-display: swap; }
                @font-face { font-family: 'Stolzl'; src: url('/fonts/stolzl_light.otf') format('opentype'); font-weight: 300; font-style: normal; font-display: swap; }
                @font-face { font-family: 'Stolzl'; src: url('/fonts/stolzl_book.otf') format('opentype'); font-weight: 400; font-style: normal; font-display: swap; }
                @font-face { font-family: 'Stolzl'; src: url('/fonts/stolzl_regular.otf') format('opentype'); font-weight: normal; font-style: normal; font-display: swap; }
                @font-face { font-family: 'Stolzl'; src: url('/fonts/stolzl_medium.otf') format('opentype'); font-weight: 500; font-style: normal; font-display: swap; }
                @font-face { font-family: 'Stolzl'; src: url('/fonts/stolzl_bold.otf') format('opentype'); font-weight: bold; font-style: normal; font-display: swap; }
                body { font-family: 'Stolzl', Helvetica, Arial, sans-serif; font-size:14px; }
                img { max-width: 100%; height: auto; }
                .img-responsive { display: block; max-width: 100%; height: auto; margin: 10px 0; }
                .img-float-left { float: left; margin: 0 15px 10px 0; max-width: 50%; height: auto; }
                .img-float-right { float: right; margin: 0 0 10px 15px; max-width: 50%; height: auto; }
                .img-center { display: block; margin: 10px auto; max-width: 100%; height: auto; }
                .img-inline { display: inline-block; margin: 4px 2px; height: auto; vertical-align: top; }
                /* Distribución automática de imágenes inline por fila */
                p:has(> img.img-inline) { display: flex; flex-wrap: wrap; gap: 8px; }
                p:has(> img.img-inline) img.img-inline { flex: 1 1 0; min-width: 120px; max-width: 100%; object-fit: contain; }
              `,
              placeholder: 'Descripción detallada del evento',
              automatic_uploads: true,
              file_picker_types: 'image',
              // Solo asignar clase responsive si no tiene ninguna para que no se desborde al inicio
              setup: (editor) => {
                editor.on('NodeChange', (e) => {
                  if (e.element.nodeName === 'IMG') {
                    const img = e.element;
                    if (!img.className || img.className.trim() === '') {
                      img.className = 'img-responsive';
                    }
                  }
                });
              },
              file_picker_callback: (cb, value, meta) => {
                const input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');
                input.addEventListener('change', async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  try {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
                    const filePath = `editor/${fileName}`;
                    const { error: uploadError } = await supabase.storage
                      .from('eventos')
                      .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: file.type,
                      });
                    if (uploadError) throw uploadError;
                    const { data: publicData } = supabase.storage
                      .from('eventos')
                      .getPublicUrl(filePath);
                    cb(publicData.publicUrl, { title: file.name, class: 'img-responsive' });
                  } catch (err) {
                    console.error('Error subiendo imagen del editor:', err);
                    alert('Error al subir la imagen. Intenta de nuevo.');
                  }
                });
                input.click();
              }
            }}
          />
        </div>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
          disabled={loading}
          style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
        />
        {/* 🆕 Campo de entrada para la hora (opcional) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              id="incluir-hora-checkbox"
              type="checkbox"
              checked={!!hora}
              onChange={(e) => {
                if (e.target.checked) {
                  setHora('12:00'); // Hora por defecto al marcar
                } else {
                  setHora(''); // Limpiar hora al desmarcar
                }
              }}
              disabled={loading}
              style={{ width: '20px', height: '20px' }}
            />
            <label htmlFor="incluir-hora-checkbox" style={{ fontSize: '1rem', color: '#333' }}>
              Incluir hora del evento
            </label>
          </div>
          {!!hora && (
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              placeholder="Hora del evento"
              disabled={loading}
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', width: '100%' }}
            />
          )}
        </div>
        {/* 🆕 Selector para la modalidad */}
        <select
          value={modalidad}
          onChange={(e) => setModalidad(e.target.value)}
          required
          disabled={loading}
          style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
        >
          <option value="">Selecciona la modalidad</option>
          <option value="En persona">presencial</option>
          <option value="Virtual">virtual</option>
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

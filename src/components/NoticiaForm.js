'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Editor } from '@tinymce/tinymce-react';

export default function NoticiaForm({ article, onSave, onCancel }) {
  console.log('DEBUG (NoticiaForm): Componente NoticiaForm renderizado. Prop "article":', article);

  // Inicializa el estado con los datos de la noticia si se proporciona, o con valores vacíos
  const [id, setId] = useState(article?.id || null);
  const [titulo, setTitulo] = useState(
    article?.titulo || (typeof article?.title === 'object' ? (article.title.es || article.title.en) : article?.title) || ''
  );
  const [extracto, setExtracto] = useState(
    article?.extracto || (typeof article?.excerpt === 'object' ? (article.excerpt.es || article.excerpt.en) : article?.excerpt) || ''
  );
  const [categoria, setCategoria] = useState(article?.categoria || article?.category || 'logro');
  const [contenido, setContenido] = useState(article?.contenido || article?.descripcion || '');
  const [fecha, setFecha] = useState(
    article?.fecha ? new Date(article.fecha).toISOString().split('T')[0] : ''
  );
  const [imagen, setImagen] = useState(null);
  const [imagenUrlActual, setImagenUrlActual] = useState(article?.imagen_url || article?.image || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  // Helper para subir archivos a Supabase Storage con soporte de fallback
  const uploadToStorage = async (filePath, file) => {
    let targetBucket = 'noticias';
    let { error: uploadError } = await supabase.storage
      .from(targetBucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError && (uploadError.message?.toLowerCase().includes('not found') || uploadError.statusCode === '404' || uploadError.error === 'Bucket not found')) {
      console.warn("Bucket 'noticias' no disponible, usando bucket 'eventos' como respaldo...");
      targetBucket = 'eventos';
      const fallbackPath = `noticias/${filePath}`;
      const { error: fallbackError } = await supabase.storage
        .from(targetBucket)
        .upload(fallbackPath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (fallbackError) throw fallbackError;

      const { data: fallbackData } = supabase.storage
        .from(targetBucket)
        .getPublicUrl(fallbackPath);
      return fallbackData.publicUrl;
    } else if (uploadError) {
      throw uploadError;
    }

    const { data: publicData } = supabase.storage
      .from(targetBucket)
      .getPublicUrl(filePath);

    return publicData?.publicUrl;
  };

  // Sincronizar estado cuando la prop article cambia
  useEffect(() => {
    console.log('DEBUG (NoticiaForm): useEffect disparado. Valor actual de "article":', article);
    if (article) {
      setId(article.id || null);
      setTitulo(
        article.titulo || (typeof article.title === 'object' ? (article.title.es || article.title.en) : article.title) || ''
      );
      setExtracto(
        article.extracto || (typeof article.excerpt === 'object' ? (article.excerpt.es || article.excerpt.en) : article.excerpt) || ''
      );
      setCategoria(article.categoria || article.category || 'logro');
      setContenido(article.contenido || article.descripcion || '');
      setFecha(article.fecha ? new Date(article.fecha).toISOString().split('T')[0] : '');
      setImagenUrlActual(article.imagen_url || article.image || null);
      setImagen(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } else {
      setId(null);
      setTitulo('');
      setExtracto('');
      setCategoria('logro');
      setContenido('');
      setFecha('');
      setImagen(null);
      setImagenUrlActual(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
    setError(null);
  }, [article]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let finalImagenUrl = imagenUrlActual;

    try {
      if (imagen) {
        const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(imagen.type)) {
          throw new Error('Tipo de archivo no permitido. Sube una imagen JPEG, PNG, GIF o WebP.');
        }

        // Eliminar imagen antigua de Supabase Storage si se está editando
        if (imagenUrlActual && id && imagenUrlActual.includes('/public/')) {
          const parts = imagenUrlActual.split('/public/');
          if (parts.length > 1) {
            const afterPublic = parts[1].split('/');
            const bucket = afterPublic[0];
            const pathInBucket = afterPublic.slice(1).join('/');
            if (bucket && pathInBucket) {
              console.log(`DEBUG (NoticiaForm): Eliminando imagen previa de storage (${bucket}):`, pathInBucket);
              await supabase.storage.from(bucket).remove([pathInBucket]);
            }
          }
        }

        const fileExt = imagen.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `flyers/${fileName}`;

        console.log('DEBUG (NoticiaForm): Subiendo nueva imagen a:', filePath);
        finalImagenUrl = await uploadToStorage(filePath, imagen);
        console.log('DEBUG (NoticiaForm): Imagen subida con éxito, URL:', finalImagenUrl);
      }

      const noticiaData = {
        titulo,
        categoria: categoria || 'logro',
        extracto,
        contenido,
        fecha: fecha || new Date().toISOString().split('T')[0],
        imagen_url: finalImagenUrl,
      };

      let dbError = null;
      const isActualEdit = id && id !== 'prueba-1';

      if (isActualEdit) {
        console.log('DEBUG (NoticiaForm): Modo Edición. Actualizando noticia ID:', id, noticiaData);
        const { error: updateError } = await supabase
          .from('noticias')
          .update(noticiaData)
          .eq('id', id);
        dbError = updateError;
      } else {
        console.log('DEBUG (NoticiaForm): Modo Creación. Insertando nueva noticia:', noticiaData);
        const { error: insertError } = await supabase
          .from('noticias')
          .insert(noticiaData);
        dbError = insertError;
      }

      if (dbError) {
        console.error('Error guardando noticia en la base de datos:', dbError);
        throw new Error(`No se pudo guardar la noticia. Revisa los datos: ${dbError.message}`);
      }

      alert(`Noticia ${isActualEdit ? 'actualizada' : 'guardada'} exitosamente.`);

      if (onSave) {
        onSave();
      } else {
        router.push('/es/news');
      }

      if (!id) {
        setTitulo('');
        setExtracto('');
        setCategoria('logro');
        setContenido('');
        setFecha('');
        setImagen(null);
        setImagenUrlActual(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
      }
    } catch (err) {
      console.error('Error en handleSubmit (NoticiaForm):', err);
      setError(err.message || 'Ocurrió un error inesperado al procesar la noticia.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flexGrow: 1, marginTop: '20px' }}>
      <h2 className="text-center mb-4" style={{ marginBottom: '2rem' }}>
        {id ? 'Editar Noticia' : 'Crear Nueva Noticia'}
      </h2>
      {error && <p style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{error}</p>}

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '700px',
          margin: '0 auto',
          padding: '10px',
          border: '1px solid #e0e0e0',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          backgroundColor: '#ffffff',
          gap: '15px',
        }}
      >
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título de la noticia"
          required
          disabled={loading}
          style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <Editor
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
            value={contenido}
            onEditorChange={(newValue) => setContenido(newValue)}
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
              placeholder: 'Descripción detallada de la noticia',
              automatic_uploads: true,
              file_picker_types: 'image',
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
              file_picker_callback: (cb) => {
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

                    const publicUrl = await uploadToStorage(filePath, file);
                    cb(publicUrl, { title: file.name, class: 'img-responsive' });
                  } catch (err) {
                    console.error('Error subiendo imagen del editor:', err);
                    alert('Error al subir la imagen. Intenta de nuevo.');
                  }
                });
                input.click();
              },
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

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
          disabled={loading}
          style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
        >
          <option value="">Selecciona la categoría</option>
          <option value="logro">Logro</option>
          <option value="convocatoria">Convocatoria</option>
          <option value="comunidad">Comunidad</option>
        </select>

        <textarea
          value={extracto}
          onChange={(e) => setExtracto(e.target.value)}
          placeholder="Extracto o resumen breve (se mostrará en la tarjeta principal)"
          rows={3}
          required
          disabled={loading}
          style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'inherit' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label htmlFor="file-input" style={{ fontSize: '0.9rem', color: '#555' }}>
            Seleccionar nueva imagen (opcional):
          </label>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => setImagen(e.target.files[0])}
            disabled={loading}
            style={{ padding: '12px 0', borderRadius: '6px', border: 'none', backgroundColor: 'transparent' }}
          />
          {imagen && (
            <p style={{ fontSize: '0.9em', color: '#555' }}>
              Archivo seleccionado: <b>{imagen.name}</b>
            </p>
          )}
          {imagenUrlActual && !imagen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <p style={{ fontSize: '0.9em', color: '#555' }}>Imagen actual:</p>
              <img
                src={imagenUrlActual}
                alt="Imagen actual de la noticia"
                style={{ width: '80px', height: 'auto', borderRadius: '5px', border: '1px solid #eee' }}
              />
              <button
                type="button"
                onClick={() => {
                  setImagenUrlActual(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = null;
                  }
                  console.log('DEBUG (NoticiaForm): Imagen actual eliminada del estado.');
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
            transition: 'background-color 0.3s ease',
          }}
        >
          {loading ? 'Guardando Noticia...' : id ? 'Actualizar Noticia' : 'Guardar Noticia'}
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
            transition: 'background-color 0.3s ease, color 0.3s ease',
          }}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}

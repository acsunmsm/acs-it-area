'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import Swal from 'sweetalert2';

// Si vas a usar estilos en línea o importar formStyles, define o importa aquí:
// import formStyles from './formStyles'; // si lo tienes

export default function EventRegistrationPage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  // Estados principales
  const [event, setEvent] = useState(null); // Datos del evento
  const [loadingEvent, setLoadingEvent] = useState(true); // Estado de carga al traer el evento
  const [loadingRegistration, setLoadingRegistration] = useState(false); // Estado de carga al enviar el formulario
  const [errorEvent, setErrorEvent] = useState(null); //Manejo de errores
  const [formattedDate, setFormattedDate] = useState(''); //Fecha de formato legible
  const formatTime12Hour = (time24h) => {
    if (!time24h) return '';
    try {
      // Divide la hora en partes (HH:MM:SS) y toma solo HH y MM
      const [hours, minutes] = time24h.split(':');
      let hour = parseInt(hours, 10);
      const suffix = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12; // Convierte 0 a 12 para la medianoche, y 13-23 a 1-11
      return `${hour}:${minutes} ${suffix}`;
    } catch (e) {
      console.error('Error formateando la hora:', e);
      return time24h; // Retorna la hora original si hay un error
    }
  };
  const showError = (msg) => {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: msg,
      confirmButtonColor: '#412BFD'
    });
  };

  const showSuccess = () => {
    Swal.fire({
      icon: 'success',
      title: '¡Registro exitoso!',
      text: 'Gracias por registrarte. ¡Nos vemos en el evento!',
      confirmButtonColor: '#412BFD'
    }).then(() => {
      router.push('/events');
    });
  };

  const isStudentVariant = (value) => /estudiante|student/i.test(value.trim());

  useEffect(() => {
    async function fetchEventDetails() {
      if (!id) return;

      setLoadingEvent(true);
      setErrorEvent(null);
      try {
        const { data, error } = await supabase
          .from('eventos')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          setErrorEvent('No se pudo cargar la información del evento.');
        } else {
          setEvent(data);
          setFormattedDate(
            new Date(data.fecha_programada).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          );
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setErrorEvent('Ocurrió un error inesperado al cargar el evento.');
      } finally {
        setLoadingEvent(false);
      }
    }

    fetchEventDetails();
  }, [id]);

  // Manejo del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingRegistration(true);
    setErrorEvent(null);

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    delete data.event_name;

    data.event_id = id;
    data.is_member = data.is_member === "true";
    data.image_use_content = data.image_use_content === "true";
    data.following_social_media = data.following_social_media === "true";
    data.registered_at = new Date().toISOString();

    // Validaciones
    if (!data.email.includes('@')) return endWithError('El correo debe contener "@"');
    if (data.id_document.length > 20) return endWithError('DNI/Carnet no debe exceder los 20 caracteres');
    if (!/^\d{9}$/.test(data.phone_number)) return endWithError('Número de WhatsApp debe tener 9 dígitos');
    if (!data.following_social_media) return endWithError('Debes seguirnos en redes sociales para registrarte');
    if (data.is_member && (!data.member_id || !/^\d{8}$/.test(data.member_id)))
      return endWithError('Debes ingresar tu Member ID de 8 dígitos si eres miembro');
    if (isStudentVariant(data.position) && (!data.major || data.major.trim() === ''))
      return endWithError('Si eres estudiante, debes indicar tu carrera');

    // Limpiar nulos
    if (!data.member_id) data.member_id = null;
    if (!data.major || data.major.trim() === '') data.major = null;

    try {

      //Inserción en la tabla de registros de eventos
      const { error: insertError } = await supabase
        .from('event_registrations')
        .insert([data]);

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        return endWithError('Error al registrar: ' + insertError.message);
      }

      form.reset();
      showSuccess();
    } catch (err) {
      console.error('Unexpected submit error:', err);
      endWithError('Ocurrió un error inesperado al procesar tu registro.');
    } finally {
      setLoadingRegistration(false);
    }

    // Función auxiliar para terminar con error
    function endWithError(msg) {
      setLoadingRegistration(false);
      showError(msg);
    }
  };

  if (loadingEvent) return <div className="container mt-5 text-center">Cargando detalles del evento...</div>;
  if (errorEvent) return <div className="container mt-5 text-center text-danger">{errorEvent}</div>;
  if (!event) return <div className="container mt-5 text-center">No se encontró el evento.</div>;

  return (
    <>
      <style jsx global>{`
        header {
          background-color: #004080;
          color: white;
          padding: 1rem 2rem;
          text-align: center;
        }
        header h1 {
          font-size: 1.8rem;
        }
        main {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          padding: 2rem;
        }
        .image-container {
          max-width: 100%;
          width: 100%;
          max-width: 900px;
          padding: 1rem;
        }
        .image-container img {
          width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        @media (max-width: 768px) {
          header h1 { font-size: 1.4rem; }
          main { padding: 1rem; }
        }
        @media (max-width: 480px) {
          header h1 { font-size: 1.2rem; }
          .image-container { padding: 0.5rem; }
        }
        body {
          font-family: 'Segoe UI', sans-serif;
          background-color: #f4f6f9;
          margin: 0;
          padding: 0;
          color: #003366;
        }
        .container {
          max-width: 700px;
          margin: 40px auto;
          background-color: #FFFFFF;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #412BFD;
          text-align: center;
          margin-bottom: 10px;
        }
        .intro {
          font-size: 14px;
          margin-bottom: 25px;
          line-height: 1.5;
        }
        label {
          display: block;
          margin-top: 15px;
          font-weight: bold;
        }
        .required {
          color: red;
        }
        input, select {
          width: 100%;
          padding: 10px;
          margin-top: 5px;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-sizing: border-box;
        }
        .social-links {
          margin: 10px 0 20px;
        }
        .social-links a {
          display: inline-block;
          margin-right: 10px;
          color: #412BFD;
          font-weight: bold;
          text-decoration: none;
        }
        button {
          background-color: #FFD400;
          color: #003366;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          margin-top: 20px;
        }
        button:hover {
          background-color: #e5bc00;
        }
        @media (max-width: 768px) {
          .container {
            margin: 20px;
            padding: 20px;
          }
          input, select, button {
            font-size: 14px;
            padding: 10px;
          }
          label {
            font-size: 14px;
          }
          .intro {
            font-size: 13px;
          }
        }
        @media (max-width: 480px) {
          .container {
            margin: 10px;
            padding: 15px;
          }
          .social-links a {
            display: block;
            margin-bottom: 8px;
          }
          button {
            width: 100%;
          }
        }
      `}</style>

      <main>
        <div style={{
          width: '100%',
          height: '250px', /* Altura fija del banner */
          backgroundColor: '#333', /* Color de fondo de respaldo si no hay imagen */
          backgroundImage: 'url("/assets/img/bannerForms.jpg")', /* URL de tu imagen de banner */
          backgroundSize: 'cover', /* Cubre toda el área del banner */
          backgroundPosition: 'center', /* Centra la imagen */
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '2.5em',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          borderRadius: '12px', /* Bordes redondeados para el banner */
          overflow: 'hidden', /* Asegura que la imagen no se desborde */
        }}>
        </div>
      </main>

      <div className="container">
        <h1>{event.titulo}</h1>
        <p className="intro">
          <span dangerouslySetInnerHTML={{ __html: event.descripcion }} />
          <br /><br />
          📅 <strong>Fecha:</strong> {formattedDate}
          <br /><br />
          🕓 <strong>Hora:</strong> {formatTime12Hour(event.hora)}
                    <br /><br />
          🚀 <strong>Evento {event.modalidad?.toLowerCase() === 'en persona' ? 'presencial' : event.modalidad?.toLowerCase()}</strong> 
        </p>

        <form id="registration-form" onSubmit={handleSubmit}>
          <input type="hidden" name="event_id" value={id} />
          <input type="hidden" name="event_name" value={event.titulo} />

          <label>Nombres y Apellidos <span className="required">*</span></label>
          <input name="full_name" required disabled={loadingRegistration} />

          <label>Correo electrónico <span className="required">*</span></label>
          <input name="email" type="email" required disabled={loadingRegistration} />

          <label>DNI o Carnet de extranjería <span className="required">*</span></label>
          <input name="id_document" inputMode="numeric" maxLength="20" required disabled={loadingRegistration} />

          <label>Organización / Universidad <span className="required">*</span></label>
          <input name="organization" required disabled={loadingRegistration} />

          <label>¿Cuál es tu puesto? (Si eres estudiante, indícalo) <span className="required">*</span></label>
          <input name="position" required disabled={loadingRegistration} />

          <label>Si eres estudiante, ¿cuál es tu carrera?</label>
          <input name="major" disabled={loadingRegistration} />

          <label>Número de teléfono (WhatsApp) <span className="required">*</span></label>
          <input
            name="phone_number"
            pattern="\d{9}"
            inputMode="numeric"
            maxLength="9"
            required
            title="Debe ingresar exactamente 9 dígitos"
            disabled={loadingRegistration}
          />

          <label>¿Eres miembro del Student Chapter ACS UNMSM? <span className="required">*</span></label>
          <select name="is_member" required disabled={loadingRegistration}>
            <option value="">Selecciona</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>

          <label>Si respondiste &quot;Sí&quot;, indica tu Member ID (8 dígitos):</label>
          <input name="member_id" maxLength="8" disabled={loadingRegistration} />

          <label>¿Autorizas el uso de imágenes tomadas durante el curso? <span className="required">*</span></label>
          <select name="image_use_content" required disabled={loadingRegistration}>
            <option value="">Selecciona</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>

          <label>¿Nos sigues en redes sociales? <span className="required">*</span></label>
          <div className="social-links">
            🌍 <a href="https://www.facebook.com/profile.php?id=61571451074801" target="_blank" rel="noopener noreferrer">Facebook</a><br />
            📸 <a href="https://www.instagram.com/acs.unmsm.pe/" target="_blank" rel="noopener noreferrer">Instagram</a><br />
            💼 <a href="https://www.linkedin.com/company/unmsmacs/" target="_blank" rel="noopener noreferrer">LinkedIn</a><br />
            💬 <a href="https://whatsapp.com/channel/0029Vb06ZVS42DcioR683m2J" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
          <select name="following_social_media" required disabled={loadingRegistration}>
            <option value="">Selecciona</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>

          <button type="submit" disabled={loadingRegistration}>
            {loadingRegistration ? 'Enviando...' : 'Enviar Registro'}
          </button>
        </form>
      </div>
    </>
  );
}

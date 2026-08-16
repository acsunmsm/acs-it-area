// src/app/[lang]/dashboard/page.js
'use client'

import useAuth from '@/src/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import EventoForm from '../../../components/EventoForm'
import Footer from '../../../components/Footer';
import { supabase } from '@/src/lib/supabaseClient'
import Link from 'next/link';
import EventModal from '../../../components/EventModal';
import Navbar from '../../../components/Navbar'
import UserRegistrationsModal from '../../../components/UserRegistrationsModal';

export default function DashboardPage() {

  // Obtiene la sesión actual y el estado de carga desde el hook
  const { session, loading } = useAuth()
  const router = useRouter()

  // Estados para mostrar/ocultar formularios o modales
  const [showEventForm, setShowEventForm] = useState(false);
  const [showUserRegistrationsModal, setShowUserRegistrationsModal] = useState(false);

  useEffect(() => {
    // Si todavía está cargando la sesión, no hace nada
    if (loading) return;

    // Si no hay sesión activa, redirige al login
    if (!session) {
      console.log('Dashboard: No hay sesión activa. Redirigiendo a /login');
      router.push('/login');
    }
  }, [session, loading, router]);

  // Mientras carga la sesión, muestra un mensaje
  if (loading) {
    return (
      <div className="dashboard-loading">
        Verificando sesión...
      </div>
    );
  }

  // Si no hay sesión, no renderiza nada
  if (!session) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <Navbar />
      <main className="dashboard-content-main"> {/* Renombrado para evitar conflicto con .dashboard-content del modal */}
        <div className="dashboard-card">
          <h1>¡Bienvenido al Dashboard!</h1>
          {session.user && <p>Has iniciado sesión exitosamente como: <strong>{session.user.email}</strong></p>}
          <p className="dashboard-info-text">Este es tu espacio seguro, solo visible para usuarios autenticados.</p>

          <button
            onClick={async () => {
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error('Error al cerrar sesión:', error);
                alert('No se pudo cerrar la sesión. Inténtalo de nuevo.');
              } else {
                console.log('Sesión cerrada. Redirigiendo...');
              }
            }}
            className="btn-logout"
          >
            Cerrar Sesión
          </button>

          {/* CONTENEDOR DE BOTONES DE ACCIÓN */}
          <div className="action-buttons-grid">
            {/* Botón Crear Nuevo Evento */}
            <button
              onClick={() => setShowEventForm(true)}
              className="dashboard-button btn-blue-light"
            >
              <img src="/assets/img/evento_marketing.png" alt="Añadir Evento" className="button-icon" /> {/* Reemplaza con tu icono */}
              Crear Nuevo Evento
            </button>

            {/* 🆕 BOTÓN Ver Usuarios Registrados AHORA ES UN LINK */}
            <Link href={`/${router.query?.lang || 'es'}/dashboard/event-registrations`} passHref legacyBehavior>
              <a className="dashboard-button btn-green">
                <img src="/assets/img/usuarios_registrados.png" alt="Ver Usuarios" className="button-icon" />
                Ver Usuarios Registrados por Evento
              </a>
            </Link>

            {/* Botón Registrar Nuevo Usuario */}
            <Link href="/register" passHref legacyBehavior>
              <a className="dashboard-button btn-blue">
                <img src="/assets/img/agregar_usuario.png" alt="Registrar Usuario" className="button-icon" /> {/* Reemplaza con tu icono */}
                Registrar Nuevo Usuario
              </a>
            </Link>
          </div>

        </div>
      </main>

      <EventModal
        show={showEventForm}
        onClose={() => setShowEventForm(false)}
        title="Crear Nuevo Evento"
      >
        <EventoForm />
      </EventModal>

      <UserRegistrationsModal
        show={showUserRegistrationsModal}
        onClose={() => setShowUserRegistrationsModal(false)}
      />
      <Footer />

      {/* 🆕 ESTILOS CSS PARA LOS BOTONES Y LAYOUT DEL DASHBOARD */}
      <style jsx>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .dashboard-content-main {
          flex-grow: 1; /* Permite que el contenido ocupe el espacio disponible */
          display: flex;
          align-items: center; /* Centra verticalmente */
          justify-content: center; /* Centra horizontalmente */
          padding: 30px; /* Relleno general */
          background-color: #f7f9fc; /* Un fondo suave para el main */
        }

        .dashboard-card {
          text-align: center;
          padding: 40px;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          max-width: 900px; /* Un poco más ancho para los botones */
          width: 100%; /* Ocupa todo el ancho disponible */
          margin: 0 auto; /* Centrar la tarjeta */
          border: 1px solid #e0e6ed;
        }

        .dashboard-card h1 {
          font-size: 2.8em;
          color: #2c3e50;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .dashboard-card p {
          font-size: 1.1em;
          color: #555;
          line-height: 1.6;
        }

        .dashboard-info-text {
          margin-top: 25px;
          font-size: 0.95em;
          color: #777;
          font-style: italic;
        }

        /* Estilo para el botón de Cerrar Sesión */
        .btn-logout {
          margin-top: 30px;
          margin-bottom: 40px; /* Más espacio debajo para los botones de acción */
          padding: 14px 30px;
          background-color: #e74c3c; /* Rojo más vibrante */
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.05em;
          font-weight: 600;
          transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 15px rgba(231, 76, 60, 0.25);
        }

        .btn-logout:hover {
          background-color: #c0392b;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(231, 76, 60, 0.35);
        }

        /* CONTENEDOR DE BOTONES (GRID FLEXIBLE) */
        .action-buttons-grid {
          display: grid; /* Usamos grid para un control preciso */
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* 3 columnas que se ajustan */
          gap: 25px; /* Espacio entre los botones */
          margin-top: 30px; /* Espacio superior */
        }

        /* ESTILO BASE PARA TODOS LOS BOTONES DEL DASHBOARD */
        .dashboard-button {
          padding: 25px 20px; /* Mayor padding para un aspecto más premium */
          border: none;
          border-radius: 10px; /* Bordes más suaves */
          cursor: pointer;
          font-size: 1.1em; /* Un poco más grande */
          font-weight: 600;
          color: white;
          text-decoration: none; /* Para el Link */
          display: flex; /* Para alinear icono y texto */
          align-items: center;
          justify-content: center;
          gap: 12px; /* Espacio entre icono y texto */
          transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
          position: relative; /* Para posibles efectos de hover */
          overflow: hidden; /* Para el efecto de brillo */
          box-shadow: 0 8px 20px rgba(0,0,0,0.1); /* Sombra base */
        }

        /* EFECTO DE HOVER COMÚN */
        .dashboard-button:hover {
          transform: translateY(-5px); /* Elevación */
          box-shadow: 0 12px 25px rgba(0,0,0,0.2); /* Sombra más pronunciada */
        }

        /* EFECTO DE BRILLO (SHINE) AL HOVER */
        .dashboard-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.7s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .dashboard-button:hover::before {
          left: 100%;
        }

        /* ESTILOS DE COLOR PARA CADA BOTÓN */
        .btn-green {
          background-color: #FFC236; /* Verde brillante */
          box-shadow: 0 8px 20px #936f1bff;
        }
        .btn-green:hover {
          background-color: #FFC236; /* Verde más oscuro al hover */
          box-shadow: 0 12px 25px #936f1bff;
        }

        .btn-blue-light {
          background-color: #3498db; /* Azul cielo */
          box-shadow: 0 8px 20px rgba(52, 152, 219, 0.25);
        }
        .btn-blue-light:hover {
          background-color: #2980b9; /* Azul más oscuro al hover */
          box-shadow: 0 12px 25px rgba(52, 152, 219, 0.35);
        }

        .btn-blue {
          background-color: #007bff; /* Azul original de Bootstrap */
          box-shadow: 0 8px 20px rgba(0, 123, 255, 0.25);
        }
        .btn-blue:hover {
          background-color: #0056b3;
          box-shadow: 0 12px 25px rgba(0, 123, 255, 0.35);
        }

        /* Estilo para los iconos dentro de los botones */
        .button-icon {
          width: 32px; /* Tamaño del icono */
          height: 32px;
          object-fit: contain; /* Asegura que la imagen no se recorte */
        }

        /* Media Queries para responsividad */
        @media (max-width: 768px) {
          .dashboard-card {
            padding: 30px 20px;
          }
          .dashboard-card h1 {
            font-size: 2em;
          }
          .action-buttons-grid {
            grid-template-columns: 1fr; /* Una columna en pantallas pequeñas */
            gap: 20px;
          }
          .dashboard-button {
            padding: 20px 15px;
            font-size: 1em;
          }
          .button-icon {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
}
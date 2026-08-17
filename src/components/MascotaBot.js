'use client';

/**
 * MASCOTA BOT — asistente de bienvenida del capítulo (Carbonito, la nutria química)
 *
 * Aparece abajo a la izquierda (la derecha ya la ocupa WhatsApp), saluda
 * según la hora y responde preguntas básicas con respuestas preparadas
 * (por reglas de palabras clave: NO usa IA de pago, es gratis y no necesita
 * servidor).
 *
 * Novedad: Otto CAMBIA DE POSE según lo que pasa en la charla. Hay cuatro
 * dibujos (sin fondo) y cada momento usa el que mejor encaja:
 *
 *   · otto-default   → tranquilo con su tubo de ensayo (reposo y bienvenida)
 *   · otto-explica   → señalando con el dedo (cuando responde algo)
 *   · otto-celebra   → con confeti (saludos y agradecimientos)
 *   · otto-piensa    → mano en la barbilla (cuando no sabe responder)
 *
 * Accesibilidad:
 *   · Todos los textos salen de las traducciones (namespace "mascota").
 *   · Las animaciones se apagan solas con prefers-reduced-motion. En ese
 *     modo la pose SÍ cambia (es información, no movimiento), pero sin el
 *     rebote de transición.
 *   · Se cierra con Escape; los botones tienen etiquetas para lectores de
 *     pantalla.
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Reglas de conversación. Cada una tiene:
 *   · claves    → palabras que disparan la respuesta
 *   · respuesta → clave del texto en las traducciones
 *   · pose      → qué dibujo de Otto mostrar al responder
 *
 * El orden importa: gana la primera que coincida. Los saludos van al final
 * por ser los más genéricos.
 */
const REGLAS = [
  // Sobre la propia mascota (va primero para que "¿quién eres?" no lo capture
  // la regla de "qué es el ACS").
  { respuesta: 'presentacion', pose: 'celebra', claves: ['te llamas', 'tu nombre', 'quien eres', 'quien sos', 'que eres', 'eres tu', 'carbonito', 'mascota'] },
  // Curiosidades y química
  { respuesta: 'curiosidad',   pose: 'explica', claves: ['curiosidad', 'dato', 'sabias', 'elemento', 'tabla periodica', 'molecula', 'reaccion quimica', 'cuentame algo'] },
  { respuesta: 'chiste',       pose: 'celebra', claves: ['chiste', 'broma', 'gracioso', 'risa', 'divierte', 'joke'] },
  // Información práctica del capítulo
  { respuesta: 'redes',        pose: 'explica', claves: ['redes', 'instagram', 'facebook', 'tiktok', 'linkedin', 'siguen', 'sociales', 'social'] },
  { respuesta: 'ubicacion',    pose: 'explica', claves: ['donde estan', 'donde queda', 'ubicaci', 'facultad', 'direccion', 'encuentran', 'where'] },
  { respuesta: 'unirse',       pose: 'explica', claves: ['unir', 'inscrib', 'miembro', 'membre', 'join', 'participar', 'apuntar'] },
  { respuesta: 'eventos',      pose: 'explica', claves: ['evento', 'taller', 'charla', 'actividad', 'event', 'workshop'] },
  { respuesta: 'contacto',     pose: 'explica', claves: ['contact', 'correo', 'email', 'escribir', 'reach'] },
  { respuesta: 'quienes',      pose: 'explica', claves: ['quienes', 'que es', 'acs', 'capitul', 'chapter', 'about'] },
  { respuesta: 'despedida',    pose: 'celebra', claves: ['adios', 'chau', 'chao', 'bye', 'hasta luego', 'nos vemos', 'me voy'] },
  { respuesta: 'animo',        pose: 'celebra', claves: ['dia', 'day', 'como estas', 'que tal', 'how are', 'todo bien', 'cansad'] },
  { respuesta: 'gracias',      pose: 'celebra', claves: ['gracias', 'thanks', 'thank', 'genial', 'bien hecho'] },
  { respuesta: 'saludo',       pose: 'celebra', claves: ['hola', 'hi', 'hey', 'buenas', 'hello', 'saludos'] },
];

const POSE_DEFECTO = 'default';
const POSE_NO_ENTIENDE = 'piensa';

export default function MascotaBot() {
  const t = useTranslations('mascota');

  const [abierto, setAbierto] = useState(false);
  const [bocadillo, setBocadillo] = useState(true);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [pose, setPose] = useState(POSE_DEFECTO); // qué dibujo de Otto se ve
  const finRef = useRef(null);
  const inputRef = useRef(null);

  const saludoHora = () => {
    const h = new Date().getHours();
    if (h < 12) return t('saludoManana');
    if (h < 19) return t('saludoTarde');
    return t('saludoNoche');
  };

  useEffect(() => {
    if (abierto && mensajes.length === 0) {
      setMensajes([{ de: 'bot', texto: `${saludoHora()} ${t('bienvenida')}` }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [mensajes]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setAbierto(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Busca la regla que coincide; devuelve el texto y la pose asociada.
  const responder = (entrada) => {
    const limpio = entrada.toLowerCase();
    const regla = REGLAS.find((r) => r.claves.some((c) => limpio.includes(c)));
    if (regla) return { texto: t(`respuestas.${regla.respuesta}`), pose: regla.pose };
    return { texto: t('noEntiendo'), pose: POSE_NO_ENTIENDE };
  };

  const enviar = (valor) => {
    const msg = (valor ?? texto).trim();
    if (!msg) return;
    setMensajes((prev) => [...prev, { de: 'user', texto: msg }]);
    setTexto('');
    setTimeout(() => {
      const r = responder(msg);
      setMensajes((prev) => [...prev, { de: 'bot', texto: r.texto }]);
      setPose(r.pose); // Otto cambia de expresión
    }, 350);
  };

  const abrir = () => {
    setAbierto(true);
    setBocadillo(false);
    setPose(POSE_DEFECTO);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const SUGERENCIAS = [
    { clave: 'quienes', etiqueta: t('sugerencias.quienes') },
    { clave: 'unirse', etiqueta: t('sugerencias.unirse') },
    { clave: 'eventos', etiqueta: t('sugerencias.eventos') },
    { clave: 'curiosidad', etiqueta: t('sugerencias.curiosidad') },
  ];

  return (
    <div className="mascota-wrap">
      {bocadillo && !abierto && (
        <div className="mascota-bocadillo" role="status">
          {saludoHora()}
          <button
            className="mascota-bocadillo__x"
            onClick={() => setBocadillo(false)}
            aria-label={t('cerrar')}
          >
            ×
          </button>
        </div>
      )}

      {abierto && (
        <div className="mascota-panel" role="dialog" aria-label={t('abrir')}>
          <div className="mascota-panel__cabecera">
            <span className="mascota-panel__nombre">
              <span className="mascota-panel__punto" aria-hidden="true" />
              {t('nombre')}
            </span>
            <button
              className="mascota-panel__cerrar"
              onClick={() => setAbierto(false)}
              aria-label={t('cerrar')}
            >
              ×
            </button>
          </div>

          <div className="mascota-panel__mensajes">
            {mensajes.map((m, i) => (
              <div key={i} className={`mascota-msg mascota-msg--${m.de}`}>
                {m.texto}
              </div>
            ))}

            {mensajes.length <= 1 && (
              <div className="mascota-sugerencias">
                {SUGERENCIAS.map((s) => (
                  <button key={s.clave} onClick={() => enviar(s.etiqueta)}>
                    {s.etiqueta}
                  </button>
                ))}
              </div>
            )}

            <div ref={finRef} />
          </div>

          <form
            className="mascota-panel__entrada"
            onSubmit={(e) => { e.preventDefault(); enviar(); }}
          >
            <input
              ref={inputRef}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={t('placeholder')}
              aria-label={t('placeholder')}
            />
            <button type="submit" aria-label={t('enviar')}>→</button>
          </form>
        </div>
      )}

      {/* ---------- La mascota (cambia de pose) ---------- */}
      <button
        className={`mascota-btn ${abierto ? 'mascota-btn--activo' : ''}`}
        onClick={abrir}
        aria-label={t('abrir')}
      >
        {/* Burbujas que suben del tubo — solo en la pose por defecto,
            que es la única que sostiene el tubo de ensayo. */}
        {pose === 'default' && (
          <span className="mascota-burbujas" aria-hidden="true">
            <i /><i /><i />
          </span>
        )}
        {/*
          key={pose} fuerza a React a remontar la imagen cada vez que
          cambia la pose, y así se dispara la animación de entrada
          (un rebote suave). Sin la key, React reaprovecha el <img> y
          no se anima el cambio.
        */}
        <img
          key={pose}
          src={`/assets/img/otto-${pose}.png`}
          alt={t('nombre')}
          className="mascota-img"
          width={120}
          height={120}
        />
      </button>

      <style jsx>{`
        .mascota-wrap {
          position: fixed;
          left: 20px;
          bottom: 20px;
          z-index: 1500;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }

        .mascota-btn {
          border: none;
          background: transparent;
          padding: 0;
          cursor: pointer;
          position: relative;
          line-height: 0;
          animation: mascota-flota 4s ease-in-out infinite;
          transition: transform 0.25s ease;
          filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.18));
        }
        .mascota-btn:hover { transform: scale(1.06) rotate(-3deg); }
        .mascota-btn:active { transform: scale(0.97); }
        .mascota-btn:focus-visible {
          outline: 3px solid #0054a6;
          outline-offset: 4px;
          border-radius: 12px;
        }

        .mascota-img {
          width: 118px;
          height: auto;
          display: block;
          user-select: none;
          -webkit-user-drag: none;
          /* Rebote al cambiar de pose (gracias a key={pose}) */
          animation: mascota-pose 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes mascota-flota {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }

        @keyframes mascota-pose {
          0%   { opacity: 0; transform: scale(0.8) translateY(6px); }
          60%  { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }

        .mascota-burbujas {
          position: absolute;
          top: 20px;
          right: 18px;
          width: 20px;
          height: 40px;
          pointer-events: none;
        }
        .mascota-burbujas i {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(90, 70, 200, 0.7);
          animation: mascota-burbuja 2.4s ease-in infinite;
        }
        .mascota-burbujas i:nth-child(2) { left: 30%; animation-delay: 0.8s; width: 5px; height: 5px; }
        .mascota-burbujas i:nth-child(3) { left: 65%; animation-delay: 1.5s; width: 6px; height: 6px; }

        @keyframes mascota-burbuja {
          0%   { opacity: 0; transform: translateY(0) scale(0.5); }
          20%  { opacity: 0.9; }
          100% { opacity: 0; transform: translateY(-30px) scale(1.1); }
        }

        .mascota-bocadillo {
          position: relative;
          background: #ffffff;
          color: #1d2b3a;
          border: 1px solid #e0e6ed;
          border-radius: 14px 14px 14px 4px;
          padding: 12px 34px 12px 16px;
          max-width: 240px;
          font-size: 14px;
          line-height: 1.45;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          animation: mascota-aparece 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mascota-bocadillo__x {
          position: absolute;
          top: 4px;
          right: 8px;
          border: none;
          background: transparent;
          font-size: 18px;
          line-height: 1;
          color: #9aa5b1;
          cursor: pointer;
        }

        @keyframes mascota-aparece {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .mascota-panel {
          width: 320px;
          max-width: calc(100vw - 40px);
          height: 420px;
          max-height: calc(100vh - 160px);
          background: #ffffff;
          border: 1px solid #e0e6ed;
          border-radius: 16px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: mascota-aparece 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mascota-panel__cabecera {
          background: #0054a6;
          color: #fff;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .mascota-panel__nombre {
          font-weight: 600;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mascota-panel__punto {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
          animation: mascota-pulso 2s infinite;
        }
        @keyframes mascota-pulso {
          0%   { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.6); }
          70%  { box-shadow: 0 0 0 6px rgba(74, 222, 128, 0); }
          100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
        }
        .mascota-panel__cerrar {
          border: none; background: transparent; color: #fff;
          font-size: 22px; line-height: 1; cursor: pointer;
        }

        .mascota-panel__mensajes {
          flex: 1;
          overflow-y: auto;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #f7f9fc;
        }

        .mascota-msg {
          max-width: 85%;
          padding: 9px 12px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.45;
          white-space: pre-line;
        }
        .mascota-msg--bot {
          background: #eaf1fb;
          color: #1d2b3a;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }
        .mascota-msg--user {
          background: #0054a6;
          color: #fff;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }

        .mascota-sugerencias {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }
        .mascota-sugerencias button {
          background: #fff;
          border: 1px solid #bcd4ee;
          color: #0054a6;
          font-size: 13px;
          padding: 6px 10px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .mascota-sugerencias button:hover { background: #eaf1fb; }

        .mascota-panel__entrada {
          display: flex;
          gap: 8px;
          padding: 10px;
          border-top: 1px solid #e0e6ed;
          background: #fff;
        }
        .mascota-panel__entrada input {
          flex: 1;
          border: 1px solid #d7dee6;
          border-radius: 999px;
          padding: 9px 14px;
          font-size: 14px;
          outline: none;
        }
        .mascota-panel__entrada input:focus { border-color: #0054a6; }
        .mascota-panel__entrada button {
          background: #0054a6;
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 38px; height: 38px;
          font-size: 18px;
          cursor: pointer;
          flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .mascota-img { width: 92px; }
        }

        /* Accesibilidad: sin movimiento (la pose sí cambia, pero sin rebote) */
        @media (prefers-reduced-motion: reduce) {
          .mascota-btn,
          .mascota-img,
          .mascota-burbujas i,
          .mascota-panel__punto,
          .mascota-bocadillo,
          .mascota-panel {
            animation: none !important;
          }
          .mascota-btn:hover { transform: none; }
        }
      `}</style>
    </div>
  );
}

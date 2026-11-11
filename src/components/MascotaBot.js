'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';

function openingGroup(topic, previousTopic) {
  if (topic.startsWith('element-')) return topic === previousTopic ? 'elementFollowup' : 'element';
  if (['ph', 'mole', 'molarity', 'periodic'].includes(topic)) return 'science';
  if (['fact', 'joke'].includes(topic)) return 'fun';
  if (['events', 'news'].includes(topic)) return 'publications';
  if (topic === 'clarify') return 'clarify';
  // These messages already address the visitor in Carbonito's own voice.
  if (['hello', 'identity', 'bye', 'thanks', 'mood', 'unknown'].includes(topic)) return null;
  return 'chapter';
}

export default function MascotaBot() {
  const t = useTranslations('mascota');
  const lang = useLocale();
  const [pending, setPending] = useState(false);
  const activeRequest = useRef(null);
  const context = useRef(null);
  const nextOpening = useRef(new Map());

  const [abierto, setAbierto] = useState(false);
  const [mostrarSaludo, setMostrarSaludo] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [pose, setPose] = useState('default');
  const logRef = useRef(null);
  const latestRef = useRef(null);
  const inputRef = useRef(null);

  const saludoHora = () => {
    const h = new Date().getHours();
    if (h < 12) return t('saludoManana');
    if (h < 19) return t('saludoTarde');
    return t('saludoNoche');
  };

  useEffect(() => {
    const log = logRef.current;
    const latest = latestRef.current;
    if (!log || !latest || mensajes.length <= 1) return;
    // Keep the start of a long reply visible, including its opening line.
    log.scrollTop += latest.getBoundingClientRect().top - log.getBoundingClientRect().top - log.clientTop - parseFloat(getComputedStyle(log).paddingTop);
  }, [mensajes, abierto]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setAbierto(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => () => activeRequest.current?.abort(), []);

  const enviar = async (valor) => {
    const question = (valor ?? texto).trim();
    if (!question || activeRequest.current) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setPending(true);
    setMensajes(prev => [...prev, { de: 'user', texto: question }]);
    setTexto('');
    setPose('piensa');
    try {
      const res = await fetch('/api/carbonito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, lang, previous: context.current }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(24000)])
      });
      if (!res.ok) throw new Error('Chat unavailable');
      const reply = await res.json();
      const group = openingGroup(reply.context.topic, context.current?.topic);
      let replyText = reply.text;
      if (group) {
        const openings = t.raw(`entradas.${group}`);
        const index = nextOpening.current.get(group) ?? 0;
        replyText = `${openings[index]}\n\n${reply.text}`;
        nextOpening.current.set(group, (index + 1) % openings.length);
      }
      if (!['thanks', 'hello', 'mood'].includes(reply.context.topic)) context.current = reply.context;
      const unresolved = reply.context.topic === 'unknown';
      setMensajes(prev => [...prev, { de: 'bot', texto: replyText, links: reply.links, question: unresolved ? question : null }]);
      setPose(reply.pose);
    } catch {
      if (controller.signal.aborted) return;
      setMensajes(prev => [...prev, { de: 'bot', texto: t('errorConexion'), retry: question }]);
      setPose('piensa');
    } finally {
      activeRequest.current = null;
      if (!controller.signal.aborted) setPending(false);
    }
  };

  const abrir = () => {
    if (mensajes.length === 0) {
      setMensajes([{ de: 'bot', texto: `${saludoHora()} ${t('bienvenida')}` }]);
    }
    setAbierto(true);
    setMostrarSaludo(false);
    setPose('default');
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
      {mostrarSaludo && !abierto && (
        <div className="mascota-bocadillo" role="tooltip">
          {saludoHora()}
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

          <div ref={logRef} className="mascota-panel__mensajes" role="log" aria-live="polite">
            {mensajes.map((m, i) => (
              <div key={i} ref={i === mensajes.length - 1 ? latestRef : null} className={`mascota-msg mascota-msg--${m.de}`}>
                {m.texto}
                {m.links?.length > 0 && (
                  <ul className="mascota-fuentes">
                    {m.links.map(link => <li key={link.href}>{m.question ? (
                      <a href={link.href + '#consulta-carbonito'} onClick={() => {
                        try { sessionStorage.setItem('carbonito.contactDraft', m.question); } catch { /* Contact is still available. */ }
                      }}>{t('consultarEquipo')}</a>
                    ) : <a href={link.href}>{link.label}</a>}</li>)}
                  </ul>
                )}
                {m.retry && i === mensajes.length - 1 && <button type="button" disabled={pending} onClick={() => enviar(m.retry)}>{t('reintentar')}</button>}
              </div>
            ))}

            {pending && <div role="status" className="mascota-msg mascota-msg--bot">{t('buscando')}</div>}
            {(mensajes.length <= 1 || mensajes.at(-1)?.question) && !pending && (
              <div className="mascota-sugerencias">
                {SUGERENCIAS.map((s) => (
                  <button key={s.clave} onClick={() => enviar(s.etiqueta)}>
                    {s.etiqueta}
                  </button>
                ))}
              </div>
            )}

          </div>

          <form
            className="mascota-panel__entrada"
            onSubmit={(e) => { e.preventDefault(); enviar(); }}
          >
            <input
              ref={inputRef}
              maxLength={500}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={t('placeholder')}
              aria-label={t('placeholder')}
            />
            <button type="submit" disabled={pending || !texto.trim()} aria-label={t('enviar')}>→</button>
          </form>
        </div>
      )}

      {/* ---------- La mascota (cambia de pose) ---------- */}
      <button
        className={`mascota-btn ${abierto ? 'mascota-btn--activo' : ''}`}
        onClick={abrir}
        onMouseEnter={() => setMostrarSaludo(true)}
        onMouseLeave={() => setMostrarSaludo(false)}
        onFocus={() => setMostrarSaludo(true)}
        onBlur={() => setMostrarSaludo(false)}
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
        <Image
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

        :global(.mascota-img) {
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
          padding: 12px 16px;
          max-width: 240px;
          font-size: 14px;
          line-height: 1.45;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          animation: mascota-aparece 0.4s cubic-bezier(0.16, 1, 0.3, 1);
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

        .mascota-fuentes { padding-left: 1rem; margin: .45rem 0 0; }
        .mascota-fuentes a { color: #3020b6; text-decoration: underline; overflow-wrap: anywhere; }
        .mascota-panel__entrada button:disabled { opacity: .55; }

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
          :global(.mascota-img) { width: 92px; }
        }

        /* Accesibilidad: sin movimiento (la pose sí cambia, pero sin rebote) */
        @media (prefers-reduced-motion: reduce) {
          .mascota-btn,
          :global(.mascota-img),
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

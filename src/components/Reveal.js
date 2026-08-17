'use client';

/**
 * Reveal — animaciones de entrada al hacer scroll.
 *
 * Cómo se usa:
 *
 *   <Reveal>            ...contenido...   </Reveal>   → aparece y sube
 *   <Reveal delay={2}>  ...contenido...   </Reveal>   → entra 2 turnos después
 *   <Reveal variant="scale">  ...  </Reveal>          → además hace un pequeño zoom
 *   <RevealWords as="h1" text="Hola mundo" />         → título palabra por palabra
 *
 * Tres decisiones importantes de este componente:
 *
 * 1. ACCESIBILIDAD. Si la persona configuró su sistema para reducir animaciones
 *    (por vértigo, migrañas o epilepsia fotosensible), no se anima nada. Eso lo
 *    resuelve el CSS con la regla @media (prefers-reduced-motion: reduce).
 *
 * 2. SI EL JAVASCRIPT FALLA, TODO SE VE IGUAL. El contenido es visible por
 *    defecto. Sólo se esconde si un script en el layout confirmó que el
 *    navegador sabe animar. Así nunca queda una página en blanco.
 *
 * 3. SE ANIMA UNA SOLA VEZ. Al entrar en pantalla se anima y se deja de
 *    observar el elemento, para no gastar recursos ni repetir el efecto
 *    cada vez que el usuario sube y baja.
 */

import { useEffect, useRef } from 'react';

// Observa un elemento y le añade la clase "is-visible" cuando entra en pantalla
function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Si el navegador es antiguo y no tiene IntersectionObserver,
    // mostramos el contenido de inmediato en vez de dejarlo invisible.
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // se anima una sola vez
          }
        });
      },
      {
        // rootMargin negativo abajo = espera a que el elemento haya
        // entrado un poco de verdad, no apenas asome por el borde.
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function Reveal({
  children,
  delay = 0,          // 0..8 — cada turno son 90ms
  variant = 'up',     // 'up' | 'scale'
  as: Tag = 'div',
  className = '',
  ...rest
}) {
  const ref = useReveal();
  const clamped = Math.max(0, Math.min(8, delay));

  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      data-reveal-delay={clamped}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * RevealWords — anima un título palabra por palabra.
 *
 * Recibe el texto como string (no como children) porque necesita partirlo.
 * Cada palabra va en un <span>, pero el texto sigue siendo legible para
 * lectores de pantalla y para Google gracias al aria-label del contenedor.
 */
export function RevealWords({
  text = '',
  as: Tag = 'h1',
  className = '',
  startDelay = 0,
  ...rest
}) {
  const ref = useReveal();
  const words = String(text).split(' ').filter(Boolean);

  return (
    <Tag ref={ref} data-reveal-words="" className={className} aria-label={text} {...rest}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden="true"
          className="reveal-word"
          style={{ transitionDelay: `${startDelay + i * 70}ms` }}
        >
          {i > 0 ? ' ' : ''}
          {word}
        </span>
      ))}
    </Tag>
  );
}


export function RevealLetters({
  text = '',
  as: Tag = 'h1',
  className = '',
  startDelay = 0,
  paso = 45,          // milisegundos entre letra y letra
  ...rest
}) {
  const ref = useReveal();
  const letras = String(text).split('');

  return (
    <Tag ref={ref} data-reveal-letters="" className={className} aria-label={text} {...rest}>
      {letras.map((letra, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="reveal-letter"
          style={{ transitionDelay: `${startDelay + (i % 14) * paso}ms` }}
        >
          {/* El espacio se sustituye por uno "duro" para que no se colapse
              al meter cada letra en su propio <span>. */}
          {letra === ' ' ? ' ' : letra}
        </span>
      ))}
    </Tag>
  );
}

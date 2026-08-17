'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/src/i18n/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faGlobe,
  faChevronDown,
  faBars,
  faSignIn,
  faTachometerAlt
} from '@/src/lib/fontawesome';

import useAuth from '@/src/hooks/useAuth';
import CapaAcido from '@/src/components/CapaAcido';


const MARCA_NUEVA = {
  src: '/assets/img/acs-marca-150.png',
  ancho: 175,
  alto: 44,
};

const MARCA_ANTIGUA = {
  src: '/assets/img/DIGITAL-ACSSC-UNMSM-rgb-logo.png',
  ancho: 350,
  alto: 100,
};

function LogoCapitulo({ href }) {
  const marca = USAR_MARCA_NUEVA ? MARCA_NUEVA : MARCA_ANTIGUA;

  return (
    <Link href={href} className="navbar-brand marca-capitulo">
      <Image
        src={marca.src}
        alt="American Chemical Society"
        width={marca.ancho}
        height={marca.alto}
        priority
      
        unoptimized
        className="marca-capitulo__simbolo"
      />

      {USAR_MARCA_NUEVA && (
        <span className="marca-capitulo__texto">
          <span className="marca-capitulo__linea1">Student Chapter</span>
          {}
          <span className="marca-capitulo__linea2">
            Universidad Nacional Mayor de San Marcos
          </span>
          <span className="marca-capitulo__linea2-corta" aria-hidden="true">
            UNMSM
          </span>
        </span>
      )}
    </Link>
  );
}


const SECCIONES = [
  { clave: 'home', ruta: '', efecto: 'efervescente' },
  { clave: 'about', ruta: '/about', efecto: 'indicador' },
  { clave: 'officers', ruta: '/chapters', efecto: 'orbital' },
  { clave: 'events', ruta: '/events', efecto: 'acido' },
  { clave: 'news', ruta: '/news', efecto: 'periodico' },
  { clave: 'resources', ruta: '/resources', efecto: 'tinta' },
  { clave: 'contact', ruta: '/contact', efecto: 'titulacion' },
];

/**
 * ¿Estamos en esta sección?
 *
 * `pathname` viene de next-intl SIN el idioma delante: en /es/events
 * vale '/events'. Por eso se compara contra la ruta a secas.
 *
 * La portada ('') se compara de forma exacta; si no, estaría "activa"
 * en todas las páginas, porque cualquier ruta empieza por ''.
 */
function esSeccionActiva(pathname, ruta) {
  if (ruta === '') return pathname === '/';
  return pathname === ruta || pathname.startsWith(`${ruta}/`);
}


function BloqueNav({ href, efecto, activo, children }) {
  return (
    <li className="nav-item">
      <Link
        href={href}
        className="bloque-nav"
        data-efecto={efecto}
        aria-current={activo ? 'page' : undefined}
      >
        {/* El ácido necesita su capa de líquido dentro del bloque.
            Los demás efectos se dibujan con pseudo-elementos y no
            requieren nada en el HTML. */}
        {efecto === 'acido' && <CapaAcido corta />}
        <span className="bloque-nav__texto">{children}</span>
        {/* La barrita de "estás aquí" es un elemento propio y no un
            ::after, porque cuatro de los seis efectos ya usan ese
            pseudo-elemento para su capa. Ver menu.css. */}
        {activo && <span className="bloque-nav__activo" aria-hidden="true" />}
      </Link>
    </li>
  );
}

export default function Navbar() {
  const router = useRouter(); // Hook para manejar navegación
  const t = useTranslations('navbar'); // Traducciones del namespace "navbar"
  const locale = useLocale(); // Idioma actual
  const pathname = usePathname(); // Ruta actual

  const [showLanguageMenu, setShowLanguageMenu] = useState(false); // Controla visibilidad del menú de idiomas
  const [isCollapsed, setIsCollapsed] = useState(true); // Controla el colapso del navbar (modo móvil)

  const { session, loading: authLoading } = useAuth(); // Hook de autenticación
  const isAuthenticated = !!session; // Booleano: true si el usuario tiene sesión activa

  const toggleNavbar = () => setIsCollapsed(!isCollapsed); // Alterna abrir/cerrar navbar

  //Buscar la manera de evitar que la página se recargue al cambiar el idioma
  const changeLanguage = (newLocale) => {
    // Remover el locale actual del pathname y agregar el nuevo
    router.push(pathname, { locale: newLocale });
    setShowLanguageMenu(false);
  };

  useEffect(() => {
    // Cerrar el menú cuando cambie la ruta
    setIsCollapsed(true);
  }, [pathname]);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-custom fixed-top">
        <div className="container">
          <LogoCapitulo href={`/${locale}`} />

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded={!isCollapsed}
            aria-label="Toggle navigation"
            onClick={toggleNavbar}
          >
            <FontAwesomeIcon icon={faBars} className="text-dark" />
          </button>

          <div
            className={`collapse navbar-collapse justify-content-between ${!isCollapsed ? 'show' : ''}`}
            id="navbarNav"
          >
            <ul className="navbar-nav mx-auto">
              {SECCIONES.map((s) => (
                <BloqueNav
                  key={s.ruta}
                  href={`/${locale}${s.ruta}`}
                  efecto={s.efecto}
                  activo={esSeccionActiva(pathname, s.ruta)}
                >
                  {t(s.clave)}
                </BloqueNav>
              ))}
            </ul>

            <div className="d-flex align-items-center gap-3">
              <a
                href="/webmail"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-icon-link"
              >
                <FontAwesomeIcon icon={faEnvelope} className="nav-icon" />
              </a>

              {!authLoading && isAuthenticated && (
                <Link
                  href={`/${locale}/dashboard`}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: '#28a745',
                    borderColor: '#28a745',
                    color: 'white',
                    padding: '8px 15px',
                    borderRadius: '5px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <FontAwesomeIcon icon={faTachometerAlt} />
                  {t('dashboard')}
                </Link>
              )}

              <div className="dropdown position-relative">
                <button
                  className="btn btn-link dropdown-toggle d-flex align-items-center p-0"
                  type="button"
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  aria-expanded={showLanguageMenu}
                >
                  <FontAwesomeIcon icon={faGlobe} className="me-1" />
                  {locale === 'en' ? '🇺🇸' : '🇪🇸'}
                  <FontAwesomeIcon icon={faChevronDown} className="ms-1" />
                </button>

                <div
                  className={`dropdown-menu ${showLanguageMenu ? 'show' : ''}`}
                  style={{
                    minWidth: 'auto',
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    zIndex: 1000,
                  }}
                >
                  <button 
                    className="dropdown-item d-flex align-items-center py-2" 
                    onClick={() => changeLanguage('en')}
                  >
                    <span className="me-2">🇺🇸</span> {t('english')}
                  </button>
                  <button 
                    className="dropdown-item d-flex align-items-center py-2" 
                    onClick={() => changeLanguage('es')}
                  >
                    <span className="me-2">🇪🇸</span> {t('spanish')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Tus estilos CSS existentes */}
      <style jsx>{`
        .nav-icon {
          font-size: 20px;
          color: rgb(79, 79, 79);
          transition: all 0.2s ease;
        }
        .nav-icon-link:hover .nav-icon {
          color: #0054a6;
          transform: scale(1.1);
        }
        .dropdown-toggle {
          color: #333;
          text-decoration: none;
          padding: 8px;
        }
        .dropdown-toggle:after {
          display: none;
        }
        .dropdown-toggle:hover {
          color: #0054a6;
        }
        .dropdown-menu {
          border: none;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        .dropdown-item {
          font-size: 14px;
          padding: 8px 16px;
          cursor: pointer;
        }
        .dropdown-item:hover {
          background-color: #f0f5ff;
          color: #0054a6;
        }
        .btn-primary:hover {
          background-color: #0056b3 !important;
          border-color: #0056b3 !important;
        }
        .btn-primary[style*="background-color: rgb(40, 167, 69)"]:hover {
          background-color: #218838 !important;
          border-color: #1e7e34 !important;
        }
      `}</style>
    </>
  );
}



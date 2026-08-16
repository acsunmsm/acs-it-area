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
import BootstrapJS from './BootstrapJS';

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
      <BootstrapJS />
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-custom fixed-top">
        <div className="container">
          <Link href={`/${locale}`} className="navbar-brand py-2">
            <Image
              src="/assets/img/DIGITAL-ACSSC-UNMSM-rgb-logo.png"
              alt="Logo"
              width={250}
              height={71}
              priority
            />
          </Link>

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
            <ul className="navbar-nav me-auto ms-lg-4" style={{ gap: '0.5rem', position: 'relative', zIndex: 10 }}>
              <li className="nav-item">
                <Link href={`/${locale}`} className={`nav-link nav-link-custom ${pathname === `/${locale}` || pathname === '/' ? 'active-link' : ''}`}>{t('home')}</Link>
              </li>
              <li className="nav-item">
                <Link href={`/${locale}/about`} className={`nav-link nav-link-custom ${pathname.includes('/about') ? 'active-link' : ''}`}>{t('about')}</Link>
              </li>
              <li className="nav-item">
                <Link href={`/${locale}/chapters`} className={`nav-link nav-link-custom ${pathname.includes('/chapters') ? 'active-link' : ''}`}>{t('officers')}</Link>
              </li>
              <li className="nav-item">
                <Link href={`/${locale}/events`} className={`nav-link nav-link-custom ${pathname.includes('/events') ? 'active-link' : ''}`}>{t('events')}</Link>
              </li>
              <li className="nav-item">
                <Link href={`/${locale}/news`} className={`nav-link nav-link-custom ${pathname.includes('/news') ? 'active-link' : ''}`}>{t('news')}</Link>
              </li>
              <li className="nav-item">
                <Link href={`/${locale}/resources`} className={`nav-link nav-link-custom ${pathname.includes('/resources') ? 'active-link' : ''}`}>{t('resources')}</Link>
              </li>
              <li className="nav-item">
                <Link href={`/${locale}/contact`} className={`nav-link nav-link-custom ${pathname.includes('/contact') ? 'active-link' : ''}`}>{t('contact')}</Link>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-3" style={{ position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
              <a
                href="/webmail"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-icon-link"
                style={{ pointerEvents: 'auto' }}
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
                    whiteSpace: 'nowrap',
                    pointerEvents: 'auto'
                  }}
                >
                  <FontAwesomeIcon icon={faTachometerAlt} />
                  {t('dashboard')}
                </Link>
              )}

              <div className="dropdown position-relative" style={{ pointerEvents: 'auto' }}>
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
          color: #412BFD;
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
          color: #412BFD;
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
          color: #412BFD;
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
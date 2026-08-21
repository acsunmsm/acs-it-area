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

export default function Navbar() {
  const router = useRouter(); // Hook para manejar navegaciÃ³n
  const t = useTranslations('navbar'); // Traducciones del namespace "navbar"
  const locale = useLocale(); // Idioma actual
  const pathname = usePathname(); // Ruta actual

  const [showLanguageMenu, setShowLanguageMenu] = useState(false); // Controla visibilidad del menÃº de idiomas
  const [isCollapsed, setIsCollapsed] = useState(true); // Controla el colapso del navbar (modo mÃ³vil)

  const { session, loading: authLoading } = useAuth(); // Hook de autenticaciÃ³n
  const isAuthenticated = !!session; // Booleano: true si el usuario tiene sesiÃ³n activa

  const toggleNavbar = () => setIsCollapsed(!isCollapsed); // Alterna abrir/cerrar navbar

  //Buscar la manera de evitar que la pÃ¡gina se recargue al cambiar el idioma
  const changeLanguage = (newLocale) => {
    // Remover el locale actual del pathname y agregar el nuevo
    router.push(pathname, { locale: newLocale });
    setShowLanguageMenu(false);
  };

  useEffect(() => {
    // Cerrar el menÃº cuando cambie la ruta
    setIsCollapsed(true);
  }, [pathname]);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-custom fixed-top">
        <div className="container d-flex flex-wrap align-items-center justify-content-between">
          {/* Spacer to center logo on mobile */}
          <div className="d-lg-none" style={{ width: '56px' }}></div>
          <Link href={`/${locale}`} className="navbar-brand py-2 mx-auto mx-lg-0 text-center">
            <Image
              src="/assets/img/LogoB.png"
              alt="Logo"
              width={250}
              height={71}
              quality={100}
              unoptimized
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
            <ul className="navbar-nav me-auto ms-lg-4" style={{ gap: '0.5rem' }}>
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

    </>
  );
}



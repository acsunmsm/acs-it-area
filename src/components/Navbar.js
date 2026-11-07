'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/src/i18n/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChevronDown, faEnvelope, faGlobe, faTachometerAlt } from '@/src/lib/fontawesome';
import useAuth from '@/src/hooks/useAuth';

const primaryLinks = [
  ['/', 'home'],
  ['/chapters', 'officers'],
  ['/events', 'events'],
  ['/news', 'news'],
  ['/resources', 'resources'],
];

export default function Navbar() {
  const t = useTranslations('navbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { session, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef(null);
  const languageRef = useRef(null);

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 12);
    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true });
    return () => window.removeEventListener('scroll', updateScrolled);
  }, []);

  useEffect(() => {
    if (!languageOpen) return;

    const closeOutside = event => {
      if (!languageRef.current?.contains(event.target)) setLanguageOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [languageOpen]);

  function navLink(href, label, icon) {
    const current = pathname === href ? 'page'
      : href !== '/' && pathname.startsWith(href + '/') ? 'location' : undefined;

    return (
      <Link
        key={href}
        href={href}
        className="chapter-nav__link"
        aria-current={current}
        onClick={() => setMenuOpen(false)}
      >
        {icon && <FontAwesomeIcon icon={icon} />}
        <span>{t(label)}</span>
      </Link>
    );
  }

  function changeLanguage(newLocale) {
    setLanguageOpen(false);
    setMenuOpen(false);
    if (newLocale !== locale) {
      router.push(pathname + window.location.search + window.location.hash, { locale: newLocale });
    }
  }

  return (
    <header
      className="chapter-nav"
      data-scrolled={scrolled}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setMenuOpen(false);
          setLanguageOpen(false);
        }
      }}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          if (languageOpen) {
            setLanguageOpen(false);
            languageRef.current?.querySelector('button')?.focus();
          } else if (menuOpen) {
            setMenuOpen(false);
            toggleRef.current?.focus();
          }
        }
      }}
    >
      <div className="chapter-nav__utility">
        <div className="chapter-nav__inner">
          <nav className="chapter-nav__secondary" aria-label={t('institutionalNav')}>
            {navLink('/about', 'about')}
            {navLink('/contact', 'contact')}
          </nav>
          <div className="chapter-nav__tools">
            {!loading && session && navLink('/dashboard', 'dashboard', faTachometerAlt)}
            <a className="chapter-nav__mail" href="/webmail" target="_blank" rel="noopener noreferrer" aria-label={t('webmail')} title={t('webmail')}>
              <FontAwesomeIcon icon={faEnvelope} />
            </a>
            <div ref={languageRef} className="chapter-nav__language">
              <button
                type="button"
                className="chapter-nav__language-trigger"
                aria-label={t('language')}
                aria-expanded={languageOpen}
                aria-controls="chapter-language-menu"
                onClick={() => setLanguageOpen(open => !open)}
              >
                <FontAwesomeIcon icon={faGlobe} />
                <span>{locale.toUpperCase()}</span>
                <FontAwesomeIcon icon={faChevronDown} />
              </button>
              {languageOpen && (
                <div id="chapter-language-menu" className="chapter-nav__language-menu">
                  {['es', 'en'].map(language => (
                    <button
                      key={language}
                      type="button"
                      className="chapter-nav__language-option"
                      aria-current={locale === language ? 'true' : undefined}
                      onClick={() => changeLanguage(language)}
                    >
                      {language === 'es' ? t('spanish') : t('english')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="chapter-nav__main">
        <div className="chapter-nav__inner">
          <Link href="/" className="chapter-nav__brand" aria-label={`ACS UNMSM · ${t('home')}`} onClick={() => setMenuOpen(false)}>
            <span className="chapter-nav__logo" aria-hidden="true" />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="chapter-nav__toggle"
            aria-label={t('primaryNav')}
            aria-expanded={menuOpen}
            aria-controls="chapter-primary-nav"
            onClick={() => setMenuOpen(open => !open)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          <nav id="chapter-primary-nav" className="chapter-nav__primary" data-open={menuOpen} aria-label={t('primaryNav')}>
            {primaryLinks.map(([href, label]) => navLink(href, label))}
          </nav>
        </div>
      </div>
    </header>
  );
}

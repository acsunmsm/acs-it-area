// Este componente Footer muestra la sección inferior de la página. 
'use client';

// Usa `next-intl` para traducir textos (títulos, descripciones y mensajes) 
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname, Link } from '@/src/i18n/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInstagram,
  faFacebookF,
  faLinkedinIn,
  faWhatsapp,
} from '@/src/lib/fontawesome';

export default function Footer() {
  const t = useTranslations('footer');

  const year = new Date().getFullYear();

  return (
    <footer className="footer-acs">
      <div className="footer-acs-container">

        {/* Main Grid: Identity & Links */}
        <div className="footer-acs-grid">

          {/* Column 1: Identity & Contact */}
          <div className="footer-acs-col-main">
            <img src="/assets/img/Whitelogo.svg" alt="ACS UNMSM" className="footer-acs-logo" />

            <div className="footer-acs-contact">
              <p>acs@unmsm.edu.pe</p>
              <p>Facultad de Química e Ingeniería Química, UNMSM<br />Lima, Perú</p>
            </div>

            <div className="footer-acs-socials">
              <a
                href="https://www.facebook.com/profile.php?id=61571451074801"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-acs-social-link"
              >
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a
                href="https://instagram.com/acs.unmsm.pe"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-acs-social-link"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a
                href="https://www.linkedin.com/company/unmsmacs"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-acs-social-link"
              >
                <FontAwesomeIcon icon={faLinkedinIn} />
              </a>
              <a
                href="https://whatsapp.com/channel/0029Vb06ZVS42DcioR683m2J"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-acs-social-link"
              >
                <FontAwesomeIcon icon={faWhatsapp} />
              </a>
            </div>
          </div>

          {/* Column 2: Get to Know Us */}
          <div className="footer-acs-col-links">
            <h3 className="footer-acs-col-title">{t('getToKnowUs')}</h3>
            <ul className="footer-acs-links-list">
              <li><Link href="/">{t('home')}</Link></li>
              <li><Link href="/about">{t('about')}</Link></li>
              <li><Link href="/chapters">{t('officers')}</Link></li>
              <li><Link href="/contact">{t('contact')}</Link></li>
            </ul>
          </div>

          {/* Column 3: Get Involved */}
          <div className="footer-acs-col-links">
            <h3 className="footer-acs-col-title">{t('getInvolved')}</h3>
            <ul className="footer-acs-links-list">
              <li><Link href="/events">{t('events')}</Link></li>
              <li><Link href="/news">{t('news')}</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright */}
        <div className="footer-acs-bottom">
          <div className="footer-acs-copyright">
            {t('copyright', { year })}
          </div>
        </div>

      </div>
    </footer>
  );
}
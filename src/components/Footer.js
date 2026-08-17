// Este componente Footer muestra la sección inferior de la página. 
'use client';

// Usa `next-intl` para traducir textos (títulos, descripciones y mensajes) 
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/src/i18n/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInstagram, 
  faFacebookF, 
  faLinkedinIn 
} from '@/src/lib/fontawesome';

export default function Footer() {
  const t = useTranslations('footer');

  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-bg"></div>
      
      <div className="footer-container">
        <h1 className="footer-title">{t('title')}</h1>
        <p className="footer-description">{t('description1')}</p>
        <p className="footer-description">{t('description2')}</p>

        <div className="footer-divider">
          <div className="footer-dots">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="footer-dot"></div>
            ))}
          </div>
        </div>

        <p className="footer-follow">{t('follow')}</p>

        <div className="footer-social-icons">
          <a 
            href="https://instagram.com/acs.unmsm.pe" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-social-link"
          >
            <div className="footer-social-icon-container">
              <FontAwesomeIcon 
                icon={faInstagram} 
                className="footer-social-icon"
              />
            </div>
          </a>
          <a 
            href="https://www.facebook.com/profile.php?id=61571451074801" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-social-link"
          >
            <div className="footer-social-icon-container">
              <FontAwesomeIcon 
                icon={faFacebookF} 
                className="footer-social-icon"
              />
            </div>
          </a>
          <a 
            href="https://www.linkedin.com/company/unmsmacs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-social-link"
          >
            <div className="footer-social-icon-container">
              <FontAwesomeIcon 
                icon={faLinkedinIn} 
                className="footer-social-icon"
              />
            </div>
          </a>
        </div>
        
        <div className="footer-copyright">
          <p>{t('copyright', { year })}</p>
        </div>
      </div>
    </footer>
  );
}
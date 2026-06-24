'use client';
import { useEffect } from 'react';
import Script from 'next/script';
import { useTranslations, useLocale } from 'next-intl';

export default function WhatsAppButton() {
  const t = useTranslations('whatsAppButton');

  useEffect(() => {
    // Función para inicializar el plugin cuando todos los scripts estén cargados
    const initWhatsAppPlugin = () => {
      if (window.$ && window.$.fn.whatsappChatSupport) {
        $('#button-w').whatsappChatSupport({
          defaultMsg: '',
        });
      } else {
        console.error('WhatsApp Chat Support plugin no está disponible');
      }
    };

    // Verificar si jQuery ya está cargado
    if (window.$) {
      initWhatsAppPlugin();
    } else {
      // Escuchar evento personalizado cuando jQuery esté listo
      document.addEventListener('jquery-loaded', initWhatsAppPlugin);
    }

    return () => {
      document.removeEventListener('jquery-loaded', initWhatsAppPlugin);
    };
  }, []);

  return (
    <>
      {/* Scripts en orden de dependencia */}
      <Script 
        src="/plugin/components/jQuery/jquery-1.11.3.min.js" 
        strategy="afterInteractive"
        onLoad={() => document.dispatchEvent(new Event('jquery-loaded'))}
      />
      <Script 
        src="/plugin/components/moment/moment.min.js" 
        strategy="afterInteractive"
      />
      <Script 
        src="/plugin/components/moment/moment-timezone-with-data.min.js" 
        strategy="afterInteractive"
      />
      <Script 
        src="/plugin/whatsapp-chat-support.js" 
        strategy="lazyOnload"
        onLoad={() => {
          if (window.$) {
            $('#button-w').whatsappChatSupport({
              defaultMsg: '',
            });
          }
        }}
      />

      {/* Estructura del botón */}
      <div className="whatsapp_chat_support wcs_fixed_right" id="button-w">
        <div className="wcs_button_label">{t('contactUs')}</div>
        <div className="wcs_button wcs_button_circle">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp"
            width={50}
            height={50}
          />
        </div>

        <div className="wcs_popup">
          <div className="wcs_popup_close">
            <span className="fa fa-close"></span>
          </div>
          <div className="wcs_popup_header">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.5 3.42 1.46 4.91l-1.5 5.57 5.66-1.47c1.45.79 3.08 1.21 4.3 1.21 5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zm0 18.1c-1.24 0-2.43-.3-3.48-.89l-.25-.15-2.58.67.68-2.52-.17-.27c-.66-1.07-1.01-2.3-1.01-3.6 0-4.5 3.67-8.19 8.19-8.19 2.2 0 4.2.86 5.73 2.39s2.39 3.53 2.39 5.73c0 4.5-3.67 8.19-8.19 8.19zm4.52-6.16c-.25-.12-.87-.43-.99-.47-.12-.05-.25-.06-.36.06s-.47.47-.57.59-.2.12-.36.06c-.12-.06-.5-.18-1.02-.63-.4-.36-.67-.6-1.05-1.26-.38-.66-.04-.6-.27-.83s-.2-.43-.09-.63c.1-.2.25-.47.34-.63.09-.16.05-.3-.02-.43s-.36-.87-.49-1.2c-.12-.32-.25-.27-.36-.27h-.3c-.12 0-.3.05-.47.25s-.63.6-.63 1.46c0 .86.65 1.69.74 1.81s1.28 1.95 3.1 2.76c.48.2.86.32 1.15.4c.48.12.63.1.86.06s.9-.38 1.02-.75c.12-.36.12-.67.09-.75s-.12-.12-.25-.18z"/>
            </svg>
            <strong>  {t('secretary')}</strong>
            <div className="wcs_popup_header_description">
                {t('message')}
            </div>
          </div>
          <div className="wcs_popup_input" data-number="51994756667">
            <input  type="text" placeholder={t('messagePlaceholder')}/>
            <i className="fa fa-play"></i>
          </div>
          <div className="wcs_popup_avatar">
            <img
              src="https://cdn.pixabay.com/photo/2022/03/01/08/11/call-center-7040784_1280.png"
              alt=""
            />
          </div>
        </div>
      </div>
    </>
  );
}
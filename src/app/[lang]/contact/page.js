'use client';

import { useState } from 'react';
import Header from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Script from 'next/script';
import Reveal, { RevealWords } from '@/src/components/Reveal';
import BotonAcido from '@/src/components/BotonAcido';
import { useTranslations, useLocale } from 'next-intl';

export default function ContactPage() {
  const t = useTranslations('contact');
  const [status, setStatus] = useState(null); // para mostrar mensajes

  const handleSubmit = async (e) => {
    e.preventDefault(); // evita recargar la página

    const form = e.target;
    const formData = new FormData(form); // recoge los datos del formulario

    if (typeof grecaptcha === 'undefined') {
      setStatus('Error: reCAPTCHA no está listo.');
      return;
    }

    const captcha = grecaptcha.getResponse();

    if (!captcha) {
      setStatus('Por favor, completa el CAPTCHA.'); // valida captcha
      return;
    }

    try {
      // envía los datos al backend
      const res = await fetch('/contact/api', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('¡Mensaje enviado exitosamente!'); // mensaje de éxito
        form.reset(); // limpia formulario
        grecaptcha.reset(); // reinicia el captcha
      } else {
        setStatus(data.error || 'Error al enviar el mensaje.'); // error del servidor
      }
    } catch (err) {
      setStatus('Error de red al enviar el formulario.'); // error de conexión
    }
  };

  return (
    <>
      <Header />

      <section className="contact-section section pb-5 fondo-molecular" style={{ marginTop: '-76px', paddingTop: 'calc(76px + 3rem)' }}>
        <div className="container">
          <RevealWords as="h1" text={t('title')} className="text-center" />
          <Reveal delay={1} className="contact-form mt-4">
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <input
                id="name"
                type="text"
                name="name"
                placeholder={t('form.name')}
                required
                className="form-control"
              />
              <input
                id="email"
                type="email"
                name="email"
                placeholder={t('form.email')}
                required
                className="form-control"
              />
              <input
                id="subject"
                type="text"
                name="subject"
                placeholder={t('form.subject')}
                required
                className="form-control"
              />
              <textarea
                id="message"
                name="message"
                placeholder={t('form.message')}
                required
                className="form-control"
                rows={3}
              />
              <div
                className="g-recaptcha d-flex justify-content-center"
                data-sitekey="6LfEtTYtAAAAAJ3lT83NkLxmvPsGpsgPAI-Uqr98"
              ></div>
              <div className="d-flex justify-content-center">
                <BotonAcido id="submit-btn" type="submit" color="azul">
                  {t('form.submit')}
                </BotonAcido>
              </div>
              {status && (
                <p className="text-center mt-3" style={{ color: status.includes('¡') ? 'green' : 'red' }}>
                  {status}
                </p>
              )}
            </form>
          </Reveal>
        </div>
      </section>

      <Footer />

      {/* Google reCAPTCHA Script */}
      <Script src="https://www.google.com/recaptcha/api.js" async defer />
    </>
  );
}
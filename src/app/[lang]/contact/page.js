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
    const formData = new FormData(form);

    if (typeof grecaptcha === 'undefined') {
      setStatus('Error: reCAPTCHA no está listo.');
      return;
    }

    const captcha = grecaptcha.getResponse();

    if (!captcha) {
      setStatus('Por favor, completa el CAPTCHA.');
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('¡Mensaje enviado exitosamente!');
        form.reset();
        grecaptcha.reset();
      } else {
        setStatus(data.error || 'Error al enviar el mensaje.');
      }
    } catch (err) {
      setStatus('Error de red al enviar el formulario.');
    }
  };

  return (
    <>
      <Header />

      {/* Banner Principal */}
      <section className="contact-banner">
        <div className="w-100 d-flex align-items-end justify-content-start" style={{ height: '100%', padding: '0 0 30px 40px' }}>
          <h1 className="banner-title mb-0">Contacto</h1>
        </div>
      </section>

      <section className="contact-section section">
        <div className="container position-relative">
          <Reveal delay={0.5}>
            <div className="row align-items-center">
              <div className="col-lg-5 mb-5 mb-lg-0 text-start">
                <h2 style={{ color: 'var(--color-primary-dark)', fontWeight: '800', fontSize: '3rem', marginBottom: '1rem' }}>
                  {t('title')}
                </h2>
                <p className="text-muted mb-5" style={{ fontSize: '1.1rem' }}>
                  {t('subtitle') || 'Nos encantaría saber de ti. Envíanos un mensaje y te responderemos pronto.'}
                </p>

                <div className="d-flex align-items-center mb-4">
                  <div className="icon-box me-3">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <h5 className="mb-1" style={{ fontWeight: '700', color: 'var(--color-primary)' }}>Email</h5>
                    <p className="mb-0 text-muted">acs.unmsm@gmail.com</p>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <div className="icon-box me-3">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <h5 className="mb-1" style={{ fontWeight: '700', color: 'var(--color-primary)' }}>Ubicación</h5>
                    <p className="mb-0 text-muted">Facultad de Química e Ingeniería Química, UNMSM</p>
                  </div>
                </div>
              </div>

              <div className="col-lg-7">
                <div className="contact-form-simple p-4 p-md-5">
                  <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <input
                          id="name"
                          type="text"
                          name="name"
                          placeholder={t('form.name')}
                          required
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          id="email"
                          type="email"
                          name="email"
                          placeholder={t('form.email')}
                          required
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <input
                          id="phone"
                          type="tel"
                          name="phone"
                          placeholder={t('form.phone') || 'Teléfono (opcional)'}
                          className="form-control"
                        />
                      </div>
                    </div>
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
                      rows={4}
                    />
                    <div
                      className="g-recaptcha d-flex justify-content-center my-2"
                      data-sitekey="6LfEtTYtAAAAAJ3lT83NkLxmvPsGpsgPAI-Uqr98"
                    ></div>
                    <div className="d-flex justify-content-center mt-4">
                      <button id="submit-btn" type="submit" className="btn-modern-submit w-100">
                        <span>{t('form.submit')}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ms-2">
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                      </button>
                    </div>
                    {status && (
                      <p className="text-center mt-3 mb-0" style={{ color: status.includes('¡') ? '#4ade80' : '#f87171', fontWeight: '500' }}>
                        {status}
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />

      {/* Google reCAPTCHA Script */}
      <Script src="https://www.google.com/recaptcha/api.js" async defer />
    </>
  );
}
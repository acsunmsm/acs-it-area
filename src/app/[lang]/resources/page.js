'use client';

import { useState } from 'react';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import Reveal, { RevealLetters } from '@/src/components/Reveal';
import { useTranslations } from 'next-intl';

const RECURSOS = [
  { id: 'pubchem', categoria: 'bases', url: 'https://pubchem.ncbi.nlm.nih.gov/' },
  { id: 'nist', categoria: 'bases', url: 'https://webbook.nist.gov/chemistry/' },
  { id: 'sds', categoria: 'bases', url: 'https://pubchem.ncbi.nlm.nih.gov/#query=safety%20data%20sheet' },
  { id: 'chemdraw', categoria: 'herramientas', url: 'https://molview.org/' },
  { id: 'acsPubs', categoria: 'revistas', url: 'https://pubs.acs.org/' },
  { id: 'rsc', categoria: 'revistas', url: 'https://www.rsc.org/' },
  { id: 'becas', categoria: 'formacion', url: 'https://www.acs.org/education/students/college.html' },
  { id: 'ceviche', categoria: 'formacion', url: null },
];

const ORDEN_CATEGORIAS = ['bases', 'herramientas', 'revistas', 'formacion'];

export default function ResourcesPage() {
  const t = useTranslations('resources');
  const [filtro, setFiltro] = useState('todas');

  return (
    <main className="tema-biblioteca">
      <Navbar />

      {/* ---------- Cabecera ---------- */}
      <section className="fondo-papel pb-4" style={{ marginTop: '-76px', paddingTop: 'calc(76px + 3rem)' }}>
        <div className="container text-center">
          <Reveal className="estante" aria-hidden="true">
            <span /><span /><span /><span /><span /><span />
          </Reveal>

          <RevealLetters
            as="h1"
            text={t('title')}
            className="display-4 fw-bold mb-3"
            style={{ color: 'var(--tema-tinta)' }}
          />

          <Reveal as="p" delay={1} className="lead mx-auto mb-4" style={{ maxWidth: '640px', color: 'var(--tema-suave)' }}>
            {t('intro')}
          </Reveal>

          {/* Filtros */}
          <Reveal delay={1.5} className="d-flex justify-content-center flex-wrap gap-2 mb-4">
            <button 
              onClick={() => setFiltro('todas')}
              className={`btn rounded-pill px-4 ${filtro === 'todas' ? 'btn-dark' : 'btn-outline-dark'}`}
              style={{ fontWeight: 600 }}
            >
              Todos
            </button>
            {ORDEN_CATEGORIAS.map(cat => (
              <button 
                key={cat}
                onClick={() => setFiltro(cat)}
                className={`btn rounded-pill px-4 ${filtro === cat ? 'btn-dark' : 'btn-outline-dark'}`}
                style={{ fontWeight: 600 }}
              >
                {t(`categorias.${cat}`)}
              </button>
            ))}
          </Reveal>

          <Reveal
            delay={2}
            className="mx-auto"
            style={{
              maxWidth: '640px',
              fontSize: '0.9rem',
              color: 'var(--tema-suave)',
              border: '1px dashed rgba(138, 109, 59, 0.5)',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
            }}
          >
            {t('aviso')}
          </Reveal>
        </div>
      </section>

      {/* ---------- Fichas ---------- */}
      <section className="pb-5 fondo-papel">
        <div className="container">
          {ORDEN_CATEGORIAS.map((categoria) => {
            if (filtro !== 'todas' && filtro !== categoria) return null;
            
            const delCategoria = RECURSOS.filter((r) => r.categoria === categoria);
            if (delCategoria.length === 0) return null;

            return (
              <div key={categoria} className="mb-5">
                <Reveal
                  as="h2"
                  className="h4 fw-bold mb-4"
                  style={{
                    color: 'var(--tema-acento)',
                    borderBottom: '2px solid rgba(138, 109, 59, 0.3)',
                    paddingBottom: '0.5rem',
                  }}
                >
                  {t(`categorias.${categoria}`)}
                </Reveal>

                <div className="row g-4">
                  {delCategoria.map((recurso, idx) => (
                    <Reveal
                      key={recurso.id}
                      delay={idx % 3}
                      className="col-md-6 col-lg-4"
                    >
                      <article className="ficha-recurso">
                        <span className="ficha-recurso__etiqueta">
                          {t(`categorias.${categoria}`)}
                        </span>

                        <h3 className="ficha-recurso__titulo">
                          {t(`fichas.${recurso.id}.titulo`)}
                        </h3>

                        <p className="ficha-recurso__texto">
                          {t(`fichas.${recurso.id}.texto`)}
                        </p>

                        {recurso.url && (
                          <a
                            className="ficha-recurso__enlace"
                            href={recurso.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {t('visitar')} →
                          </a>
                        )}
                      </article>
                    </Reveal>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}

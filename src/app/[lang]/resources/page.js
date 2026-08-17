import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import Reveal, { RevealLetters } from '@/src/components/Reveal';
import { getTranslations } from 'next-intl/server';

/**
 * RECURSOS — /es/resources
 *
 * La sección "biblioteca" del capítulo. Es la primera página que
 * estrena un tema propio (ver src/assets/styles/temas.css):
 *
 *   · Beige de papel en lugar del blanco del resto de la web
 *   · Tinta marrón, no azul
 *   · Renglones muy tenues de fondo, como los de un cuaderno
 *   · Las fichas se desplazan a la DERECHA al pasar el ratón, como
 *     al sacar una ficha de un fichero de catálogo — no rebotan
 *     hacia arriba como las tarjetas de Eventos
 *
 * El movimiento aquí es más corto y más lento que en Eventos, a
 * propósito: una biblioteca es un sitio donde se consulta con calma.
 * El contraste entre secciones es lo que hace que cada una tenga
 * carácter propio; si todas se movieran igual, no habría concepto.
 *
 * Es una página de SERVIDOR: no necesita interactividad, así que
 * llega al navegador ya hecha. Google la lee entera y carga rápido.
 */

// Los recursos se declaran aquí, en un solo sitio. Para añadir uno,
// se añade una entrada a esta lista y sus textos a los dos JSON de
// messages/. El `id` es la clave que se busca en las traducciones.
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

export default async function ResourcesPage({ params }) {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: 'resources' });

  return (
    <main className="tema-biblioteca">
      <Navbar />

      {/* ---------- Cabecera ---------- */}
      <section className="py-5 fondo-papel">
        <div className="container text-center" style={{ paddingTop: '1rem' }}>
          {/* Seis lomos de libro que "respiran" muy despacio.
              Es el equivalente en biblioteca al átomo girando de Eventos:
              el mismo papel, distinto concepto. */}
          <Reveal className="estante" aria-hidden="true">
            <span /><span /><span /><span /><span /><span />
          </Reveal>

          <RevealLetters
            as="h1"
            text={t('title')}
            className="display-4 fw-bold mb-3"
            style={{ color: 'var(--tema-tinta)' }}
          />

          <Reveal as="p" delay={1} className="lead mx-auto" style={{ maxWidth: '640px', color: 'var(--tema-suave)' }}>
            {t('intro')}
          </Reveal>

          <Reveal delay={2} className="separador-enlace" aria-hidden="true">
            <span />
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

      {/* ---------- Fichas, agrupadas por categoría ---------- */}
      <section className="pb-5 fondo-papel">
        <div className="container">
          {ORDEN_CATEGORIAS.map((categoria) => {
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
                      /* El retraso se reinicia cada 3 elementos. En una
                         lista larga, la última ficha tardaría más de un
                         segundo y la página se sentiría lenta. */
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
                          /* rel="noopener noreferrer" en todo enlace externo
                             que abra pestaña nueva: sin "noopener", la página
                             de destino puede manipular la nuestra desde
                             JavaScript (window.opener). Es una línea y cierra
                             un agujero conocido. */
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

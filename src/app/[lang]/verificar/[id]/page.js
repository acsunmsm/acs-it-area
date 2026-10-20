import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import Image from 'next/image';
import { Link } from '@/src/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { supabaseServer } from '@/src/lib/supabase-server';
import styles from './verificar.module.css';

// ---------- Metadata dinámica ----------
export async function generateMetadata({ params }) {
  const { lang, id } = await params;
  const t = await getTranslations({ locale: lang, namespace: 'verificar' });

  return {
    title: `${t('metaTitle')} – ${id}`,
    description: t('metaDescription'),
  };
}

// ---------- Componente principal ----------
export default async function VerificarCertificado({ params }) {
  const { lang, id } = await params;
  const t = await getTranslations({ locale: lang, namespace: 'verificar' });

  const cleanId = decodeURIComponent(id || '').trim();
  let certificados = [];

  // 1. Intentar buscar por documento de identidad (columna 'documento_identidad' en Supabase)
  try {
    const { data: byDoc, error: errDoc } = await supabaseServer
      .from('certificados')
      .select('*')
      .eq('documento_identidad', cleanId);

    if (!errDoc && byDoc && byDoc.length > 0) {
      certificados = byDoc;
    }
  } catch (e) {
    // Continuamos si hay error
  }

  // 2. Fallbacks alternativos de nombres de columna de documento
  if (certificados.length === 0) {
    try {
      const { data: byDocAlt } = await supabaseServer
        .from('certificados')
        .select('*')
        .or(`dni.eq.${cleanId},documento_de_identidad.eq.${cleanId}`);

      if (byDocAlt && byDocAlt.length > 0) {
        certificados = byDocAlt;
      }
    } catch (e) {
      // Ignorar si las columnas no existen
    }
  }

  // 3. Si no se encontró por documento, buscar por id_certificado (QR o código directo)
  if (certificados.length === 0) {
    try {
      const { data: byId, error: errId } = await supabaseServer
        .from('certificados')
        .select('*')
        .eq('id_certificado', cleanId);

      if (!errId && byId && byId.length > 0) {
        certificados = byId;
      }
    } catch (e) {
      // Error
    }
  }

  // Determinar si se encontraron certificados
  const isValid = certificados.length > 0;
  const hasMultiple = certificados.length > 1;

  return (
    <>
      <Navbar />

      <main className="tema-biblioteca">
        <section className={styles.heroSection}>
          <div className={styles.heroOverlay} />

          <div className={`container position-relative ${styles.heroContent}`}>
            <div className="row justify-content-center">
              <div className="col-lg-8 col-xl-7 text-center">
                <h1 className={styles.heroTitle}>
                  {t('title')}
                </h1>
                <p className={styles.heroSubtitle}>
                  {t('subtitle')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de resultado */}
        <section className={styles.resultSection}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-7 col-xl-6">

                {isValid ? (
                  /* ─── Certificados encontrados ─── */
                  <div className={styles.card}>
                    <div className={styles.cardBorderSuccess} />
                    <div className={styles.cardBody}>
                      {/* Imagen de Otto */}
                      <div className={styles.iconWrapper}>
                        <Image
                          src="/assets/img/otto-celebra.png"
                          alt="Otto celebrando"
                          width={140}
                          height={140}
                          className={styles.mascotImage}
                          priority
                        />
                      </div>

                      <h2 className={styles.cardTitle}>
                        {hasMultiple ? t('successTitleMultiple') : t('successTitle')}
                      </h2>
                      <p className={styles.cardSubtitle}>
                        {hasMultiple
                          ? t('successMessageMultiple', { count: certificados.length })
                          : t('successMessage')}
                      </p>

                      {/* Lista de certificados */}
                      <div className={styles.certList}>
                        {certificados.map((cert, index) => (
                          <div key={cert.id_certificado || index} className={hasMultiple && index > 0 ? styles.certBlockDivider : ''}>
                            {hasMultiple && (
                              <div className={styles.certNumberHeader}>
                                <span>{t('certificateNumber', { index: index + 1 })}</span>
                              </div>
                            )}

                            <div className={styles.dataTable}>
                              <div className={styles.dataRow}>
                                <span className={styles.dataLabel}>{t('labelNombre')}</span>
                                <span className={styles.dataValue}>{cert.nombre_persona || '—'}</span>
                              </div>

                              <div className={styles.dataRow}>
                                <span className={styles.dataLabel}>{t('labelEvento')}</span>
                                <span className={styles.dataValue}>{cert.evento || '—'}</span>
                              </div>

                              <div className={styles.dataRow}>
                                <span className={styles.dataLabel}>{t('labelFecha')}</span>
                                <span className={styles.dataValue}>{cert.fecha || '—'}</span>
                              </div>

                              <div className={styles.dataRow}>
                                <span className={styles.dataLabel}>{t('labelHoras')}</span>
                                <span className={styles.dataValue}>{cert.horas || '—'}</span>
                              </div>

                              <div className={styles.dataRow}>
                                <span className={styles.dataLabel}>{t('labelArea')}</span>
                                <span className={styles.dataValue}>{cert.area || '—'}</span>
                              </div>

                              <div className={styles.dataRow}>
                                <span className={styles.dataLabel}>{t('labelId')}</span>
                                <span className={`${styles.dataValue} ${styles.dataCode}`}>
                                  {cert.id_certificado || '—'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Botón de volver */}
                      <div className={styles.returnBtnWrapper}>
                        <Link href="/verificar" className={styles.returnBtn}>
                          ← {t('verifyAnother')}
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ─── Certificados NO encontrados ─── */
                  <div className={styles.card}>
                    <div className={styles.cardBorderError} />
                    <div className={styles.cardBody}>
                      {/* Imagen de Otto */}
                      <div className={styles.iconWrapper}>
                        <Image
                          src="/assets/img/otto-piensa.png"
                          alt="Otto pensando"
                          width={140}
                          height={140}
                          className={styles.mascotImage}
                          priority
                        />
                      </div>

                      <h2 className={styles.cardTitle}>
                        {t('errorTitle')}
                      </h2>
                      <p className={styles.cardSubtitleError}>
                        {t('errorMessage')}
                      </p>

                      {/* Documento buscado */}
                      <div className={styles.errorCodeBox}>
                        <span className={styles.errorCodeLabel}>
                          {t('searchedCode')}
                        </span>
                        <code className={styles.errorCode}>{id}</code>
                      </div>

                      <p className={styles.errorHint}>
                        {t('errorHint')}
                      </p>

                      <div className={styles.returnBtnWrapper}>
                        <Link href="/verificar" className={styles.returnBtn}>
                          ← {t('verifyAnother')}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

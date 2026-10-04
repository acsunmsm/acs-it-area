import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { supabaseServer } from '@/src/lib/supabase-server';
import styles from './verificar.module.css';

// ---------- Metadata dinámica ----------
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: 'verificar' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

// ---------- Componente principal ----------
export default async function VerificarCertificado({ params }) {
  const { lang, id } = await params;
  const t = await getTranslations({ locale: lang, namespace: 'verificar' });

  // Fetch del certificado desde Supabase
  const { data: certificado, error } = await supabaseServer
    .from('certificados')
    .select('*')
    .eq('id_certificado', id)
    .single();

  // Determinar si el certificado es válido
  const isValid = !error && certificado;

  return (
    <>
      <Navbar />

      <main className="tema-biblioteca">
        <section className={styles.heroSection}>
          {/* Overlay con gradiente */}
          <div className={styles.heroOverlay} />

          <div className={`container position-relative ${styles.heroContent}`}>
            <div className="row justify-content-center">
              <div className="col-lg-8 col-xl-7 text-center">
                {/* Encabezado */}
                <span className={styles.badge}>
                  🔐 {t('badge')}
                </span>
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
                  /* ─── Certificado encontrado ─── */
                  <div className={styles.card}>
                    <div className={styles.cardBorderSuccess} />
                    <div className={styles.cardBody}>
                      {/* Imagen de éxito */}
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
                        {t('successTitle')}
                      </h2>
                      <p className={styles.cardSubtitle}>
                        {t('successMessage')}
                      </p>

                      {/* Datos del certificado */}
                      <div className={styles.dataGrid}>
                        <DataRow
                          label={t('labelNombre')}
                          value={certificado.nombre_persona}
                          icon="👤"
                        />
                        <DataRow
                          label={t('labelEvento')}
                          value={certificado.evento}
                          icon="📋"
                        />
                        <DataRow
                          label={t('labelFecha')}
                          value={certificado.fecha}
                          icon="📅"
                        />
                        <DataRow
                          label={t('labelHoras')}
                          value={certificado.horas}
                          icon="⏱️"
                        />
                        <DataRow
                          label={t('labelArea')}
                          value={certificado.area}
                          icon="🏷️"
                        />
                        <DataRow
                          label={t('labelId')}
                          value={certificado.id_certificado}
                          icon="🔑"
                          isMono
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ─── Certificado NO encontrado ─── */
                  <div className={styles.card}>
                    <div className={styles.cardBorderError} />
                    <div className={styles.cardBody}>
                      {/* Imagen de error */}
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

                      {/* Código buscado */}
                      <div className={styles.errorCodeBox}>
                        <span className={styles.errorCodeLabel}>
                          {t('searchedCode')}
                        </span>
                        <code className={styles.errorCode}>{id}</code>
                      </div>

                      <p className={styles.errorHint}>
                        {t('errorHint')}
                      </p>
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

// ---------- Componente auxiliar para filas de datos ----------
function DataRow({ label, value, icon, isMono = false }) {
  return (
    <div className={styles.dataRow}>
      <div className={styles.dataLabel}>
        <span className={styles.dataIcon}>{icon}</span>
        <span>{label}</span>
      </div>
      <div className={`${styles.dataValue} ${isMono ? styles.dataMono : ''}`}>
        {value || '—'}
      </div>
    </div>
  );
}

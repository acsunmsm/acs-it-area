'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/src/i18n/navigation';
import {
  FaIdCard,
  FaArrowLeft,
  FaExclamationCircle,
  FaTimes
} from 'react-icons/fa';
import styles from './verificar-search.module.css';

export default function VerificarSearchForm() {
  const t = useTranslations('verificar');
  const router = useRouter();

  const [documentNumber, setDocumentNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanDoc = documentNumber.trim().replace(/\s+/g, '');

    if (!cleanDoc) {
      setErrorMsg(t('emptyCodeError'));
      return;
    }

    setErrorMsg('');
    router.push(`/verificar/${encodeURIComponent(cleanDoc)}`);
  };

  const handleClear = () => {
    setDocumentNumber('');
    setErrorMsg('');
  };

  return (
    <div className={styles.containerRoot}>
      {/* ---------- Search Card ---------- */}
      <div className={styles.searchCard}>
        <div className={styles.cardTopAccent} />

        <div className={styles.cardBody}>
          {/* Mascota Otto centrada */}
          <div className={styles.iconWrapper}>
            <Image
              src="/assets/img/otto-explica.png"
              alt="Otto Asistente ACS"
              width={140}
              height={140}
              className={styles.mascotImage}
              priority
            />
          </div>

          <h2 className={styles.cardTitle}>{t('searchTitle')}</h2>
          <p className={styles.cardSubtitle}>{t('searchSubtitle')}</p>

          {/* Formulario de búsqueda interactivo por Documento de Identidad */}
          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formGroup}>
              <label htmlFor="documentNumber" className={styles.inputLabel}>
                {t('inputLabel')}
              </label>

              <div className={`${styles.inputWrapper} ${isFocused ? styles.inputWrapperFocused : ''} ${errorMsg ? styles.inputWrapperError : ''}`}>
                <FaIdCard className={styles.inputIcon} />
                <input
                  id="documentNumber"
                  type="text"
                  className={styles.inputField}
                  placeholder={t('inputPlaceholder')}
                  value={documentNumber}
                  onChange={(e) => {
                    setDocumentNumber(e.target.value.trim());
                    if (errorMsg) setErrorMsg('');
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  autoFocus
                  autoComplete="off"
                  spellCheck="false"
                  aria-invalid={!!errorMsg}
                  aria-describedby={errorMsg ? 'doc-error' : 'doc-help'}
                />

                {documentNumber.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className={styles.clearBtn}
                    aria-label="Borrar texto"
                    title="Borrar texto"
                  >
                    <FaTimes size={13} />
                  </button>
                )}
              </div>

              {errorMsg && (
                <div id="doc-error" className={styles.errorMessage} role="alert">
                  <FaExclamationCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <button type="submit" className={styles.submitBtn}>
              <span>{t('submitButton')}</span>
            </button>
          </form>

          {/* Enlace de regreso a Recursos */}
          <div className={styles.backLinkWrapper}>
            <Link href="/resources" className={styles.backLink}>
              <FaArrowLeft size={12} />
              <span>{t('backToResources')}</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import { FaCopy, FaCheck, FaPrint, FaArrowLeft, FaShareAlt } from 'react-icons/fa';
import styles from './verificar.module.css';

export default function CertificateActions({ certificateId }) {
  const t = useTranslations('verificar');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(certificateId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    } catch {
      // Fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.actionsContainer}>
      <div className={styles.primaryActionsRow}>
        <button
          type="button"
          onClick={handleCopyCode}
          className={`${styles.actionButton} ${copiedCode ? styles.actionButtonSuccess : ''}`}
          title={t('copyCode')}
        >
          {copiedCode ? <FaCheck size={13} /> : <FaCopy size={13} />}
          <span>{copiedCode ? t('codeCopied') : t('copyCode')}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className={`${styles.actionButton} ${copiedLink ? styles.actionButtonSuccess : ''}`}
          title={t('shareVerification')}
        >
          {copiedLink ? <FaCheck size={13} /> : <FaShareAlt size={13} />}
          <span>{copiedLink ? t('linkCopied') : t('shareVerification')}</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className={styles.actionButton}
          title={t('printVerification')}
        >
          <FaPrint size={13} />
          <span>{t('printVerification')}</span>
        </button>
      </div>

      <div className={styles.verifyAnotherWrapper}>
        <Link href="/verificar" className={styles.verifyAnotherLink}>
          <FaArrowLeft size={12} />
          <span>{t('verifyAnother')}</span>
        </Link>
      </div>
    </div>
  );
}

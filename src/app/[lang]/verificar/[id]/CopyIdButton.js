'use client';

import { useState } from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa';
import styles from './verificar.module.css';

export default function CopyIdButton({ idText }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(idText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`${styles.copyIdBtn} ${copied ? styles.copyIdBtnSuccess : ''}`}
      title={copied ? '¡Copiado!' : 'Copiar código'}
      aria-label="Copiar código de certificado"
    >
      {copied ? <FaCheck size={11} /> : <FaCopy size={11} />}
      <span>{copied ? 'Copiado' : 'Copiar'}</span>
    </button>
  );
}

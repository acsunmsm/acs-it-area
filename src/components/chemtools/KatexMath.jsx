'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * Component for rendering LaTeX formulas dynamically with KaTeX.
 */
export default function KatexMath({ math, block = true, className = '' }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
      });
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      return `<span class="katex-error">${math}</span>`;
    }
  }, [math, block]);

  return (
    <div
      className={`katex-wrapper ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

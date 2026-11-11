'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function PublicationImage({ src, alt, original = false, ...props }) {
  const [failedSource, setFailedSource] = useState(null);
  const publicStorage = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/';
  const optimizable = src.startsWith(publicStorage) || (src.startsWith('/') && !src.startsWith('//'));
  const direct = original || !optimizable || failedSource === src;

  return (
    <Image {...props} src={src} alt={alt} width={960} height={600}
      style={original ? { width: 'auto', height: 'auto', ...props.style } : props.style}
      unoptimized={direct} onError={direct ? undefined : () => setFailedSource(src)} />
  );
}

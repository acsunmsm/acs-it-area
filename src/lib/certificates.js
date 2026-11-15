export async function findCertificatesByDni(db, query) {
  if (!query || typeof query !== 'string') return [];
  const cleanId = decodeURIComponent(query).trim();
  if (!cleanId) return [];

  // 1. Si parece DNI (8 dígitos numéricos), buscar por documento de identidad
  if (/^[0-9]{8}$/.test(cleanId)) {
    for (const column of ['documento_identidad', 'dni', 'documento_de_identidad']) {
      const { data, error } = await db.from('certificados')
        .select('*')
        .eq(column, cleanId);
      if (error?.code === '42703') continue;
      if (error) throw new Error('Certificate verification unavailable');
      if (data?.length) return data;
    }
  }

  // 2. Buscar por id_certificado (UUID o código directo del QR como ACS-000-001)
  try {
    const { data: byId, error: errId } = await db.from('certificados')
      .select('*')
      .eq('id_certificado', cleanId);
    if (!errId && byId?.length) return byId;
  } catch (e) {
    // Continuar si hay algún inconveniente
  }

  // 3. Fallback: buscar por documento de identidad (para pasaportes u otros documentos no numéricos)
  for (const column of ['documento_identidad', 'dni', 'documento_de_identidad']) {
    const { data, error } = await db.from('certificados')
      .select('*')
      .eq(column, cleanId);
    if (error?.code === '42703') continue;
    if (error) throw new Error('Certificate verification unavailable');
    if (data?.length) return data;
  }

  return [];
}

/**
 * Determina si un certificado tiene habilitada la generación y descarga en formato PDF.
 * Actualmente habilitado únicamente para Certificados de Reconocimiento.
 * Para eventos como Nanotecnología, webinars, conferencias o talleres, se mantiene deshabilitado.
 */
export function isCertificatePdfEnabled(cert) {
  if (!cert) return false;
  const tipo = String(cert.tipo || '').toLowerCase();
  if (tipo === 'reconocimiento') return true;
  if (cert.miembro) return true;
  const evento = String(cert.evento || '').toLowerCase();
  if (evento.includes('reconocimiento')) return true;
  return false;
}

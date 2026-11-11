export async function findCertificatesByDni(db, dni) {
  if (!/^[0-9]{8}$/.test(dni)) return [];

  // Older installations use different names for the identity document column.
  for (const column of ['documento_identidad', 'dni', 'documento_de_identidad']) {
    const { data, error } = await db.from('certificados')
      .select('id_certificado,nombre_persona,evento,fecha,horas,area')
      .eq(column, dni);
    if (error?.code === '42703') continue;
    if (error) throw new Error('Certificate verification unavailable');
    if (data?.length) return data;
  }
  return [];
}

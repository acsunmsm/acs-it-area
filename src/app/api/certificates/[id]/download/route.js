import { NextResponse } from 'next/server';
import { supabaseServer } from '@/src/lib/supabase-server';
import { findCertificatesByDni, isCertificatePdfEnabled } from '@/src/lib/certificates';
import { generateCertificatePdf, findTemplateForEvent } from '@/src/lib/certificateGenerator';

// Caché en memoria para evitar volver a descargar la plantilla de Supabase en cada petición
let cachedTemplateBuffer = null;

async function getTemplateBuffer(targetCert) {
  // 1. Intentar leer desde el disco local primero (por ejemplo en entorno local)
  try {
    const localTemplate = findTemplateForEvent(targetCert, process.cwd());
    if (localTemplate) return localTemplate;
  } catch (e) {
    // Continuar con Supabase Storage
  }

  // 2. Si ya está en la memoria caché del servidor, reutilizarla inmediatamente
  if (cachedTemplateBuffer) return cachedTemplateBuffer;

  // 3. Descargar desde Supabase Storage (en producción / Vercel sin exponer firmas en Git)
  try {
    const bucketsToTry = ['certificados', 'eventos', 'noticias'];
    const filesToTry = ['reconocimiento.png', 'certificados/reconocimiento.png', 'plantillas/reconocimiento.png'];

    for (const bucket of bucketsToTry) {
      for (const filePath of filesToTry) {
        try {
          const { data, error } = await supabaseServer.storage.from(bucket).download(filePath);
          if (!error && data) {
            const arrayBuffer = await data.arrayBuffer();
            const buf = Buffer.from(arrayBuffer);
            buf.matchedName = 'reconocimiento.png';
            cachedTemplateBuffer = buf;
            return buf;
          }
        } catch (e) {
          // Continuar con el siguiente intento
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ No se pudo descargar la plantilla desde Supabase Storage:', err.message);
  }

  return null;
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id || '').trim();

    if (!cleanId) {
      return NextResponse.json({ error: 'Identificador no proporcionado' }, { status: 400 });
    }

    // Obtener los certificados correspondientes (por DNI o por id_certificado)
    const certificados = await findCertificatesByDni(supabaseServer, cleanId);

    if (!certificados || certificados.length === 0) {
      return NextResponse.json({ error: 'Certificado no encontrado' }, { status: 404 });
    }

    // Si viene un parámetro ?cert_id=... en la URL, seleccionar ese específico
    const { searchParams } = new URL(request.url);
    const specificCertId = searchParams.get('cert_id');

    let targetCert = certificados[0];
    if (specificCertId) {
      const match = certificados.find((c) => c.id_certificado === specificCertId);
      if (match) targetCert = match;
    }

    // Validar si el certificado tiene la generación en PDF habilitada
    if (!isCertificatePdfEnabled(targetCert)) {
      return NextResponse.json(
        { error: 'La descarga de este certificado en formato PDF aún no está habilitada.' },
        { status: 403 }
      );
    }

    // Obtener la plantilla oficial (desde disco local o desde Supabase Storage)
    const templateBuffer = await getTemplateBuffer(targetCert);

    // Generar el PDF
    const pdfBytes = await generateCertificatePdf({
      cert: targetCert,
      templateBuffer,
      projectRoot: process.cwd(),
    });

    const safeName = (targetCert.nombre_persona || 'Participante')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_\- ]/g, '')
      .trim()
      .replace(/\s+/g, '_');

    const fileName = `Certificado_${safeName}.pdf`;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generando certificado en API:', error);
    return NextResponse.json(
      { error: 'Error al generar el certificado en PDF' },
      { status: 500 }
    );
  }
}


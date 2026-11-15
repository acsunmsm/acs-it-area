import { NextResponse } from 'next/server';
import { supabaseServer } from '@/src/lib/supabase-server';
import { findCertificatesByDni, isCertificatePdfEnabled } from '@/src/lib/certificates';
import { generateCertificatePdf } from '@/src/lib/certificateGenerator';

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

    // Generar el PDF
    const pdfBytes = await generateCertificatePdf({
      cert: targetCert,
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


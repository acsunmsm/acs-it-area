import { generateCertificatePdf } from '../src/lib/certificateGenerator.js';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

async function main() {
  const rootDir = process.cwd();
  const configPath = path.join(rootDir, 'certificados_config.json');
  let config = {};
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }

  const cert = {
    id_certificado: 'ACS-REC-2026-001',
    nombre_persona: 'Gonzalo Aguilar Espinoza',
    evento: 'Reconocimiento a Miembros Activos',
    miembro: 'Miembro',
    cargo: 'Miembro',
    area: 'Voluntario de Tecnología e Informática',
    periodo: '2025 - 2026',
    fecha: '2025 - 2026',
    tipo: 'reconocimiento',
  };

  console.log('Generando PDF con la configuración actual...');
  const pdfBytes = await generateCertificatePdf({
    cert,
    config,
    projectRoot: rootDir,
  });

  const pdfOut = path.join(rootDir, 'certificados_generados', 'preview_reconocimiento.pdf');
  fs.writeFileSync(pdfOut, pdfBytes);
  console.log('PDF guardado en:', pdfOut);

  // Renderizar a imagen PNG
  const pdoc = await pdfjs.getDocument({ data: pdfBytes }).promise;
  const ppage = await pdoc.getPage(1);
  const viewport = ppage.getViewport({ scale: 0.5 }); // Escala 1000x707 para previsualización nítida
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');
  await ppage.render({ canvasContext: ctx, viewport }).promise;

  const pngBuffer = canvas.toBuffer('image/png');

  const pngOutLocal = path.join(rootDir, 'certificados_generados', 'preview_reconocimiento.png');
  fs.writeFileSync(pngOutLocal, pngBuffer);
  console.log('Preview PNG guardado en:', pngOutLocal);

  const brainDir = 'C:\\Users\\FREDY\\.gemini\\antigravity\\brain\\91559fe2-a811-4c4a-b8da-60c432ffd3ed';
  if (fs.existsSync(brainDir)) {
    const pngOutBrain = path.join(brainDir, 'preview_reconocimiento.png');
    fs.writeFileSync(pngOutBrain, pngBuffer);
    console.log('Copiado a brain para visualización:', pngOutBrain);
  }
}

main().catch((err) => {
  console.error('Error generando preview:', err);
  process.exit(1);
});


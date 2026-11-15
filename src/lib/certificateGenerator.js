import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

/**
 * Convierte un color hexadecimal '#RRGGBB' a componentes rgb(r, g, b) de pdf-lib (0 a 1).
 */
export function hexToRgb(hex = '#0b1b2b') {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return rgb(r, g, b);
}

/**
 * Divide un texto en líneas centradas sin cortar palabras según un ancho máximo.
 */
export function wrapTextIntoLines(text, font, fontSize, maxWidth) {
  if (!text || !font) return [];
  const words = String(text).trim().split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Configuración por defecto para el estampado de datos sobre la plantilla.
 */
export const DEFAULT_CERTIFICATE_CONFIG = {
  // Dimensiones base si no se proporciona plantilla (A4 horizontal: 842 x 595 pt)
  defaultWidth: 842,
  defaultHeight: 595,

  // Base URL para el QR
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://acs-unmsm.org/es/verificar',

  // Configuración estándar (para seminarios, webinars y talleres)
  name: {
    yPercent: 49,          // 49% desde la parte inferior
    fontSize: 32,
    colorHex: '#0b1b2b',   // Azul oscuro institucional
    fontFamily: 'bold',
  },

  event: {
    enabled: true,
    yPercent: 37,
    fontSize: 16,
    colorHex: '#334155',
    fontFamily: 'medium',
    maxWidthPercent: 75,
  },

  date: {
    enabled: true,
    yPercent: 25,
    fontSize: 13,
    colorHex: '#64748b',
    fontFamily: 'regular',
  },

  qr: {
    xPercent: 82,          // Esquina inferior derecha
    yPercent: 9,
    sizePercent: 14,
  },

  codeText: {
    enabled: true,
    xPercent: 82,
    yPercent: 5.5,
    fontSize: 8.5,
    colorHex: '#475569',
    fontFamily: 'regular',
  },

  // Configuración exclusiva para certificados de reconocimiento a miembros del capítulo
  reconocimiento: {
    enabled: true,
    // Nombre del participante en Niconne
    name: {
      fontSize: 66,
      scaleWithCanvas: true, // Escala proporcionalmente si la plantilla es 2000x1414
      colorHex: '#412BFD',   // Color primario del sitio web
      fontFamily: 'niconne',
      y: 705,
    },
    // Párrafo de mérito en fuente Garamond (estilo elegante coincidente con Advisor / Presidente)
    paragraph: {
      fontSize: 16.5,
      colorHex: '#1e293b',
      fontFamily: 'garamond',
      y: 565,
      lineHeight: 52,
      maxWidth: 1480,
    },
    // QR dimensionado para tapar completamente las líneas negras del marco superior derecho
    qr: {
      x: 1480,
      y: 873,
      size: 362,
    },
    // Cuadro blanco que borra con precisión milimétrica solo el texto con corchetes [cargo], [area], [fecha]
    // ajustado estrictamente al área de texto para no tapar firmas ni bordes (x: [300, 1700], y: [456, 602])
    eraser: {
      x: 300,
      y: 456,
      width: 1400,
      height: 146,
    },
  },
};

/**
 * Normaliza el nombre de un evento para buscar archivos de plantilla.
 */
export function slugifyEventName(name = '') {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

/**
 * Determina si un certificado corresponde al tipo "Reconocimiento".
 */
export function isRecognitionCertificate(cert = {}, templateName = '') {
  if (!cert) return false;
  if (cert.isRecognition === true) return true;

  const typeStr = String(cert.tipo || '').toLowerCase();
  const areaStr = String(cert.area || '').toLowerCase();
  const eventStr = String(cert.evento || '').toLowerCase();
  const tName = String(templateName || '').toLowerCase();
  const certPlantilla = String(cert.plantilla || '').toLowerCase();

  // Si tiene asignada columna miembro, cargo o periodo
  if (cert.miembro || cert.cargo || cert.periodo) return true;

  if (/reconocimiento|directiva|miembro/i.test(typeStr)) return true;
  if (/reconocimiento/i.test(areaStr)) return true;
  if (/reconocimiento/i.test(eventStr)) return true;
  if (/reconocimiento|prueba/i.test(tName)) return true;
  if (/reconocimiento|prueba/i.test(certPlantilla)) return true;

  return false;
}

/**
 * Busca de forma inteligente la plantilla que corresponde al evento.
 */
export function findTemplateForEvent(eventOrCert = '', projectRoot = process.cwd()) {
  const searchDirs = [
    path.join(projectRoot, 'certificados_plantillas'),
    path.join(projectRoot, 'public', 'certificados', 'plantillas'),
    path.join(projectRoot, 'public', 'certificados'),
  ];

  let eventName = '';
  let forcedPlantilla = '';
  let isReco = false;

  if (typeof eventOrCert === 'object' && eventOrCert !== null) {
    eventName = eventOrCert.evento || eventOrCert.nombre_evento || '';
    forcedPlantilla = eventOrCert.plantilla || '';
    isReco = isRecognitionCertificate(eventOrCert);
  } else {
    eventName = String(eventOrCert || '');
    isReco = isRecognitionCertificate({ evento: eventName });
  }

  const fullSlug = slugifyEventName(eventName);
  const firstWord = fullSlug.split('-')[0];

  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;

    // 0. Plantilla explícita si se indicó
    if (forcedPlantilla) {
      for (const ext of ['', '.png', '.jpg', '.jpeg']) {
        const full = path.join(dir, `${forcedPlantilla}${ext}`);
        if (fs.existsSync(full)) {
          const buf = fs.readFileSync(full);
          buf.matchedName = path.basename(full);
          return buf;
        }
      }
    }

    // 1. Si es de reconocimiento, preferir reconocimiento.png o prueba.png
    if (isReco) {
      for (const recoName of ['reconocimiento.png', 'reconocimiento.jpg', 'prueba.png', 'prueba.jpg']) {
        const full = path.join(dir, recoName);
        if (fs.existsSync(full)) {
          const buf = fs.readFileSync(full);
          buf.matchedName = path.basename(full);
          return buf;
        }
      }
    }

    // 2. Coincidencia por slug completo: ej. nanotecnologia-aplicada.png
    if (fullSlug) {
      for (const ext of ['png', 'jpg', 'jpeg']) {
        const full = path.join(dir, `${fullSlug}.${ext}`);
        if (fs.existsSync(full)) {
          const buf = fs.readFileSync(full);
          buf.matchedName = path.basename(full);
          return buf;
        }
      }
    }

    // 3. Coincidencia por primera palabra clave: ej. polimeros.png
    if (firstWord && firstWord.length > 3) {
      for (const ext of ['png', 'jpg', 'jpeg']) {
        const keyp = path.join(dir, `${firstWord}.${ext}`);
        if (fs.existsSync(keyp)) {
          const buf = fs.readFileSync(keyp);
          buf.matchedName = path.basename(keyp);
          return buf;
        }
      }
    }

    // 4. Búsqueda por coincidencia parcial en nombres de archivo
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const lower = file.toLowerCase();
        if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
          if (firstWord && firstWord.length > 3 && lower.includes(firstWord)) {
            const buf = fs.readFileSync(path.join(dir, file));
            buf.matchedName = file;
            return buf;
          }
        }
      }
    } catch (e) {
      // Ignorar errores de lectura
    }

    // 5. Plantilla general por defecto
    for (const defName of ['plantilla.png', 'plantilla.jpg', 'template.png']) {
      const defPath = path.join(dir, defName);
      if (fs.existsSync(defPath)) {
        const buf = fs.readFileSync(defPath);
        buf.matchedName = defName;
        return buf;
      }
    }
  }

  return null;
}

/**
 * Dibuja un fondo predeterminado elegante en caso de que no haya plantilla PNG/JPG subida.
 */
function drawFallbackDesign(page, width, height, fonts) {
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.98, 0.98, 0.99),
  });

  page.drawRectangle({
    x: 18,
    y: 18,
    width: width - 36,
    height: height - 36,
    borderColor: rgb(0, 0.33, 0.65),
    borderWidth: 2.5,
  });

  page.drawRectangle({
    x: 26,
    y: 26,
    width: width - 52,
    height: height - 52,
    borderColor: rgb(1, 0.83, 0),
    borderWidth: 1,
  });

  const institution = 'AMERICAN CHEMICAL SOCIETY • STUDENT CHAPTER UNMSM';
  const instWidth = fonts.medium.widthOfTextAtSize(institution, 11);
  page.drawText(institution, {
    x: (width - instWidth) / 2,
    y: height - 60,
    size: 11,
    font: fonts.medium,
    color: rgb(0, 0.33, 0.65),
  });

  const title = 'CERTIFICADO DE PARTICIPACIÓN';
  const titleWidth = fonts.bold.widthOfTextAtSize(title, 26);
  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y: height - 105,
    size: 26,
    font: fonts.bold,
    color: rgb(0.04, 0.1, 0.17),
  });

  const subtitle = 'El Capítulo Estudiantil ACS UNMSM otorga la presente constancia a:';
  const subWidth = fonts.regular.widthOfTextAtSize(subtitle, 13);
  page.drawText(subtitle, {
    x: (width - subWidth) / 2,
    y: height - 145,
    size: 13,
    font: fonts.regular,
    color: rgb(0.28, 0.38, 0.47),
  });
}

/**
 * Carga de forma segura un archivo de fuente si existe en el disco.
 */
async function tryEmbedFont(doc, filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const bytes = await fs.promises.readFile(filePath);
      return await doc.embedFont(bytes);
    }
  } catch (err) {
    console.warn(`No se pudo cargar la fuente ${filePath}:`, err.message);
  }
  return null;
}

/**
 * Genera un PDF de certificado para un registro dado.
 */
export async function generateCertificatePdf({
  cert = {},
  templateBuffer = null,
  config = {},
  projectRoot = process.cwd(),
}) {
  const mergedConfig = {
    ...DEFAULT_CERTIFICATE_CONFIG,
    ...config,
    reconocimiento: {
      ...DEFAULT_CERTIFICATE_CONFIG.reconocimiento,
      ...(config.reconocimiento || {}),
    },
  };

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  // Cargar fuentes oficiales Stolzl
  const fontsDir = path.join(projectRoot, 'public', 'fonts');
  const boldPath = path.join(fontsDir, 'stolzl_bold.otf');
  const mediumPath = path.join(fontsDir, 'stolzl_medium.otf');
  const regularPath = path.join(fontsDir, 'stolzl_regular.otf');

  // Fuentes para certificados de reconocimiento
  const niconnePath = path.join(fontsDir, 'niconne_regular.ttf');
  const youngestOtfPath = path.join(fontsDir, 'the_youngest.otf');
  const youngestAltPath = path.join(fontsDir, 'youngest.otf');
  const garamondPath = path.join(fontsDir, 'eb_garamond.ttf');

  const [
    fontBold,
    fontMedium,
    fontRegular,
    fontNiconne,
    fontYoungestOtf,
    fontYoungestAlt,
    fontGaramond,
  ] = await Promise.all([
    tryEmbedFont(doc, boldPath),
    tryEmbedFont(doc, mediumPath),
    tryEmbedFont(doc, regularPath),
    tryEmbedFont(doc, niconnePath),
    tryEmbedFont(doc, youngestOtfPath),
    tryEmbedFont(doc, youngestAltPath),
    tryEmbedFont(doc, garamondPath),
  ]);

  const fonts = {
    bold: fontBold || fontRegular,
    medium: fontMedium || fontRegular,
    regular: fontRegular,
    niconne: fontNiconne || fontBold || fontRegular,
    youngest: fontYoungestOtf || fontYoungestAlt || fontGaramond || fontRegular,
    garamond: fontGaramond || fontRegular,
    eb_garamond: fontGaramond || fontRegular,
    advisor: fontGaramond || fontRegular,
    serif: fontGaramond || fontRegular,
  };

  // Buscar plantilla específica para el evento o la plantilla general
  let effectiveTemplate = templateBuffer;
  let templateName = templateBuffer?.matchedName || '';

  if (!effectiveTemplate) {
    effectiveTemplate = findTemplateForEvent(cert, projectRoot);
    if (effectiveTemplate?.matchedName) {
      templateName = effectiveTemplate.matchedName;
    }
  }

  // Detectar si aplica el estilo de reconocimiento
  const isRecognition =
    Boolean(config.forceRecognition) ||
    isRecognitionCertificate(cert, templateName);

  // Crear página (con dimensiones exactas de la plantilla o tamaño A4)
  let page;
  let pageWidth = mergedConfig.defaultWidth;
  let pageHeight = mergedConfig.defaultHeight;

  if (effectiveTemplate) {
    try {
      let bgImage;
      try {
        bgImage = await doc.embedPng(effectiveTemplate);
      } catch (ePng) {
        bgImage = await doc.embedJpg(effectiveTemplate);
      }

      pageWidth = bgImage.width;
      pageHeight = bgImage.height;
      page = doc.addPage([pageWidth, pageHeight]);
      page.drawImage(bgImage, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });
    } catch (errImg) {
      console.warn('No se pudo procesar la imagen de plantilla, usando diseño base:', errImg.message);
      page = doc.addPage([pageWidth, pageHeight]);
      drawFallbackDesign(page, pageWidth, pageHeight, fonts);
    }
  } else {
    page = doc.addPage([pageWidth, pageHeight]);
    drawFallbackDesign(page, pageWidth, pageHeight, fonts);
  }

  // =========================================================================
  // CASO 1: CERTIFICADO DE RECONOCIMIENTO (Capítulo Estudiantil ACS UNMSM)
  // =========================================================================
  if (isRecognition) {
    const recoConfig = mergedConfig.reconocimiento;
    const scaleX = pageWidth / 2000;
    const scaleY = pageHeight / 1414;
    const uniformScale = Math.min(scaleX, scaleY);

    // 1. Estampar Código QR dentro del recuadro negro superior derecho
    // El recuadro negro en la plantilla 2000x1414 está en x:[1487, 1837] (w:350) e y:[880, 1229] (h:349)
    const certId = cert.id_certificado || cert.id || 'ACS-DEMO';
    const verifyUrl = `${mergedConfig.baseUrl.replace(/\/$/, '')}/${encodeURIComponent(certId)}`;

    const qrPngDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 400,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    const qrImage = await doc.embedPng(qrPngDataUrl);
    const boxX = 1487;
    const boxY = 880;
    const boxW = 350;
    const boxH = 349;

    const baseQrSize = recoConfig.qr?.size ?? 320;
    const qrTargetSize = baseQrSize * uniformScale;

    // Usar las coordenadas configuradas por el usuario (o centrar por defecto si no están definidas)
    const qrTargetX = (recoConfig.qr?.x ?? (boxX + (boxW - baseQrSize) / 2)) * scaleX;
    const qrTargetY = (recoConfig.qr?.y ?? (boxY + (boxH - baseQrSize) / 2)) * scaleY;

    page.drawImage(qrImage, {
      x: qrTargetX,
      y: qrTargetY,
      width: qrTargetSize,
      height: qrTargetSize,
    });

    // 2. Limpiar texto estático con corchetes [cargo], [area], [fecha] de la plantilla
    // Ajustado quirúrgicamente al área de texto para no tapar firmas ni bordes laterales
    const eraserX = (recoConfig.eraser?.x ?? 300) * scaleX;
    const eraserY = (recoConfig.eraser?.y ?? 456) * scaleY;
    const eraserW = (recoConfig.eraser?.width ?? 1400) * scaleX;
    const eraserH = (recoConfig.eraser?.height ?? 146) * scaleY;

    page.drawRectangle({
      x: eraserX,
      y: eraserY,
      width: eraserW,
      height: eraserH,
      color: rgb(1, 1, 1),
    });

    // 3. Estampar Nombre del Participante en Niconne y Color Primario #412BFD
    const recoNameFont = fonts[recoConfig.name?.fontFamily] || fonts.niconne || fonts.bold;
    const baseNameSize = recoConfig.name?.fontSize ?? 95;
    // Si se especifica explícitamente scaleWithCanvas: true se escala, si no, se usa el tamaño exacto en puntos configurado
    const effectiveNameSize =
      recoConfig.name?.scaleWithCanvas === true && pageWidth > 1200
        ? baseNameSize * (pageWidth / 1400)
        : baseNameSize;

    const nombrePersona = (cert.nombre_persona || 'Nombre del Participante').trim();
    const nameWidth = recoNameFont.widthOfTextAtSize(nombrePersona, effectiveNameSize);
    const nameX = (pageWidth - nameWidth) / 2;
    const nameY = (recoConfig.name?.y ?? 705) * scaleY;

    page.drawText(nombrePersona, {
      x: Math.max(20, nameX),
      y: nameY,
      size: effectiveNameSize,
      font: recoNameFont,
      color: hexToRgb(recoConfig.name?.colorHex || '#412BFD'),
    });

    // 4. Estampar Párrafo de Mérito en fuente "The Youngest" (tamaño 17.1 pt base)
    const recoTextFont = fonts[recoConfig.paragraph?.fontFamily] || fonts.youngest || fonts.regular;
    const baseParaSize = recoConfig.paragraph?.fontSize ?? 17.1;
    const effectiveParaSize =
      pageWidth > 1200 ? baseParaSize * (pageWidth / 842) : baseParaSize;

    // Resolver rol/cargo: se usa lo que dice en 'cargo' (o 'miembro')
    let rawCargo = String(cert.cargo || cert.miembro || cert.rol || cert.puesto || '').trim();
    let rawArea = String(cert.area || '').trim();

    // Si no vino cargo pero el área contiene el cargo directivo (ej. "Presidente", "Tesorero")
    if (!rawCargo && rawArea) {
      if (/^(presidente|presidenta|vicepresidente|vicepresidenta|secretari[oa]\s+general|tesorer[oa]|tesorer[ií]a)/i.test(rawArea)) {
        rawCargo = rawArea;
        rawArea = '';
      }
    }
    if (!rawCargo) rawCargo = 'Miembro';

    // Normalizar Tesorería -> Tesorero en el cargo si es necesario
    if (/^tesorer[ií]a$/i.test(rawCargo)) {
      rawCargo = 'Tesorero';
    }

    // Si en cargo viene "Secretario de [Área]" y área está vacía, extraer el área y dejar solo "Secretario"
    const matchSecDe = rawCargo.match(/^(secretari[oa])\s+(?:de\s+la\s+|de\s+el\s+|del\s+|de\s+)(.+)$/i);
    if (matchSecDe) {
      rawCargo = matchSecDe[1].charAt(0).toUpperCase() + matchSecDe[1].slice(1).toLowerCase();
      if (!rawArea) {
        rawArea = matchSecDe[2];
      }
    }

    // Ajustar cargoClean (agregar "Activo" solo a roles generales que no sean directivos ni coordinadores)
    let cargoClean = rawCargo.trim();
    if (!/activo|activa|director|directora|presidente|presidenta|vicepresidente|vicepresidenta|secretari[oa]|tesorer[oa]|tesorer[ií]a|asesor|asesora|coordinador|coordinadora|subcoordinador|subcoordinadora|vocal|fiscal|honorari[oa]/i.test(cargoClean)) {
      cargoClean = `${cargoClean} Activo`;
    }

    // Detectar cargos que NO llevan área (Presidente/a, Vicepresidente/a, Tesorero/a/Tesorería, Secretario/a General)
    const isSinArea =
      /^(presidente|presidenta|vicepresidente|vicepresidenta|secretari[oa](\/[ao])?\s+general|tesorer[oa]|tesorer[ií]a)$/i.test(cargoClean) ||
      /^(presidente|presidenta|vicepresidente|vicepresidenta|secretari[oa](\/[ao])?\s+general|tesorer[oa]|tesorer[ií]a)$/i.test(String(cert.area || '').trim());

    // Limpiar área: eliminar "Secretario de ", "Secretaria de ", "Coordinador de ", "Voluntario de ", "Área de ", etc.
    let areaClean = rawArea
      .replace(/^(sub[- ]?coordinador[as]?(\/[as])?|coordinador[as]?(\/[as])?|voluntari[oa]s?(\/[oa])?|director[as]?(\/[as])?|secretari[oa]s?(\/[oa])?|secretar[ií]a|tesorer[oa]s?(\/[oa])?|tesorer[ií]a)\s*(de\s+la\s+|de\s+el\s+|del\s+|de\s+|:\s*)?/i, '')
      .replace(/^área\s*(de\s+la\s+|de\s+el\s+|del\s+|de\s+)?/i, '')
      .replace(/^area\s*(de\s+la\s+|de\s+el\s+|del\s+|de\s+)?/i, '')
      .trim();

    const fechaClean = String(cert.periodo || cert.fecha || '2025 - 2026').trim();

    let lines = [];
    if (cert.descripcion || cert.texto) {
      lines = wrapTextIntoLines(
        cert.descripcion || cert.texto,
        recoTextFont,
        effectiveParaSize,
        (recoConfig.paragraph?.maxWidth ?? 1480) * scaleX
      );
    } else {
      // Si es Presidente/a, Tesorero/a, Secretario/a General, etc., o no hay área, se elimina "en el área de "
      const areaPhrase = (isSinArea || !areaClean) ? '' : ` en el área de ${areaClean}`;
      const fullText = `Por su destacada y comprometida participación como ${cargoClean} del capítulo estudiantil ACS UNMSM${areaPhrase}, durante el periodo ${fechaClean}, demostrando excelencia y dedicación.`;

      lines = wrapTextIntoLines(
        fullText,
        recoTextFont,
        effectiveParaSize,
        (recoConfig.paragraph?.maxWidth ?? 1480) * scaleX
      );
    }

    const startY = (recoConfig.paragraph?.y ?? 565) * scaleY;
    const lineSpacing = (recoConfig.paragraph?.lineHeight ?? 53) * scaleY;
    const paraColor = hexToRgb(recoConfig.paragraph?.colorHex || '#1e293b');

    lines.forEach((line, lineIdx) => {
      const lineWidth = recoTextFont.widthOfTextAtSize(line, effectiveParaSize);
      const lineX = (pageWidth - lineWidth) / 2;
      const lineY = startY - lineIdx * lineSpacing;

      page.drawText(line, {
        x: Math.max(20, lineX),
        y: lineY,
        size: effectiveParaSize,
        font: recoTextFont,
        color: paraColor,
      });
    });

    return await doc.save();
  }

  // =========================================================================
  // CASO 2: CERTIFICADO ESTÁNDAR (Webinars, Talleres, Ponencias)
  // =========================================================================

  // 1. Estampar Nombre del Participante (Centrado horizontalmente)
  const nombrePersona = (cert.nombre_persona || 'Nombre del Participante').trim();
  const nameFont = fonts[mergedConfig.name.fontFamily || 'bold'] || fonts.bold;
  const nameSize = mergedConfig.name.fontSize || 32;
  const nameWidth = nameFont.widthOfTextAtSize(nombrePersona, nameSize);
  const nameX = (pageWidth - nameWidth) / 2;
  const nameY = (pageHeight * (mergedConfig.name.yPercent || 49)) / 100;

  page.drawText(nombrePersona, {
    x: Math.max(20, nameX),
    y: nameY,
    size: nameSize,
    font: nameFont,
    color: hexToRgb(mergedConfig.name.colorHex || '#0b1b2b'),
  });

  // 2. Estampar Nombre del Evento (si está habilitado)
  if (mergedConfig.event.enabled && cert.evento) {
    const eventText = cert.evento.trim();
    const eventFont = fonts[mergedConfig.event.fontFamily || 'medium'] || fonts.medium;
    const eventSize = mergedConfig.event.fontSize || 16;
    const eventWidth = eventFont.widthOfTextAtSize(eventText, eventSize);
    const eventX = (pageWidth - eventWidth) / 2;
    const eventY = (pageHeight * (mergedConfig.event.yPercent || 37)) / 100;

    page.drawText(eventText, {
      x: Math.max(20, eventX),
      y: eventY,
      size: eventSize,
      font: eventFont,
      color: hexToRgb(mergedConfig.event.colorHex || '#334155'),
    });
  }

  // 3. Estampar Fecha u Horas (si está habilitado)
  if (mergedConfig.date.enabled && (cert.fecha || cert.horas)) {
    const parts = [];
    if (cert.fecha) parts.push(cert.fecha.trim());
    if (cert.horas) parts.push(`${cert.horas} ${/hora/i.test(cert.horas) ? '' : 'horas'}`.trim());
    const dateText = parts.join(' • ');

    const dateFont = fonts[mergedConfig.date.fontFamily || 'regular'] || fonts.regular;
    const dateSize = mergedConfig.date.fontSize || 13;
    const dateWidth = dateFont.widthOfTextAtSize(dateText, dateSize);
    const dateX = (pageWidth - dateWidth) / 2;
    const dateY = (pageHeight * (mergedConfig.date.yPercent || 25)) / 100;

    page.drawText(dateText, {
      x: Math.max(20, dateX),
      y: dateY,
      size: dateSize,
      font: dateFont,
      color: hexToRgb(mergedConfig.date.colorHex || '#64748b'),
    });
  }

  // 4. Generar y Estampar Código QR Oficial
  const certId = cert.id_certificado || cert.id || 'ACS-DEMO';
  const verifyUrl = `${mergedConfig.baseUrl.replace(/\/$/, '')}/${encodeURIComponent(certId)}`;

  const qrPngDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 280,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });

  const qrImage = await doc.embedPng(qrPngDataUrl);
  const qrSide = (pageHeight * (mergedConfig.qr.sizePercent || 14)) / 100;
  const qrX = (pageWidth * (mergedConfig.qr.xPercent || 82)) / 100;
  const qrY = (pageHeight * (mergedConfig.qr.yPercent || 9)) / 100;

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSide,
    height: qrSide,
  });

  // 5. Estampar código textual debajo del QR
  if (mergedConfig.codeText.enabled && certId) {
    const codeText = certId.length > 20 ? `${certId.substring(0, 18)}…` : certId;
    const codeFont = fonts[mergedConfig.codeText.fontFamily || 'regular'] || fonts.regular;
    const codeSize = mergedConfig.codeText.fontSize || 8;
    const codeWidth = codeFont.widthOfTextAtSize(codeText, codeSize);
    const codeX = qrX + (qrSide - codeWidth) / 2;
    const codeY = (pageHeight * (mergedConfig.codeText.yPercent || 5.5)) / 100;

    page.drawText(codeText, {
      x: codeX,
      y: codeY,
      size: codeSize,
      font: codeFont,
      color: hexToRgb(mergedConfig.codeText.colorHex || '#475569'),
    });
  }

  return await doc.save();
}

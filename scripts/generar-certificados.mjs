#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { read as readXlsx, utils as xlsxUtils } from 'xlsx';
import { generateCertificatePdf, DEFAULT_CERTIFICATE_CONFIG, findTemplateForEvent, fixMojibake } from '../src/lib/certificateGenerator.js';
import { isCertificatePdfEnabled } from '../src/lib/certificates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Directorios por defecto
const TEMPLATES_DIR = path.join(rootDir, 'certificados_plantillas');
const OUTPUT_DIR = path.join(rootDir, 'certificados_generados');
const CONFIG_FILE = path.join(rootDir, 'certificados_config.json');

// Crear carpetas si no existen
if (!fs.existsSync(TEMPLATES_DIR)) fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return { ...DEFAULT_CERTIFICATE_CONFIG, ...JSON.parse(raw) };
    } catch (e) {
      console.warn('⚠️  No se pudo leer certificados_config.json, usando valores por defecto.');
    }
  }
  return DEFAULT_CERTIFICATE_CONFIG;
}

function findInputExcel() {
  const possibleFiles = [
    'certificados.xlsx',
    'certificados.csv',
    'asistentes.xlsx',
    'asistentes.csv',
    'datos.xlsx',
  ];
  for (const name of possibleFiles) {
    const fullPath = path.join(rootDir, name);
    if (fs.existsSync(fullPath)) return fullPath;
  }
  return null;
}

async function loadRecordsFromExcel(filePath) {
  console.log(`📊 Leyendo registros desde: ${path.basename(filePath)}`);
  const buf = fs.readFileSync(filePath);
  const workbook = readXlsx(buf);
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = xlsxUtils.sheet_to_json(firstSheet);

  return rawRows
    .map((row, idx) => {
      // Filtro opcional: si existe columna asistio / certificado / emitir / estado
      const emitirRaw =
        row.certificado ??
        row.asistio ??
        row.asistencia ??
        row.emitir ??
        row.aprobado ??
        row.aprobada ??
        row.estado ??
        true;

      // Si viene explícitamente como 'no', 'false', '0', 'ausente', 'falto', etc. se ignora
      const debeIgnorar =
        typeof emitirRaw === 'boolean'
          ? !emitirRaw
          : /^(no|false|0|ausente|falto|faltó|desaprobado|invalido)$/i.test(String(emitirRaw).trim());

      // Si tiene columna de 'enviado', 'omitir', 'ya_hecho', 'manual', etc.
      const yaEnviado =
        row.enviado ?? row.ya_enviado ?? row.omitir ?? row.ignorar ?? false;
      const debeOmitirPorEnvioPrevio =
        typeof yaEnviado === 'boolean'
          ? yaEnviado
          : /^(si|sí|true|1|enviado|hecho|manual)$/i.test(String(yaEnviado).trim());

      if (debeIgnorar || debeOmitirPorEnvioPrevio) {
        return null;
      }

      // Normalizar nombres de columnas habituales
      const nombre =
        row.nombre_persona ||
        row.nombre ||
        row.nombres ||
        row.titular ||
        row['Nombre Completo'] ||
        (row.nombres && row.apellidos ? `${row.nombres} ${row.apellidos}` : '') ||
        `Participante ${idx + 1}`;

      const idCertificado =
        row.id_certificado ||
        row.id ||
        row.codigo ||
        row.codigo_certificado ||
        `ACS-${Date.now().toString(36).toUpperCase()}-${idx + 1}`;

      const evento = row.evento || row.nombre_evento || row['Evento'] || '';
      const fecha = row.fecha || row['Fecha'] || '';
      const horas = row.horas || row['Horas'] || '';
      const area = row.area || row['Area'] || row['Área'] || '';
      const miembro =
        row.miembro ||
        row['Miembro'] ||
        row.tipo_miembro ||
        row['Tipo de Miembro'] ||
        row.cargo ||
        row.rol ||
        row.puesto ||
        row['Cargo'] ||
        row['Rol'] ||
        '';
      const cargo = row.cargo || row.rol || row.puesto || row['Cargo'] || row['Rol'] || miembro;
      const periodo = row.periodo || row['Periodo'] || row['Período'] || '';
      const tipo = row.tipo || row.tipo_certificado || row['Tipo'] || '';

      return {
        id_certificado: String(idCertificado).trim(),
        nombre_persona: fixMojibake(String(nombre).trim()),
        evento: fixMojibake(String(evento).trim()),
        fecha: fixMojibake(String(fecha).trim()),
        horas: fixMojibake(String(horas).trim()),
        area: fixMojibake(String(area).trim()),
        miembro: fixMojibake(String(miembro).trim()),
        cargo: fixMojibake(String(cargo).trim()),
        periodo: fixMojibake(String(periodo).trim()),
        tipo: fixMojibake(String(tipo).trim()),
      };
    })
    .filter(Boolean);
}

// Cargar registros directamente desde Supabase si se solicita
async function loadRecordsFromSupabase() {
  console.log('☁️  Consultando base de datos de Supabase (tabla certificados)...');
  
  // Cargar variables de entorno si existen en .env o .env.local
  for (const envFile of ['.env.local', '.env']) {
    const envPath = path.join(rootDir, envFile);
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf-8');
        content.split('\n').forEach((line) => {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match) {
            const key = match[1];
            let value = (match[2] || '').trim();
            value = value.replace(/^['"](.*)['"]$/, '$1').trim();
            if (!process.env[key]) process.env[key] = value;
          }
        });
      } catch (e) {
        // Ignorar errores de lectura de entorno
      }
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  No se encontraron credenciales de Supabase en .env o .env.local.');
    return [];
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('certificados').select('*');

    if (error) {
      console.error('❌ Error al consultar tabla certificados en Supabase:', error.message);
      return [];
    }

    console.log(`✅ Se obtuvieron ${data?.length || 0} registros directamente desde Supabase.`);
    return (data || []).map((row) => ({
      ...row,
      nombre_persona: fixMojibake(row.nombre_persona || ''),
      area: fixMojibake(row.area || ''),
      cargo: fixMojibake(row.cargo || ''),
      miembro: fixMojibake(row.miembro || ''),
      periodo: fixMojibake(row.periodo || ''),
      evento: fixMojibake(row.evento || ''),
    }));
  } catch (err) {
    console.warn('⚠️  No se pudo conectar a Supabase:', err.message);
    return [];
  }
}

// Parsear argumentos de línea de comandos (ej: --evento "Polimeros", --archivo "nuevos.xlsx", --supabase, --force)
function parseArgs() {
  const args = process.argv.slice(2);
  let eventFilter = null;
  let customFile = null;
  let forceOverwrite = false;
  let fromSupabase = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--evento' || args[i] === '--event') {
      eventFilter = args[i + 1] || null;
      i++;
    } else if (args[i] === '--archivo' || args[i] === '--file') {
      customFile = args[i + 1] || null;
      i++;
    } else if (args[i] === '--supabase' || args[i] === '--db') {
      fromSupabase = true;
    } else if (args[i] === '--force' || args[i] === '--sobrescribir') {
      forceOverwrite = true;
    }
  }
  return { eventFilter, customFile, forceOverwrite, fromSupabase };
}

async function main() {
  console.log('\n======================================================');
  console.log('🎓 GENERADOR MASIVO DE CERTIFICADOS ACS UNMSM');
  console.log('======================================================\n');

  const { eventFilter, customFile, forceOverwrite, fromSupabase } = parseArgs();
  const config = await loadConfig();

  const excelPath = customFile ? path.resolve(rootDir, customFile) : findInputExcel();
  let records = [];

  if (fromSupabase) {
    records = await loadRecordsFromSupabase();
  } else if (excelPath) {
    records = await loadRecordsFromExcel(excelPath);
  } else {
    // Si no hay archivo Excel en la raíz, intentar consultar Supabase automáticamente
    records = await loadRecordsFromSupabase();
    if (records.length === 0) {
      console.log('ℹ️  No se encontró ningún archivo Excel (certificados.xlsx o asistentes.xlsx) en la raíz.');
      console.log('💡 Usando certificados de prueba para demostración...\n');
      records = [
      {
        id_certificado: 'ACS-REC-2026-001',
        nombre_persona: 'Gonzalo Aguilar Espinoza',
        evento: 'Reconocimiento a Miembros Activos',
        miembro: 'Miembro',
        cargo: 'Miembro',
        area: 'Voluntario de Tecnología e Informática',
        periodo: '2025 - 2026',
        fecha: '2025 - 2026',
        tipo: 'reconocimiento',
      },
      {
        id_certificado: 'ACS-REC-2026-002',
        nombre_persona: 'Breiner Smith Fuentes Bulnes',
        evento: 'Reconocimiento a la Directiva',
        miembro: 'Presidente',
        cargo: 'Presidente',
        area: 'Presidencia',
        periodo: '2025 - 2026',
        fecha: '2025 - 2026',
        tipo: 'reconocimiento',
      },
      {
        id_certificado: 'ACS-REC-2026-003',
        nombre_persona: 'Ana Lucía Morales',
        evento: 'Reconocimiento a Coordinadores',
        miembro: 'Coordinadora',
        cargo: 'Coordinadora',
        area: 'Coordinadora de Talento Humano',
        periodo: '2025 - 2026',
        fecha: '2025 - 2026',
        tipo: 'reconocimiento',
      },
      {
        id_certificado: 'ACS-REC-2026-004',
        nombre_persona: 'Valeria Castro Mendoza',
        evento: 'Reconocimiento a la Directiva',
        miembro: 'Secretaria General',
        cargo: 'Secretaria General',
        area: 'Secretaría General',
        periodo: '2025 - 2026',
        fecha: '2025 - 2026',
        tipo: 'reconocimiento',
      },
      {
        id_certificado: 'ACS-REC-2026-005',
        nombre_persona: 'Carlos Eduardo Ruiz',
        evento: 'Reconocimiento a la Directiva',
        miembro: 'Tesorero',
        cargo: 'Tesorero',
        area: 'Tesorería',
        periodo: '2025 - 2026',
        fecha: '2025 - 2026',
        tipo: 'reconocimiento',
      },
      {
        id_certificado: 'ACS-REC-2026-006',
        nombre_persona: 'Camila Sofía Paredes',
        evento: 'Reconocimiento a Secretarías',
        miembro: 'Secretaria',
        cargo: 'Secretaria',
        area: 'Secretaria de Actas y Archivo',
        periodo: '2025 - 2026',
        fecha: '2025 - 2026',
        tipo: 'reconocimiento',
      },
    ];
    }
  }

  // Filtrar por evento si se pasó el argumento --evento
  if (eventFilter) {
    console.log(`🔍 Filtrando solo certificados del evento: "${eventFilter}"`);
    const regex = new RegExp(eventFilter.trim(), 'i');
    records = records.filter((r) => regex.test(r.evento));
  }

  if (records.length === 0) {
    console.log('⚠️  No se encontraron registros que coincidan.');
    return;
  }

  // Detectar eventos únicos
  const eventosUnicos = [...new Set(records.map((r) => r.evento || 'Sin evento'))];
  console.log(`📌 Total registros a procesar: ${records.length}`);
  console.log(`🏷️  Eventos detectados (${eventosUnicos.length}):`);
  eventosUnicos.forEach((e) => console.log(`   • ${e}`));
  console.log('');

  let successCount = 0;
  let skippedCount = 0;

  for (const [idx, cert] of records.entries()) {
    try {
      // Omitir certificados que aún no tengan PDF habilitado (ej. Nanotecnología, webinars o ponencias)
      if (!isCertificatePdfEnabled(cert)) {
        skippedCount++;
        process.stdout.write(`  [${idx + 1}/${records.length}] ⏭️  [Omitido - PDF no habilitado aún]: ${cert.nombre_persona} (${cert.evento || 'Evento'})\n`);
        continue;
      }

      // Si hay varios eventos, organizarlos en subcarpetas por evento
      let targetDir = OUTPUT_DIR;
      if (eventosUnicos.length > 1 && cert.evento) {
        const safeEventFolder = cert.evento.replace(/[/\\?%*:|"<>]/g, '').trim().substring(0, 45);
        targetDir = path.join(OUTPUT_DIR, safeEventFolder);
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
      }

      // Sanitizar nombre de archivo
      const safeName = cert.nombre_persona
        .replace(/[/\\?%*:|"<>]/g, '')
        .substring(0, 50)
        .trim();
      const fileName = `Certificado - ${safeName} (${cert.id_certificado.substring(0, 8)}).pdf`;
      const outputPath = path.join(targetDir, fileName);

      // Si el PDF ya fue generado anteriormente, verificar si certificados_config.json es más reciente
      const configMtime = fs.existsSync(CONFIG_FILE) ? fs.statSync(CONFIG_FILE).mtimeMs : 0;
      const pdfMtime = fs.existsSync(outputPath) ? fs.statSync(outputPath).mtimeMs : 0;
      const isOutdated = configMtime > pdfMtime;

      if (fs.existsSync(outputPath) && !forceOverwrite && !isOutdated) {
        skippedCount++;
        process.stdout.write(`  [${idx + 1}/${records.length}] ⏭️  [Ya generado - Omitido]: ${fileName}\n`);
        continue;
      }

      // Generar el PDF
      const pdfBytes = await generateCertificatePdf({
        cert,
        config,
        projectRoot: rootDir,
      });

      fs.writeFileSync(outputPath, pdfBytes);
      successCount++;
      process.stdout.write(`  [${idx + 1}/${records.length}] ✔️ [${cert.evento || 'General'}] ${fileName}\n`);
    } catch (err) {
      console.error(`  [${idx + 1}/${records.length}] ❌ Error en ${cert.nombre_persona}:`, err.message);
    }
  }

  console.log('\n======================================================');
  console.log(`✅ ¡Completado! Nuevos generados: ${successCount} | Omitidos ya existentes: ${skippedCount}`);
  console.log(`📁 Carpeta de salida: ${path.relative(rootDir, OUTPUT_DIR)}/`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Error fatal al generar certificados:', err);
  process.exit(1);
});

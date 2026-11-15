#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Cargar variables de entorno desde .env.local o .env
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
      // Ignorar errores de lectura
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: No se encontraron credenciales de Supabase en .env o .env.local.');
  console.error('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY configuradas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Buscar la imagen local de reconocimiento.png
const possibleLocalPaths = [
  path.join(rootDir, 'certificados_plantillas', 'reconocimiento.png'),
  path.join(rootDir, 'certificados_plantillas', 'reconocimiento.jpg'),
  path.join(rootDir, 'public', 'certificados', 'plantillas', 'reconocimiento.png'),
  path.join(rootDir, 'public', 'certificados', 'reconocimiento.png'),
];

let localImagePath = null;
for (const p of possibleLocalPaths) {
  if (fs.existsSync(p)) {
    localImagePath = p;
    break;
  }
}

if (!localImagePath) {
  console.error('❌ Error: No se encontró el archivo de plantilla local reconocimiento.png');
  console.error('Verifica que el archivo esté en certificados_plantillas/reconocimiento.png');
  process.exit(1);
}

async function main() {
  console.log('\n======================================================');
  console.log('🚀 SUBIENDO PLANTILLA DE RECONOCIMIENTO A SUPABASE STORAGE');
  console.log('======================================================\n');
  console.log(`📁 Archivo local encontrado: ${path.relative(rootDir, localImagePath)}`);

  const fileBytes = fs.readFileSync(localImagePath);
  const ext = path.extname(localImagePath).toLowerCase();
  const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';

  // 1. Intentar crear o verificar el bucket 'certificados'
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const certBucketExists = buckets?.some((b) => b.name === 'certificados');
    if (!certBucketExists) {
      console.log("📦 Creando bucket 'certificados' (seguro para el servidor)...");
      await supabase.storage.createBucket('certificados', { public: false });
    }
  } catch (err) {
    // Continuar si ya existe o no hay permisos de creación directa de buckets
  }

  // 2. Subir a bucket 'certificados'
  let uploaded = false;
  try {
    const { error } = await supabase.storage
      .from('certificados')
      .upload('reconocimiento.png', fileBytes, {
        contentType,
        upsert: true,
      });

    if (!error) {
      console.log("✅ Subido exitosamente a Supabase Storage: bucket 'certificados' -> reconocimiento.png");
      uploaded = true;
    } else {
      console.warn("⚠️  Aviso en bucket 'certificados':", error.message);
    }
  } catch (e) {
    console.warn("⚠️  Error al subir a 'certificados':", e.message);
  }

  // 3. Subir también como respaldo al bucket existente 'eventos' (carpeta certificados/reconocimiento.png)
  try {
    const { error: errEventos } = await supabase.storage
      .from('eventos')
      .upload('certificados/reconocimiento.png', fileBytes, {
        contentType,
        upsert: true,
      });

    if (!errEventos) {
      console.log("✅ Subido respaldo a Supabase Storage: bucket 'eventos' -> certificados/reconocimiento.png");
      uploaded = true;
    }
  } catch (e) {
    // Ignorar si no está disponible
  }

  if (uploaded) {
    console.log('\n======================================================');
    console.log('🎉 ¡Listo! La plantilla ya está guardada en Supabase Storage.');
    console.log('🔒 Tu repositorio en GitHub sigue protegido (en .gitignore).');
    console.log('🌐 Vercel descargará la plantilla directamente desde Supabase.');
    console.log('======================================================\n');
  } else {
    console.error('\n❌ No se pudo completar la subida. Verifica tus credenciales de Supabase.');
  }
}

main().catch((err) => {
  console.error('Error fatal al subir plantilla:', err);
  process.exit(1);
});


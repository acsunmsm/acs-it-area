import { createClient } from '@supabase/supabase-js';

// Accede a las variables de entorno usando process.env
// Next.js las carga automáticamente desde .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verifica que las variables estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY deben estar definidas.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
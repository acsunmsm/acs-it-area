import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Usamos la Service Role Key para realizar operaciones con privilegios elevados en el backend
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Faltan variables de entorno para inicializar Supabase en el servidor.');
}

// Inicialización del cliente de backend puro (no persiste la sesión, ya que corre en el servidor)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  }
});

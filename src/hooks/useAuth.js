// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Asegúrate de que esta ruta sea correcta

const useAuth = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // Indica si la sesión se está cargando/verificando

  useEffect(() => {
    const getInitialSession = async () => {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error al obtener la sesión inicial en useAuth:', error);
        setSession(null);
      } else {
        setSession(session);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listener para cambios en el estado de autenticación (login, logout, token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false); // La sesión ha cambiado, ya no está "cargando"
    });

    // Limpia el listener al desmontar el componente para evitar fugas de memoria
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []); // El array vacío significa que se ejecuta solo una vez al montar

  return { session, loading };
};

export default useAuth;
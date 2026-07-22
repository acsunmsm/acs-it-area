'use client'
import { useState, useEffect } from 'react' // Importa useEffect
import { supabase } from '@/src/lib/supabaseClient' // Asegúrate de que esta ruta sea correcta
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false) // Para deshabilitar el botón durante el envío
  const [message, setMessage] = useState('')   // Para mostrar mensajes al usuario (éxito/error)
  const router = useRouter()

  // useEffect para escuchar cambios en el estado de autenticación de Supabase
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Si el evento es 'SIGNED_IN' y hay una sesión, significa que el login fue exitoso
      if (event === 'SIGNED_IN' && session) {
        console.log('Sesión detectada (SIGNED_IN), redirigiendo a /dashboard');
        router.push('/es/dashboard');
      }
      // Opcional: Si el usuario ya está logueado y visita el login, redirigir también
      // if (session && event === 'INITIAL_SESSION') {
      //   console.log('Sesión inicial detectada, redirigiendo a /dashboard');
      //   router.push('/dashboard');
      // }
    });

    // Limpiar el listener al desmontar el componente para evitar fugas de memoria
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]); // `router` como dependencia para useEffect

  const handleLogin = async () => {
    setLoading(true) // Activar estado de carga
    setMessage('')    // Limpiar mensajes previos

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setMessage(`Error al iniciar sesión: ${error.message}`);
        console.error('Error de login de Supabase:', error);
      } else {
        // Si no hay error, el intento de login fue enviado.
        // La redirección ocurrirá a través del useEffect cuando Supabase confirme el 'SIGNED_IN'.
        setMessage('Procesando inicio de sesión...');
        console.log('Intento de login enviado. Esperando confirmación de sesión...');
      }
    } catch (err) {
      // Captura cualquier otro error inesperado en la ejecución
      setMessage(`Ocurrió un error inesperado: ${err.message}`);
      console.error('Error inesperado en handleLogin:', err);
    } finally {
      // El botón se re-habilita. La redirección es manejada por el listener.
      setLoading(false); 
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Login</h1>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <button onClick={handleLogin} disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
        {message && <p className="message">{message}</p>}
        {/*
        <p style={{ marginTop: '15px' }}>
          ¿No tienes cuenta? <span 
            onClick={() => router.push('/register')} 
            style={{ color: '#0070f3', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Regístrate aquí
          </span>
        </p>*/}
      </div>
      {/* Estilos CSS */}
      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f0f2f5;
        }
        .login-box {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          gap: 15px;
          width: 300px;
          text-align: center;
        }
        h1 {
          margin-bottom: 20px;
          color: #333;
        }
        input {
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        button {
          padding: 10px 15px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.3s ease;
        }
        button:hover:not(:disabled) {
          background-color: #005bb5;
        }
        button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        .message {
          margin-top: 10px;
          font-size: 14px;
          color: #d32f2f;
        }
      `}</style>
    </div>
  )
}
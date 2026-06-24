'use client'
import { useState } from 'react'
import { supabase } from '@/src/lib/supabaseClient' // Asegúrate de que esta ruta sea correcta para tu proyecto
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false) // Para deshabilitar el botón durante la carga
  const [message, setMessage] = useState('')   // Para mostrar mensajes al usuario (éxito/error)
  const router = useRouter()

  const handleRegister = async () => {
    setLoading(true) // Activar estado de carga
    setMessage('')    // Limpiar mensajes anteriores

    try {
      // Usa supabase.auth.signUp para crear un nuevo usuario
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        // Muestra un mensaje de error si el registro falla
        setMessage(`Error al registrar: ${error.message}`)
        console.error('Error de registro de Supabase:', error)
      } else if (data.user) {
        // Registro exitoso. Si tienes la confirmación por correo, indica al usuario.
        setMessage('¡Registro exitoso! Por favor, revisa tu correo electrónico para confirmar tu cuenta y luego inicia sesión.')
        console.log('Usuario registrado:', data.user)
        // Opcional: Podrías redirigir a una página de confirmación de email si lo deseas:
        // router.push('/check-your-email');
      } else {
        // Este caso ocurre si el correo de confirmación es enviado pero 'data.user' es null
        // (por ejemplo, si el usuario ya estaba logueado o si la sesión no se establece inmediatamente).
        setMessage('Registro procesado. Revisa tu correo para confirmar. Si ya estabas logueado, tu sesión podría haberse actualizado.')
        console.warn('Registro completado sin error pero sin usuario en la data:', data)
      }
    } catch (err) {
      // Captura cualquier otro error inesperado
      setMessage(`Ocurrió un error inesperado: ${err.message}`)
      console.error('Error inesperado en handleRegister:', err)
    } finally {
      setLoading(false) // Desactivar estado de carga
    }
  }

  // Función para redirigir al usuario a la página de login si ya tienen una cuenta
  const goToLogin = () => {
    router.push('/login')
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Registrar Usuario</h1>
        <input
          placeholder="Email"
          type="email" // Usar type="email" para mejor validación nativa del navegador
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading} // Deshabilitar mientras carga
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading} // Deshabilitar mientras carga
        />
        <button onClick={handleRegister} disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar'} {/* Texto del botón dinámico */}
        </button>
        {message && <p className="message">{message}</p>} {/* Mostrar mensajes al usuario */}
        {/* <button onClick={goToLogin} disabled={loading} style={{ marginTop: '10px' }}>
          Volver a iniciar sesión
        </button> */}
      </div>
      {/* Estilos CSS, considera moverlos a un archivo CSS global o module.css */}
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
          color: #333; /* Color predeterminado */
        }
        .message.error { /* Puedes añadir una clase para errores específicos */
          color: #d32f2f;
        }
      `}</style>
    </div>
  )
}
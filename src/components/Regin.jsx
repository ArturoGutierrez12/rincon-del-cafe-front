// src/pages/Login.jsx
import { RegistrerForm } from '../components/RegistrerForm.jsx'
import './Login.css'
import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'

export default function Regin() {
  const navigate = useNavigate()          // dentro del componente
  const { login } = useAuth()
  const tipo= 'enviar'
  const alRegistrar = (usuario) => {
  console.log('Sesión iniciada:', usuario)
  login(usuario)
  navigate('/')
  }

  return (
    <main className="login-pagina">
      <div className="login-tarjeta">
        <button
          type="button"
          className="login-cerrar"
          aria-label="Volver a la página principal"
          onClick={() => navigate('/')}
        >
          ✕
        </button>
        <h1>Registrarse</h1>
        <p className="login-sub">Bienvenido a El Rincón del Café</p>
        <RegistrerForm onExito={alRegistrar} />

      </div>
    </main>
  )
}

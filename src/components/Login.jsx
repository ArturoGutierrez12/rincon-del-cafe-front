// src/pages/Login.jsx
import { FormularioLogin } from '../components/FormularioLogin.jsx'
import './Login.css'
import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'


export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const alIniciarSesion = (usuario) => {
  login(usuario)
  console.log('Sesión iniciada:', usuario)
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
        <h1>Iniciar sesión</h1>
        <p className="login-sub">Bienvenido de vuelta a El Rincón del Café</p>
        <FormularioLogin onExito={alIniciarSesion} />

      </div>
    </main>
  ) 
}

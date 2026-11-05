// src/components/FormularioLogin.jsx
import { useState } from 'react'
import { CampoFormulario } from './CampoFormulario.jsx'
import { iniciarSesion } from '../components/auth.js'
import { useNavigate } from 'react-router'
// onExito: función que se ejecuta cuando el backend acepta el login.
// Así este componente no depende del router: la página decide qué hacer después.
export function FormularioLogin({ onExito }) {
  const [datos, setDatos] = useState({ usuario: '', contrasena: '' })
  const [errores, setErrores] = useState({}) // errores por campo
  const [errorServidor, setErrorServidor] = useState('') // error que manda la API
  const [enviando, setEnviando] = useState(false)
  const [Registrando, setRegistrando] = useState(false)
  const [verContrasena, setVerContrasena] = useState(false)
  const navigate = useNavigate()
  // Un solo handler para todos los campos: usa el atributo name del input.
  const cambiar = (e) => {
    const { name, value } = e.target
    setDatos((prev) => ({ ...prev, [name]: value }))
  }

  const validar = () => {
    const nuevos = {}
    if (!datos.usuario.trim()) nuevos.usuario = 'Escribe tu usuario'
    if (!datos.contrasena) nuevos.contrasena = 'Escribe tu contraseña'
    return nuevos
  }

  const enviar = async (e) => {
    e.preventDefault() // evita que el navegador recargue la página
    setErrorServidor('')

    const nuevos = validar()
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return
    setEnviando(true)
    try {
        const respuesta = await iniciarSesion({
          usuario: datos.usuario.trim(),
          contrasena: datos.contrasena,
        })
  onExito?.({ nombre: datos.usuario.trim(), ...respuesta.usuario })
    } catch (err) {
      setErrorServidor(err.message)
    } finally {
      setEnviando(false)
    }
  
  }

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <CampoFormulario
        etiqueta="Usuario"
        nombre="usuario"
        tipo="text"
        valor={datos.usuario}
        onChange={cambiar}
        error={errores.usuario}
        autoComplete="username"
      />

      <CampoFormulario
        etiqueta="Contraseña"
        nombre="contrasena"
        tipo={verContrasena ? 'text' : 'password'}
        valor={datos.contrasena}
        onChange={cambiar}
        error={errores.contrasena}
        autoComplete="current-password"
      />

      <label className="check-ver">
        <input
          type="checkbox"
          checked={verContrasena}
          onChange={(e) => setVerContrasena(e.target.checked)}
        />
        Mostrar contraseña
      </label>

      {errorServidor && (
        <p className="form-error" role="alert">
          {errorServidor}
        </p>
      )}
      {errorServidor && <p role="alert">{errorServidor}</p>}
      
      <button type="submit" className="btn btn-gold" disabled={enviando}>
        {enviando ? 'Entrando…' : 'Iniciar sesión'}
      </button>
      <button type="button" className="btn btn-gold" onClick={() => navigate('/register')}>
        {'¿No tienes cuenta? Registrate'}
      </button>
    </form>
  )
}

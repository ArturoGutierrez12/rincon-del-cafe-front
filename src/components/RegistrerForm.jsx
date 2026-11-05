import { useState } from 'react'
import { CampoFormulario } from './CampoFormulario.jsx'
import { registrarUsuario } from '../components/auth.js'

export function RegistrerForm({ onExito }) {
  const [datos, setDatos] = useState({ usuario: '', contrasena: '', confirmar: '' })
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [verContrasena, setVerContrasena] = useState(false)

  const cambiar = (e) => {
    const { name, value } = e.target
    setDatos((prev) => ({ ...prev, [name]: value }))
  }

  const validar = () => {
    const nuevos = {}
    if (datos.usuario.trim().length < 3) nuevos.usuario = 'Mínimo 3 caracteres'
    if (datos.contrasena.length < 8) nuevos.contrasena = 'Mínimo 8 caracteres'
    if (datos.confirmar !== datos.contrasena) nuevos.confirmar = 'Las contraseñas no coinciden'
    return nuevos
  }

  const enviar = async (e) => {
    e.preventDefault()
    setErrorServidor('')

    const nuevos = validar()
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    setEnviando(true)
    try {
      const respuesta = await registrarUsuario({
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
        placeholder="Tu nombre de usuario"
      />
      <CampoFormulario
        etiqueta="Contraseña"
        nombre="contrasena"
        tipo={verContrasena ? 'text' : 'password'}
        valor={datos.contrasena}
        onChange={cambiar}
        error={errores.contrasena}
        autoComplete="new-password"
      />
      <CampoFormulario
        etiqueta="Confirmar contraseña"
        nombre="confirmar"
        tipo={verContrasena ? 'text' : 'password'}
        valor={datos.confirmar}
        onChange={cambiar}
        error={errores.confirmar}
        autoComplete="new-password"
      />

      <label className="check-ver">
        <input
          type="checkbox"
          checked={verContrasena}
          onChange={(e) => setVerContrasena(e.target.checked)}
        />
        Mostrar contraseña
      </label>

      {errorServidor && <p className="form-error" role="alert">{errorServidor}</p>}

      <button type="submit" className="btn btn-gold" disabled={enviando}>
        {enviando ? 'Creando…' : 'Crear cuenta'}
      </button>
    </form>
  )
}
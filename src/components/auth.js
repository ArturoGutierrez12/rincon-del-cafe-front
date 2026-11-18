// src/api/auth.js
// Cambia esta URL por la que te entregue el backend.
import { API } from './config.js'
import { medirApi, registrarAutenticacion } from '../metricas_backend.js'
const URL_LOGIN = `${API}/usuarios/login.php`

export async function iniciarSesion({ usuario, contrasena }) {
  const r = await medirApi(URL_LOGIN, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: usuario, password: contrasena }),
  })
  

 registrarAutenticacion(r)
  const { res, data } = r

  if (!res || !res.ok || data?.ok === false) {
    throw new Error(data?.mensaje || 'No se pudo iniciar sesión. Intenta de nuevo.')
  }

  return data
}

const URL_REGISTRO = `${API}/usuarios/registro.php`
//const res = await fetch(
export async function registrarUsuario({ usuario, contrasena }) {
  const r = await medirApi(URL_REGISTRO, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: usuario, password: contrasena }),
  })

    registrarAutenticacion(r)
    const { res, data } = r

  if (!res || !res.ok || data?.ok === false) {
    throw new Error(data?.mensaje || 'No se pudo crear la cuenta. Intenta de nuevo.')
  }

  return data
}
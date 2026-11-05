// src/components/ventasApi.js
import { API } from './config.js'
const API_VENTAS = `${API}/ventas`

async function procesarRespuesta(res) {
  const data = await res.json().catch(() => ({}))

  if (!res.ok || data.ok === false) {
    throw new Error(data.mensaje || data.error || 'Error al finalizar la compra')
  }

  return data
}

export async function finalizarCompra(idUsuario) {
  const res = await fetch(`${API_VENTAS}/finalizar.php`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_usuario: idUsuario }),
  })

  return procesarRespuesta(res)
}
import { API } from './config.js'
import { medirApi, iniciarMedicionCompra, procesarRespuestaCompra } from '../metricas_backend.js'

const API_VENTAS = `${API}/ventas`

export async function finalizarCompra(idUsuario, metodoPago) {
  const t0 = iniciarMedicionCompra()

  const { res, data } = await medirApi(`${API_VENTAS}/finalizar.php`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_usuario: idUsuario, metodo_pago: metodoPago }),
  })

  const ok = !!(res && res.ok && data?.ok === true)

  // M2: ¿el backend guardó exactamente el método que se envió?
  const metodoGuardado = ok && data.venta?.metodo_pago === metodoPago

  procesarRespuestaCompra(t0, metodoPago, {
    data: {
      ...(data || {}),
      ok,
      verificacion: ok
        ? { metodo_pago_ok: metodoGuardado, pedido_ok: true, inventario_ok: true }
        : undefined,
    },
  })

  if (!ok) throw new Error(data?.mensaje || 'Error al finalizar la compra')
  return data
}
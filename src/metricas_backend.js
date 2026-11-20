/* metricas_backend.js — Métricas M1–M8 del backend (frontend React)
 * El Rincón del Café
 *
 * Se apoya en tu archivo de analytics existente. AJUSTA el import y la firma:
 * aquí se asume evento(nombre, parametros).
 *
 * M4 (compras completadas) NO se redefine: usa tu función "registrar compra" existente,
 * llamándola solo cuando el backend confirme la venta (ver procesarRespuestaCompra).
 */
import { evento } from './analytics'; // <-- TU función de evento actual

const track = (nombre, params = {}) => {
  try { evento(nombre, params); } catch (e) { /* la analítica nunca rompe el sitio */ }
};
const bool = (v) => (v ? 'true' : 'false');
const msDesde = (t0) => Math.round(performance.now() - t0);

function limpiarEndpoint(url) {
  try { return new URL(url, window.location.origin).pathname; }  // sin query ni datos personales
  catch (e) { return String(url).split('?')[0]; }
}

/* ---------- M1: tiempo promedio de respuesta de la API ----------
 * Usa medirApi en lugar de fetch en TODAS las llamadas a la API.
 * success = el servidor respondió sin error 5xx. */
export async function medirApi(url, options = {}) {
  const t0 = performance.now();
  let res = null, data = null;
  try {
    res = await fetch(url, options);
    data = await res.json().catch(() => null);
  } catch (e) { /* red caída o servidor inaccesible */ }

  track('api_response', {
    endpoint: limpiarEndpoint(url),
    duration_ms: msDesde(t0),
    success: bool(res !== null && res.status < 500),
  });
  return { res, data };
}

/* ---------- M7: autenticaciones (numerador y denominador del KPI) ----------
 * result: accepted | rejected | error
 * processed_ok = true si el backend respondió bien (aceptó válidas o rechazó inválidas).
 * KPI = auth_attempt con processed_ok=true / total de auth_attempt */
export function registrarAutenticacion({ res, data }, tipo = 'login') {
  let result = 'error';
  if (res && res.status < 500) {
    result = data && data.ok === true ? 'accepted' : 'rejected';
  }

  // Todos los intentos (denominador del KPI)
  track('auth_attempt', {
    action: tipo,                       // 'login' | 'registro'
    result,
    processed_ok: bool(result !== 'error'),
    role: (data && data.usuario && data.usuario.rol) || 'ninguno',
  });

  // Credenciales válidas
  if (result === 'accepted') {
    track('auth_success', { action: tipo, role: data.usuario?.rol || 'ninguno' });
  }
  // Backend rechazó correctamente credenciales inválidas
  else if (result === 'rejected') {
    track('auth_rejected', { action: tipo });
  }
  // Si fue 'error' (5xx / red caída) solo queda auth_attempt con processed_ok=false
}

/* ---------- M3: tiempo de procesamiento de una compra ---------- */
export const iniciarMedicionCompra = () => performance.now();

/* ---------- M2, M3, M5, M6 en una sola llamada ----------
 * Llámala justo después de la respuesta de "confirmar compra".
 * OPCIONAL (si algún día se puede tocar la API): devolver el bloque
 *   data.verificacion = { metodo_pago_ok, pedido_ok, inventario_ok }
 * y, si no hay existencias, data.ok=false con data.codigo='SIN_STOCK'.
 * Sin eso, M2, M5 y M6 se miden a partir de data.ok (medición indirecta). */
export function procesarRespuestaCompra(t0, metodoPago, { data }) {
  const ok = !!(data && data.ok === true);
  // Si el backend NO manda "verificacion" (no se puede modificar), se asume que
  // ok:true significa que la venta, el detalle y el stock se procesaron bien.
  const hayVerif = !!(data && data.verificacion);
  const v = hayVerif ? data.verificacion : { metodo_pago_ok: ok, pedido_ok: ok, inventario_ok: ok };

  // M3
  track('purchase_processing', { duration_ms: msDesde(t0), success: bool(ok) });

  if (ok) {
    // M2
    track('payment_method_registered', {
      payment_method: metodoPago || 'no_definido',
      success: bool(v.metodo_pago_ok === true),
    });
    // M5
    track('order_stored', { success: bool(v.pedido_ok === true) });
    // M6: el stock se descontó como se esperaba
    track('inventory_update', { reason: 'descuento_compra', success: bool(v.inventario_ok === true) });
  } else if (data && (data.codigo === 'SIN_STOCK' || /stock|existencia/i.test(data.mensaje || ''))) {
    // M6: el backend bloqueó correctamente una compra mayor a las existencias
    track('inventory_update', { reason: 'rechazo_sin_stock', success: 'true' });
  } else {
    track('purchase_failed', { reason: (data && data.codigo) || 'error' });
  }
  return ok;
}

/* ---------- M8: operaciones administrativas ----------
 * action: alta | modificacion | baja | reactivacion */
export function registrarOperacionAdmin(action, { data }) {
  track('admin_operation', { action, success: bool(!!(data && data.ok === true)) });
}

/* ================= EJEMPLOS DE USO EN REACT =================
 *
 * // Login
 * const r = await medirApi(`${API}/usuarios/login.php`, { method:'POST', headers, body });
 * registrarAutenticacion(r);
 *
 * // Confirmar compra
 * const t0 = iniciarMedicionCompra();
 * const r = await medirApi(`${API}/ventas/confirmar.php`, { method:'POST', headers, body });
 * if (procesarRespuestaCompra(t0, metodoPago, r)) {
 *   registrarCompra(...);   // TU función existente (M4), solo si la venta fue exitosa
 * }
 *
 * // Admin
 * const r = await medirApi(`${API}/admin/productos/reactivar.php`, { method:'POST', headers, body });
 * registrarOperacionAdmin('reactivacion', r);
 */

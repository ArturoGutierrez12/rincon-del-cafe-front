import { API } from './config.js'


async function procesarRespuesta(res) {
  const data = await res.json().catch(() => ({}))

  if (!res.ok || data.ok === false) {
    throw new Error(
      data.mensaje || 'Ocurrió un error en la solicitud'
    )
  }

  return data
}

export async function obtenerVentas() {
  const res = await fetch(
    `${API}/admin/ventas/listar.php`,
    {
      credentials: 'include',
    }
  )

  return procesarRespuesta(res)
}

export async function obtenerDetalleVenta(idVenta) {
  const res = await fetch(
    `${API}/admin/ventas/detalle.php?id_venta=${idVenta}`,
    {
      credentials: 'include',
    }
  )

  return procesarRespuesta(res)
}

export async function obtenerProductosVendidos() {
  const res = await fetch(
    `${API}/admin/ventas/productos_vendidos.php`,
    {
      credentials: 'include',
    }
  )

  return procesarRespuesta(res)
}

export async function obtenerProductos() {
  const res = await fetch(
    `${API}/productos/listar.php`
  )

  return procesarRespuesta(res)
}

export async function crearProducto(producto) {
  const res = await fetch(
    `${API}/admin/productos/crear.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(producto),
    }
  )

  return procesarRespuesta(res)
}

export async function modificarProducto(producto) {
  const res = await fetch(
    `${API}/admin/productos/modificar.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(producto),
    }
  )

  return procesarRespuesta(res)
}

export async function desactivarProducto(idProducto) {
  const res = await fetch(
    `${API}/admin/productos/eliminar.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_producto: idProducto,
      }),
    }
  )

  return procesarRespuesta(res)
}

export async function reactivarProducto(idProducto) {
  const res = await fetch(
    `${API}/admin/productos/reactivar.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_producto: idProducto,
      }),
    }
  )

  return procesarRespuesta(res)
}
import { API } from './config.js'
const API_CARRITO = `${API}/carrito`

async function procesarRespuesta(res) {
  const data = await res.json().catch(() => ({}))

  if (!res.ok || data.ok === false) {
    throw new Error(
      data.mensaje ||
      data.error ||
      'Error al procesar el carrito'
    )
  }

  return data
}


export async function obtenerCarrito(idUsuario) {
  const res = await fetch(
    `${API_CARRITO}/obtener.php?id_usuario=${idUsuario}`,
    {
      credentials: 'include',
    }
  )

  const data = await procesarRespuesta(res)

  const carrito = (data.productos || []).map((item) => ({
    producto: {
      id_producto: Number(item.id_producto),
      nombre: item.nombre,
      precio: Number(item.precio),
    },
    cantidad: Number(item.cantidad),
  }))

  return {
    ...data,
    carrito,
    total: Number(data.total || 0),
  }
}


export async function agregarProductoCarrito({
  idUsuario,
  idProducto,
  cantidad = 1,
}) {
  const res = await fetch(
    `${API_CARRITO}/agregar.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_usuario: idUsuario,
        id_producto: idProducto,
        cantidad,
      }),
    }
  )

  return procesarRespuesta(res)
}


export async function actualizarProductoCarrito({
  idUsuario,
  idProducto,
  cantidad,
}) {
  const res = await fetch(
    `${API_CARRITO}/actualizar.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_usuario: idUsuario,
        id_producto: idProducto,
        cantidad,
      }),
    }
  )

  return procesarRespuesta(res)
}


export async function eliminarProductoCarrito({
  idUsuario,
  idProducto,
}) {
  const res = await fetch(
    `${API_CARRITO}/eliminar.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_usuario: idUsuario,
        id_producto: idProducto,
      }),
    }
  )

  return procesarRespuesta(res)
}


export async function vaciarCarritoDB(idUsuario) {
  const res = await fetch(
    `${API_CARRITO}/vaciar.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_usuario: idUsuario,
      }),
    }
  )

  return procesarRespuesta(res)
}
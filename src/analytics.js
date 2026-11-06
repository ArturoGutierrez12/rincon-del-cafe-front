export function evento(nombre, parametros = {}) {
  window.gtag?.('event', nombre, parametros)
}

export const itemGA = (producto, cantidad = 1) => ({
  item_id: String(producto.id_producto),
  item_name: producto.nombre,
  price: Number(producto.precio),
  quantity: Number(cantidad),
})

export function registrarCompra({idVenta,total,productos}) {
  if (!idVenta) {
    console.warn('No se registró purchase porque falta idVenta')
    return
  }

  evento('purchase', {
    transaction_id: String(idVenta),
    value: Number(total),
    currency: 'MXN',
    items: productos.map((item) =>
      itemGA(item.producto, item.cantidad)
    ),
  })
}


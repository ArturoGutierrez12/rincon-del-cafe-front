export function evento(nombre, parametros = {}) {
  window.gtag?.('event', nombre, parametros)
}

// Formato de producto que entiende Google Analytics
export const itemGA = (producto, cantidad = 1) => ({
  item_id: String(producto.id_producto),
  item_name: producto.nombre,
  price: Number(producto.precio),
  quantity: cantidad,
})
import { Link } from 'react-router'
import { useAuth } from './context/AuthContext.jsx'
import './App.css'

export function CarritoLateral({ carrito, cambiarCantidad, quitarDelCarrito, onClose }) {
  const { usuario } = useAuth()

  const total = carrito.reduce(
    (suma, item) => suma + Number(item.producto.precio) * item.cantidad,
    0
  )

  return (
    <aside className="carrito-lateral">
      <div className="carrito-header">
        <h3>Tu carrito</h3>
        <button onClick={onClose}>✕</button>
      </div>

      {carrito.length === 0 ? (
        <p>Tu carrito está vacío</p>
      ) : (
        <ul className="carrito-items">
          {carrito.map((item) => (
            <li key={item.producto.id_producto} className="carrito-item">
              <img
                src={`/PRODUCTOS/${item.producto.id_categoria}/${item.producto.id_producto}.png`}
                alt={item.producto.nombre}
                className="carrito-item-imagen"
              />
              <span className="carrito-item-nombre">{item.producto.nombre}</span>

              <div className="carrito-item-cantidad">
                <button onClick={() => cambiarCantidad(item.producto.id_producto, item.cantidad - 1)}>−</button>
                <span>{item.cantidad}</span>
                <button onClick={() => cambiarCantidad(item.producto.id_producto, item.cantidad + 1)}>+</button>
              </div>

              <span className="carrito-item-subtotal">
                ${(Number(item.producto.precio) * item.cantidad).toFixed(2)}
              </span>

              <button className="carrito-item-eliminar" onClick={() => quitarDelCarrito(item.producto.id_producto)}>
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="carrito-total">
        <strong>Total: ${total.toFixed(2)}</strong>
      </div>

      {carrito.length > 0 && (
        usuario ? (
          <Link to="/checkout" className="btn btn-gold">Proceder al pago</Link>
        ) : (
          <>
            <p className="carrito-aviso">Inicia sesión o regístrate para guardar tu carrito y comprar.</p>
            <Link to="/login" className="btn btn-gold">Iniciar sesión</Link>
          </>
        )
      )}
    </aside>
  )
}
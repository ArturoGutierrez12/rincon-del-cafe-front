// src/pages/Ticket.jsx
// Ticket de la compra. Recibe el pedido por el estado de la navegación.
import { useEffect } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { useCarrito } from './context/CarritoContext.jsx'
import './Checkout.css'

const dinero = (n) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

export default function Ticket() {
  const { state } = useLocation()
  const { cargarCarrito } = useCarrito()
  const pedido = state?.pedido

  useEffect(() => {
    if (pedido) cargarCarrito()
  }, [pedido, cargarCarrito])
    console.log('PEDIDO:', pedido)
  if (!pedido) return <Navigate to="/" replace />

  return (
    <main className="ticket-pagina">
      <article className="ticket">
        <h1>El Rincón del Café</h1>
        <p className="ticket-sub">Ticket de compra</p>

        <dl className="ticket-datos">
          <div><dt>Folio</dt><dd>{pedido.folio}</dd></div>
          <div><dt>Fecha</dt><dd>{new Date(pedido.fecha).toLocaleString('es-MX')}</dd></div>
          <div><dt>Cliente</dt><dd>{pedido.cliente}</dd></div>
        </dl>

        <table className="ticket-tabla">
          <thead>
            <tr><th>Producto</th><th>Cant.</th><th>Importe</th></tr>
          </thead>
          <tbody>
            {pedido.items.map((i) => (
              <tr key={i.id_producto}>
                <td>{i.nombre}</td>
                <td>{i.cantidad}</td>
                <td>{dinero(i.precio * i.cantidad)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="ticket-total">
          <span>Total</span>
          <strong>{dinero(pedido.total)}</strong>
        </p>

        <h2>Envío a</h2>
        <p>
          {pedido.envio.nombre}<br />
          {pedido.envio.direccion}, C.P. {pedido.envio.cp}<br />
          Tel. {pedido.envio.telefono}
        </p>

        <h2>Pago</h2>
        <p>{pedido.pagoEtiqueta}</p>
        {pedido.pago === 'transferencia' && (
          <p className="ticket-nota">
            Datos de ejemplo: Banco Demo · CLABE 000 000 000000000000.
          </p>
        )}
      </article>

      <div className="ticket-acciones no-imprimir">
        <button className="btn btn-gold" onClick={() => window.print()}>Imprimir ticket</button>
        <Link to="/" className="btn btn-claro">Volver a la tienda</Link>
      </div>
    </main>
  )
}

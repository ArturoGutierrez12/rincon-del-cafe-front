// src/pages/admin/AdminVentas.jsx
// Lista de ventas (cuenta + venta) y detalle de cada una.
import { useEffect, useState } from 'react'
import { obtenerVentas, obtenerDetalleVenta } from '../components/adminApi.js'
import { comoLista, dinero, fechaLegible, primero } from '../components/utilidades.js'

export default function AdminVentas() {
  const [ventas, setVentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [seleccion, setSeleccion] = useState(null) // venta abierta en el detalle
  const [detalle, setDetalle] = useState(null)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)
  const [errorDetalle, setErrorDetalle] = useState('')

  useEffect(() => {
    async function cargar() {
      try {
        const data = await obtenerVentas()
        console.log('ADMIN VENTAS:', data)
        setVentas(comoLista(data, 'ventas'))
      } catch (e) {
        setError(e.message)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const verDetalle = async (venta) => {
    setSeleccion(venta)
    setDetalle(null)
    setErrorDetalle('')
    setCargandoDetalle(true)
    try {
      const data = await obtenerDetalleVenta(primero(venta, 'id_venta', 'id'))
      console.log('ADMIN DETALLE VENTA:', data)
      setDetalle(data)
    } catch (e) {
      setErrorDetalle(e.message)
    } finally {
      setCargandoDetalle(false)
    }
  }

  const sumaTotal = ventas.reduce((s, v) => s + Number(primero(v, 'total', 'monto') ?? 0), 0)
  const lineas = detalle ? comoLista(detalle, 'detalle', 'productos', 'items', 'detalles') : []

  return (
    <section>
      <div className="admin-resumen">
        <div><span>Ventas</span><strong>{ventas.length}</strong></div>
        <div><span>Total vendido</span><strong>{dinero(sumaTotal)}</strong></div>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}
      {cargando && <p className="admin-vacio">Cargando ventas…</p>}

      {!cargando && !error && (
        <div className="admin-scroll">
          <table className="admin-tabla">
            <thead>
              <tr>
                <th>Venta</th>
                <th>Cuenta</th>
                <th>Fecha</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v, i) => {
                const id = primero(v, 'id_venta', 'id')
                return (
                  <tr key={id ?? i}>
                    <td>#{id}</td>
                    <td>{primero(v, 'usuario', 'nombre', 'nombre_usuario', 'cuenta', 'id_usuario') ?? '—'}</td>
                    <td>{fechaLegible(primero(v, 'fecha', 'fecha_venta', 'created_at'))}</td>
                    <td>{dinero(primero(v, 'total', 'monto'))}</td>
                    <td className="admin-acciones">
                      <button onClick={() => verDetalle(v)}>Ver detalle</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {ventas.length === 0 && <p className="admin-vacio">Todavía no hay ventas.</p>}
        </div>
      )}

      {seleccion && (
        <div
          className="admin-modal"
          onClick={(e) => e.target === e.currentTarget && setSeleccion(null)}
        >
          <div className="admin-modal-panel">
            <h2>Venta #{primero(seleccion, 'id_venta', 'id')}</h2>
            <p className="admin-sub">
              Cuenta: {primero(seleccion, 'usuario', 'nombre', 'nombre_usuario', 'cuenta', 'id_usuario') ?? '—'}
              {' · '}
              {fechaLegible(primero(seleccion, 'fecha', 'fecha_venta', 'created_at'))}
            </p>

            {cargandoDetalle && <p className="admin-vacio">Cargando detalle…</p>}
            {errorDetalle && <p className="admin-error" role="alert">{errorDetalle}</p>}

            {detalle && (
              <div className="admin-scroll">
                <table className="admin-tabla">
                  <thead>
                    <tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr>
                  </thead>
                  <tbody>
                    {lineas.map((l, i) => {
                      const cantidad = Number(primero(l, 'cantidad') ?? 0)
                      const precio = primero(l, 'precio_unitario', 'precio')
                      const subtotal = primero(l, 'subtotal') ?? Number(precio ?? 0) * cantidad
                      return (
                        <tr key={primero(l, 'id_producto') ?? i}>
                          <td>{primero(l, 'nombre', 'producto', 'nombre_producto') ?? '—'}</td>
                          <td>{cantidad}</td>
                          <td>{dinero(precio)}</td>
                          <td>{dinero(subtotal)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {lineas.length === 0 && <p className="admin-vacio">Esta venta no trae productos.</p>}
              </div>
            )}

            <p className="admin-total">
              Total: <strong>{dinero(primero(seleccion, 'total', 'monto'))}</strong>
            </p>

            <div className="admin-modal-botones">
              <button className="btn btn-claro" onClick={() => setSeleccion(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

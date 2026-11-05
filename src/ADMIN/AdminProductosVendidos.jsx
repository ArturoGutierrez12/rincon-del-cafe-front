// src/pages/admin/AdminProductosVendidos.jsx
// Ranking de productos vendidos.
import { useEffect, useState } from 'react'
import { obtenerProductosVendidos } from '../components/adminApi.js'
import { comoLista, dinero, primero } from '../components/utilidades.js'

export default function AdminProductosVendidos() {
  const [filas, setFilas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargar() {
      try {
        const data = await obtenerProductosVendidos()
        console.log('ADMIN PRODUCTOS VENDIDOS:', data)
        setFilas(comoLista(data, 'productos', 'productos_vendidos', 'vendidos'))
      } catch (e) {
        setError(e.message)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const cantidadDe = (f) => Number(primero(f, 'cantidad_vendida', 'total_vendido', 'unidades', 'cantidad') ?? 0)
  const ingresosDe = (f) => primero(f, 'ingresos', 'total', 'importe', 'subtotal')

  // Los más vendidos primero
  const ordenadas = [...filas].sort((a, b) => cantidadDe(b) - cantidadDe(a))
  const totalUnidades = filas.reduce((s, f) => s + cantidadDe(f), 0)

  return (
    <section>
      <div className="admin-resumen">
        <div><span>Productos distintos</span><strong>{filas.length}</strong></div>
        <div><span>Unidades vendidas</span><strong>{totalUnidades}</strong></div>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}
      {cargando && <p className="admin-vacio">Cargando…</p>}

      {!cargando && !error && (
        <div className="admin-scroll">
          <table className="admin-tabla">
            <thead>
              <tr><th>#</th><th>Producto</th><th>Unidades</th><th>Ingresos</th></tr>
            </thead>
            <tbody>
              {ordenadas.map((f, i) => (
                <tr key={primero(f, 'id_producto') ?? i}>
                  <td>{i + 1}</td>
                  <td>{primero(f, 'nombre', 'producto', 'nombre_producto') ?? '—'}</td>
                  <td>{cantidadDe(f)}</td>
                  <td>{ingresosDe(f) === undefined ? '—' : dinero(ingresosDe(f))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filas.length === 0 && <p className="admin-vacio">Todavía no hay productos vendidos.</p>}
        </div>
      )}
    </section>
  )
}

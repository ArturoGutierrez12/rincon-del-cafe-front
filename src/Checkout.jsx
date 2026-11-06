// src/pages/Checkout.jsx
// Formulario de envío + método de pago simple. Al confirmar, manda al ticket.
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from './context/AuthContext.jsx'
import { useCarrito } from './context/CarritoContext.jsx'
import { CampoFormulario } from './components/CampoFormulario.jsx'
import './Checkout.css' // (los estilos de .formulario y .campo vienen de Login.css)
import { finalizarCompra } from './components/ventasApi.js' // ajusta la ruta a donde lo tengas


// Métodos de pago sencillos y simulados. No se piden datos de tarjeta.
const PAGOS = [
  {
    id: 'efectivo',
    etiqueta: 'Efectivo al recibir',
    detalle: 'Pagas al repartidor cuando llegue tu pedido.',
  },
  {
    id: 'transferencia',
    etiqueta: 'Transferencia',
    detalle: 'El ticket mostrará datos de ejemplo. No se hace ningún cobro real.',
  },
]

const dinero = (n) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

export default function Checkout() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { carrito, total, cargandoCarrito } = useCarrito()
  const [enviando, setEnviando] = useState(false)
  const [errorServidor, setErrorServidor] = useState('')
  const [datos, setDatos] = useState({
    nombre: usuario?.nombre ?? '',
    telefono: '',
    direccion: '',
    cp: '',
  })
  const [pago, setPago] = useState('efectivo')
  const [errores, setErrores] = useState({})

if (!usuario) return <Navigate to="/login" replace />
if (cargandoCarrito) return <p>Cargando pedido…</p>
if (carrito.length === 0) return <Navigate to="/" replace />
  // Sin sesión o sin productos no hay nada que comprar
  if (!usuario) return <Navigate to="/login" replace />
  if (carrito.length === 0) return <Navigate to="/" replace />

  const cambiar = (e) => {
    const { name, value } = e.target
    setDatos((prev) => ({ ...prev, [name]: value }))
  }

  const validar = () => {
    const nuevos = {}
    if (!datos.nombre.trim()) nuevos.nombre = 'Escribe tu nombre'
    if (!/^\d{10}$/.test(datos.telefono)) nuevos.telefono = 'Deben ser 10 dígitos'
    if (!datos.direccion.trim()) nuevos.direccion = 'Escribe tu dirección'
    if (!/^\d{5}$/.test(datos.cp)) nuevos.cp = 'Deben ser 5 dígitos'
    return nuevos
  }

  const confirmar = async (e) => {
  e.preventDefault()
  const nuevos = validar()
  setErrores(nuevos)
  if (Object.keys(nuevos).length > 0) return

  setEnviando(true)
  setErrorServidor('')
  try {
    const resultado = await finalizarCompra(usuario.id_usuario)

    const pedido = {
  folio: resultado.id_venta
    ? `RC-${resultado.id_venta}`
    : 'RC-' + Date.now().toString().slice(-8),
  fecha: new Date().toISOString(),
  cliente: usuario.nombre,
  envio: {
    nombre: datos.nombre.trim(),
    telefono: datos.telefono,
    direccion: datos.direccion.trim(),
    cp: datos.cp,
  },
  pago,
  pagoEtiqueta: PAGOS.find((p) => p.id === pago).etiqueta,
  items: carrito.map(({ producto, cantidad }) => ({
    id_producto: producto.id_producto,
    nombre: producto.nombre,
    precio: Number(producto.precio),
    cantidad,
  })),
  total,
}
    navigate('/ticket', { state: { pedido } })
  } catch (error) {
    setErrorServidor(error.message)
    setEnviando(false)
  }
}

  return (
    <main className="checkout-pagina">
      <Link to="/" className="checkout-volver">← Volver a la tienda</Link>

      <div className="checkout-grid">
        <form className="checkout-tarjeta formulario" onSubmit={confirmar} noValidate>
          <h1>Datos de envío</h1>

          <CampoFormulario
            etiqueta="Nombre completo"
            nombre="nombre"
            valor={datos.nombre}
            onChange={cambiar}
            error={errores.nombre}
            autoComplete="name"
          />
          <CampoFormulario
            etiqueta="Teléfono (10 dígitos)"
            nombre="telefono"
            tipo="tel"
            valor={datos.telefono}
            onChange={cambiar}
            error={errores.telefono}
            autoComplete="tel"
            inputMode="numeric"
          />
          <CampoFormulario
            etiqueta="Dirección"
            nombre="direccion"
            valor={datos.direccion}
            onChange={cambiar}
            error={errores.direccion}
            autoComplete="street-address"
            placeholder="Calle, número y colonia"
          />
          <CampoFormulario
            etiqueta="Código postal"
            nombre="cp"
            valor={datos.cp}
            onChange={cambiar}
            error={errores.cp}
            autoComplete="postal-code"
            inputMode="numeric"
          />

          <fieldset className="pagos">
            <legend>Método de pago</legend>
            {PAGOS.map((p) => (
              <label key={p.id} className={`pago${pago === p.id ? ' activo' : ''}`}>
                <input
                  type="radio"
                  name="pago"
                  value={p.id}
                  checked={pago === p.id}
                  onChange={() => setPago(p.id)}
                />
                <span>
                  <strong>{p.etiqueta}</strong>
                  <small>{p.detalle}</small>
                </span>
              </label>
            ))}
          </fieldset>

          <button type="submit" className="btn btn-gold">Confirmar compra</button>
        </form>

        <aside className="checkout-tarjeta resumen">
          <h2>Tu pedido</h2>
          <ul>
            {carrito.map(({ producto, cantidad }) => (
              <li key={producto.id_producto}>
                <span>{cantidad} × {producto.nombre}</span>
                <span>{dinero(Number(producto.precio) * cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="resumen-total">
            <span>Total</span>
            <strong>{dinero(total)}</strong>
          </p>
        </aside>
      </div>
    </main>
  )
}

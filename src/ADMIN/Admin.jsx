// src/pages/admin/Admin.jsx
// Pantalla principal de administración, con pestañas.
import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import AdminProductos from './AdminProductos.jsx'
import AdminVentas from './AdminVentas.jsx'
import AdminProductosVendidos from './AdminProductosVendidos.jsx'
import './Admin.css'

const PESTANAS = [
  { id: 'productos', etiqueta: 'Productos' },
  { id: 'ventas', etiqueta: 'Ventas' },
  { id: 'vendidos', etiqueta: 'Productos vendidos' },
]

export default function Admin() {
  const { usuario } = useAuth()
  const [pestana, setPestana] = useState('productos')

  // El permiso real lo valida el backend (si no eres admin, mostrará su mensaje de error)
  if (!usuario) return <Navigate to="/login" replace />

  return (
  <main className="admin-pagina">
    <div className="admin-encabezado">
    <div className="admin-cabecera">
      <Link to="/" className="admin-volver" aria-label="Volver a la tienda">
        <span aria-hidden="true">←</span>
        <span className="admin-volver-texto">Tienda</span>
      </Link>

      <h1>Panel de administración</h1>

      <span className="admin-usuario" title={usuario.nombre}>
        {usuario.nombre}
      </span>
    </div>

    <div className="admin-tabs" role="tablist">
      {PESTANAS.map((p) => (
        <button
          key={p.id}
          role="tab"
          aria-selected={pestana === p.id}
          className={`admin-tab${pestana === p.id ? ' activa' : ''}`}
          onClick={() => setPestana(p.id)}
        >
          {p.etiqueta}
        </button>
      ))}
    </div>
    </div>

    {pestana === 'productos' && <AdminProductos />}
    {pestana === 'ventas' && <AdminVentas />}
    {pestana === 'vendidos' && <AdminProductosVendidos />}
  </main>
)
}

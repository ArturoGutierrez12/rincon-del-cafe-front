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
      <header className="admin-cabecera">
        <h1>Panel de administración</h1>
        <Link to="/" className="admin-volver">← Volver a la tienda</Link>
      </header>

      <nav className="admin-tabs">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            className={`admin-tab${pestana === p.id ? ' activa' : ''}`}
            onClick={() => setPestana(p.id)}
          >
            {p.etiqueta}
          </button>
        ))}
      </nav>

      {/* Solo se monta la pestaña activa: cada una pide sus datos al abrirse */}
      {pestana === 'productos' && <AdminProductos />}
      {pestana === 'ventas' && <AdminVentas />}
      {pestana === 'vendidos' && <AdminProductosVendidos />}
    </main>
  )
}
